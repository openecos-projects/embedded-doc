# 错误、日志与标准骨架

核心运行时提供全 SDK 统一的错误模型（`ecos/error.h`）和日志/panic 设施
（`ecos/log.h`），是所有公共 API 的基础。

- 头文件：`ecos/error.h`、`ecos/log.h`

## 错误模型 {#error-model}

所有公共 API 使用 `ecos_err_t`（`int32_t`）作为统一返回值：

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

返回值约定：

- **0**（`ECOS_OK`）：成功；
- **正数**：成功且携带数据，例如读写字节数、`ecos_i2c_probe` 的 ACK 结果、
  `ecos_uart_try_read` 是否读到字节；
- **负数**：失败，取值为 `ECOS_ERR_*` 系列错误码。

| 错误码 | 含义 |
| --- | --- |
| `ECOS_OK` | 成功 |
| `ECOS_ERR_INVALID_ARGUMENT` | 参数非法 |
| `ECOS_ERR_UNSUPPORTED` | 当前 Target/平台不支持该操作 |
| `ECOS_ERR_NOT_INITIALIZED` | 模块/实例尚未初始化 |
| `ECOS_ERR_IO` | 底层 IO 错误 |
| `ECOS_ERR_TIMEOUT` | 超时 |
| `ECOS_ERR_BUSY` | 资源忙 |
| `ECOS_ERR_NO_MEMORY` | 内存不足 |
| `ECOS_ERR_NOT_FOUND` | 未找到目标（实例、设备等） |
| `ECOS_ERR_INVALID_STATE` | 当前状态不允许该操作 |
| `ECOS_ERR_INTERNAL` | SDK 内部错误 |

### 结果判定与可读化

```c
bool ecos_result_succeeded(int result);
bool ecos_result_failed(int result);
bool ecos_err_is_known(int result);
const char *ecos_err_name(ecos_err_t error);
const char *ecos_err_description(ecos_err_t error);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_result_succeeded()` / `ecos_result_failed()` | 按“非负成功、负数失败”判定任意返回值；携带正数负载的成功值也算成功 |
| `ecos_err_is_known()` | 判断是否为已定义的 `ECOS_ERR_*` 值 |
| `ecos_err_name()` / `ecos_err_description()` | 返回错误码的名称与描述字符串（静态存储期，调用者不得修改） |

### 控制流宏

```c
ECOS_RETURN_ON_ERROR(result_expression)
ECOS_GOTO_ON_ERROR(result_expression, error_variable, label)
ECOS_PANIC_ON_ERROR(tag, result_expression, operation)
```

| 宏 | 说明 |
| --- | --- |
| `ECOS_RETURN_ON_ERROR` | 表达式失败时以其错误码作为本函数的返回值；表达式只求值一次 |
| `ECOS_GOTO_ON_ERROR` | 失败时把错误码赋给 `error_variable`（须为可赋值的 `int`/`ecos_err_t` 左值）并 `goto label`，用于集中清理 |
| `ECOS_PANIC_ON_ERROR` | 失败时先 `ECOS_LOG_ERR` 打印错误，再停机；示例程序的标准错误处理方式 |

## 日志与 panic

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

- `ecos_log_level_t`：日志级别，DEBUG 最低、OFF 关闭全部输出。
- `ecos_log_writer_t`：日志输出回调，返回接受的字节数或负错误码。
- `ecos_panic_handler_t`：panic 钩子回调。

### 运行时控制

```c
ecos_err_t ecos_log_set_level(ecos_log_level_t level);
ecos_log_level_t ecos_log_get_level(void);
ecos_err_t ecos_log_set_writer(ecos_log_writer_t writer, void *context);
void ecos_panic_set_handler(ecos_panic_handler_t handler, void *context);
void ecos_panic(void);  /* noreturn */
```

| 函数 | 说明 |
| --- | --- |
| `ecos_log_set_level()` / `ecos_log_get_level()` | 运行时日志级别门限 |
| `ecos_log_set_writer()` | 替换日志输出通道（默认写到控制台） |
| `ecos_panic_set_handler()` | 注册停机前钩子（如熄屏、复位外设、进入安全态） |
| `ecos_panic()` | 输出致命信息后停机，永不返回 |

### 底层写接口

```c
int ecos_log_vwrite(ecos_log_level_t level, const char *tag,
                    const char *file, int line,
                    const char *format, va_list arguments);
int ecos_log_write(ecos_log_level_t level, const char *tag,
                   const char *file, int line, const char *format, ...);
int ecos_log_error(const char *tag, ecos_err_t error, const char *operation,
                   const char *file, int line);
```

一般直接使用下面的宏，而不是手写 `__FILE__` / `__LINE__`。

### 日志宏

| 宏 | 级别 | 说明 |
| --- | --- | --- |
| `ECOS_LOGD(tag, ...)` | DEBUG | 调试信息 |
| `ECOS_LOGI(tag, ...)` | INFO | 常规进度信息 |
| `ECOS_LOGW(tag, ...)` | WARN | 警告 |
| `ECOS_LOGE(tag, ...)` | ERROR | 错误 |
| `ECOS_LOGF(tag, ...)` | FATAL | 致命错误 |
| `ECOS_LOG_ERR(tag, error, operation)` | ERROR | 打印错误码的名称/描述与出错操作 |
| `ECOS_PANIC(tag, ...)` | FATAL | 输出致命日志并调用 `ecos_panic()` |

- 默认日志输出到 BSP Console；`bsp_console_init()` 成功后自动接管。
- 默认输出 ASCII、CRLF，不启用 ANSI 颜色。
- 编译期门限为 `CONFIG_ECOS_LOG_LEVEL`（默认 1 = INFO）。级别高于门限的日志宏
  会被编译为空操作，因此建议写成 `(void)ECOS_LOGI(...)`，以同时适应两种展开。
- `ECOS_LOG_ERR()` 在 `CONFIG_ECOS_LOG_LEVEL` 高于 ERROR 级别时展开为空；
  `ECOS_PANIC_ON_ERROR()` 始终生效，不受日志门限影响。
- 日志和 panic 默认不支持在中断处理函数中调用，除非自定义 writer 支持。
- 量产固件可通过 `ecos_panic_set_handler()` 注册停机前钩子（如进入安全态）。

### 内部兼容包装

`components/core/include/log.h`（注意：不是 `ecos/log.h`）保留了旧日志接口的
`LogLevel`、`log_init()`、`log_print()`、`log_close()` 与
`log_debug/info/warn/error/fatal` 宏，全部标记 `deprecated`，仅供内部兼容。
新应用不要使用。

## 标准应用骨架

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

需要区分错误并继续执行时，可改用显式判定：

```c
#include "ecos/error.h"
#include "ecos/log.h"

#define LOG_TAG "demo"

static ecos_err_t may_fail(void)
{
    return ECOS_ERR_TIMEOUT; /* 举例 */
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

## 注意事项

- **0 表示成功，正数表示成功且携带数据**。不要用 `if (result)` 判断失败，应使用
  `ecos_result_failed()` 或与 `ECOS_OK` 比较。
- 裸机单线程运行时：日志与 panic 不支持在中断处理函数中调用，除非自行安装的
  writer 支持。
- 需要完全静默的固件可把 `CONFIG_ECOS_LOG_LEVEL` 调到 `ECOS_LOG_OFF` 对应值，
  全部日志宏编译期消失。
- `ecos_panic()` 的默认行为是停机死循环；量产固件建议用
  `ecos_panic_set_handler()` 登记看门狗喂狗或安全态切换逻辑。
