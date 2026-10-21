# Errors, Logging and Standard Skeleton

The core runtime provides the error model shared across the entire SDK (`ecos/error.h`) and the logging/panic facilities (`ecos/log.h`); these are the foundation of all public APIs.

- Headers: `ecos/error.h`, `ecos/log.h`

## Error Model {#error-model}

All public APIs use `ecos_err_t` (`int32_t`) as the unified return value:

```c
#include "ecos/error.h"

typedef int32_t ecos_err_t;

enum {
    ECOS_OK = 0,
    ECOS_ERR_INVALID_ARGUMENT = -1,
    ECOS_ERR_UNSUPPORTED      = -2,
    ECOS_ERR_NOT_INITIALIZED  = -3,
    ECOS_ERR_IO               = -4,
    ECOS_ERR_TIMEOUT          = -5,
    ECOS_ERR_BUSY             = -6,
    ECOS_ERR_NO_MEMORY        = -7,
    ECOS_ERR_NOT_FOUND        = -8,
    ECOS_ERR_INVALID_STATE    = -9,
    ECOS_ERR_INTERNAL         = -10
};
```

Return value conventions:

- **0** (`ECOS_OK`): success;
- **Positive**: success carrying data, such as the number of bytes read or written, the ACK result of `ecos_i2c_probe`, or whether `ecos_uart_try_read` read a byte;
- **Negative**: failure, with a value from the `ECOS_ERR_*` error code family.

| Error Code | Meaning |
| --- | --- |
| `ECOS_OK` | Success |
| `ECOS_ERR_INVALID_ARGUMENT` | Invalid argument |
| `ECOS_ERR_UNSUPPORTED` | The current Target/platform does not support this operation |
| `ECOS_ERR_NOT_INITIALIZED` | The module/instance has not been initialized |
| `ECOS_ERR_IO` | Low-level IO error |
| `ECOS_ERR_TIMEOUT` | Timeout |
| `ECOS_ERR_BUSY` | Resource busy |
| `ECOS_ERR_NO_MEMORY` | Out of memory |
| `ECOS_ERR_NOT_FOUND` | Requested object not found (instance, device, etc.) |
| `ECOS_ERR_INVALID_STATE` | The current state does not permit this operation |
| `ECOS_ERR_INTERNAL` | SDK internal error |

### Result Checking and Readability

```c
bool ecos_result_succeeded(int result);
bool ecos_result_failed(int result);
bool ecos_err_is_known(int result);
const char *ecos_err_name(ecos_err_t error);
const char *ecos_err_description(ecos_err_t error);
```

| Function | Description |
| --- | --- |
| `ecos_result_succeeded()` / `ecos_result_failed()` | Check any return value according to "non-negative is success, negative is failure"; a successful value carrying a positive payload also counts as success |
| `ecos_err_is_known()` | Determines whether the value is a defined `ECOS_ERR_*` value |
| `ecos_err_name()` / `ecos_err_description()` | Return the name and description string of the error code (static storage duration; the caller must not modify them) |

### Control-Flow Macros

```c
ECOS_RETURN_ON_ERROR(result_expression)
ECOS_GOTO_ON_ERROR(result_expression, error_variable, label)
ECOS_PANIC_ON_ERROR(tag, result_expression, operation)
```

| Macro | Description |
| --- | --- |
| `ECOS_RETURN_ON_ERROR` | If the expression fails, use its error code as this function's return value; the expression is evaluated only once |
| `ECOS_GOTO_ON_ERROR` | On failure, assign the error code to `error_variable` (must be an assignable `int`/`ecos_err_t` lvalue) and `goto label`, for centralized cleanup |
| `ECOS_PANIC_ON_ERROR` | On failure, first print the error with `ECOS_LOG_ERR`, then halt; the standard error handling method for example programs |

## Logging and Panic

```c
#include "ecos/log.h"

typedef enum {
    ECOS_LOG_DEBUG = 0,
    ECOS_LOG_INFO,
    ECOS_LOG_WARN,
    ECOS_LOG_ERROR,
    ECOS_LOG_FATAL,
    ECOS_LOG_OFF
} ecos_log_level_t;

typedef int (*ecos_log_writer_t)(void *context, const char *data, size_t size);
typedef void (*ecos_panic_handler_t)(void *context);
```

- `ecos_log_level_t`: log level; DEBUG is the lowest, and OFF disables all output.
- `ecos_log_writer_t`: log output callback, returning the number of bytes accepted or a negative error code.
- `ecos_panic_handler_t`: panic hook callback.

### Runtime Control

```c
ecos_err_t ecos_log_set_level(ecos_log_level_t level);
ecos_log_level_t ecos_log_get_level(void);
ecos_err_t ecos_log_set_writer(ecos_log_writer_t writer, void *context);
void ecos_panic_set_handler(ecos_panic_handler_t handler, void *context);
void ecos_panic(void);  /* noreturn */
```

| Function | Description |
| --- | --- |
| `ecos_log_set_level()` / `ecos_log_get_level()` | Runtime log level threshold |
| `ecos_log_set_writer()` | Replace the log output channel (defaults to writing to the console) |
| `ecos_panic_set_handler()` | Register a pre-halt hook (e.g. turn off the display, reset peripherals, enter a safe state) |
| `ecos_panic()` | Output fatal information and then halt; never returns |

### Low-Level Write Interface

```c
int ecos_log_vwrite(ecos_log_level_t level, const char *tag,
                    const char *file, int line,
                    const char *format, va_list arguments);
int ecos_log_write(ecos_log_level_t level, const char *tag,
                   const char *file, int line, const char *format, ...);
int ecos_log_error(const char *tag, ecos_err_t error, const char *operation,
                   const char *file, int line);
```

In general, use the macros below directly instead of writing `__FILE__` / `__LINE__` by hand.

### Logging Macros

| Macro | Level | Description |
| --- | --- | --- |
| `ECOS_LOGD(tag, ...)` | DEBUG | Debug information |
| `ECOS_LOGI(tag, ...)` | INFO | Routine progress information |
| `ECOS_LOGW(tag, ...)` | WARN | Warning |
| `ECOS_LOGE(tag, ...)` | ERROR | Error |
| `ECOS_LOGF(tag, ...)` | FATAL | Fatal error |
| `ECOS_LOG_ERR(tag, error, operation)` | ERROR | Print the name/description of the error code and the failing operation |
| `ECOS_PANIC(tag, ...)` | FATAL | Output a fatal log and call `ecos_panic()` |

- By default, logs are output to the BSP Console; after `bsp_console_init()` succeeds, it takes over automatically.
- By default, output is ASCII, CRLF, with ANSI colors disabled.
- The compile-time threshold is `CONFIG_ECOS_LOG_LEVEL` (default 1 = INFO). Log macros above the threshold are compiled to no-ops, so it is recommended to write `(void)ECOS_LOGI(...)` to accommodate both expansions.
- `ECOS_LOG_ERR()` expands to nothing when `CONFIG_ECOS_LOG_LEVEL` is above the ERROR level; `ECOS_PANIC_ON_ERROR()` always takes effect and is not affected by the log threshold.
- Logging and panic are by default not supported for calls from interrupt handlers, unless a custom writer supports it.
- Production firmware can register a pre-halt hook via `ecos_panic_set_handler()` (e.g. entering a safe state).

### Internal Compatibility Wrapper

`components/core/include/log.h` (note: not `ecos/log.h`) retains the old logging interface's `LogLevel`, `log_init()`, `log_print()`, `log_close()`, and `log_debug/info/warn/error/fatal` macros, all marked `deprecated`, for internal compatibility only. New applications must not use them.

## Standard Application Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "app"

int main(void)
{
    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    (void)ECOS_LOGI(LOG_TAG, "application started");

    for (;;) {
        ECOS_PANIC_ON_ERROR(
            LOG_TAG,
            ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 1000u),
            "delay"
        );
    }
}
```

When errors must be distinguished and execution continued, use explicit checks instead:

```c
#include "ecos/error.h"
#include "ecos/log.h"

#define LOG_TAG "demo"

static ecos_err_t may_fail(void)
{
    return ECOS_ERR_TIMEOUT; /* example */
}

int main(void)
{
    ecos_err_t err = may_fail();

    if (ecos_result_failed(err))
        (void)ECOS_LOG_ERR(LOG_TAG, err, "run may_fail");
    else
        (void)ECOS_LOGI(LOG_TAG, "ok");

    for (;;)
        __asm__ volatile("nop");
}
```

## Notes

- **0 means success, and a positive value means success carrying data**. Do not use `if (result)` to test for failure; use `ecos_result_failed()` or compare against `ECOS_OK`.
- Bare-metal single-threaded runtime: logging and panic do not support calls from interrupt handlers unless the writer you install supports it.
- Firmware that must be completely silent can set `CONFIG_ECOS_LOG_LEVEL` to the value corresponding to `ECOS_LOG_OFF`, and all log macros disappear at compile time.
- The default behavior of `ecos_panic()` is a halt loop; production firmware is advised to use `ecos_panic_set_handler()` to register watchdog feeding or safe-state switching logic.
