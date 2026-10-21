# WDG Watchdog Driver

Hardware watchdog: configure the timeout, feed the watchdog, and query status.

- Header: `ecos/driver/wdg.h`
- Example: `examples/peripherals/wdg/reset`
- Currently only StarrySky L3.1 declares WDG capability

## Types and Constants

```c
typedef enum {
    ECOS_WDG_ID_0 = 0,   /* the only instance */
    ECOS_WDG_ID_COUNT
} ecos_wdg_id_t;

#define ECOS_WDG_DEFAULT ((ecos_wdg_id_t)ECOS_WDG_ID_0)

typedef struct {
    uint32_t prescaler;   /* prescaler value, must be non-zero */
    uint32_t compare;     /* compare value, must be non-zero */
    uint32_t control;     /* raw SoC control word */
} ecos_wdg_config_t;

#define ECOS_WDG_CONFIG_DEFAULT { 100u, 500u, 0x5u }
```

`prescaler` and `compare` are expressed as the actual divider/compare counts; the value written to the hardware register is the parameter minus one, so both must be non-zero. `control` is the raw SoC control word; the default `0x5` follows the legacy reset routine.

## Functions

```c
ecos_err_t ecos_wdg_init(ecos_wdg_id_t id, const ecos_wdg_config_t *config);
ecos_err_t ecos_wdg_deinit(ecos_wdg_id_t id);
ecos_err_t ecos_wdg_feed(ecos_wdg_id_t id);
ecos_err_t ecos_wdg_get_status(ecos_wdg_id_t id, uint32_t *status);
```

| Function | Description |
| --- | --- |
| `ecos_wdg_init()` | Unlock and configure the watchdog, starting the counter |
| `ecos_wdg_deinit()` | Unlock and disable the watchdog |
| `ecos_wdg_feed()` | Feed the watchdog, reloading the counter |
| `ecos_wdg_get_status()` | Read the status register |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/wdg.h"
#include "ecos/log.h"

#define LOG_TAG "wdg"

int main(void)
{
    const ecos_wdg_config_t config = ECOS_WDG_CONFIG_DEFAULT;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_wdg_init(ECOS_WDG_DEFAULT, &config),
                        "initialize watchdog");

    for (;;) {
        ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_wdg_feed(ECOS_WDG_DEFAULT), "feed");
        /* Periodic work... */
    }
}
```

## Notes

- Before every configuration, feed, and disable, the driver writes the unlock key of the legacy project; feeding writes `1` and then `0` to FEED following the legacy sequence.
- The reset example starts the watchdog and may reset the development board at runtime; when debugging, confirm the timeout parameters first.
- Once the watchdog is started, any operation that blocks the main loop for an extended period may trigger a reset.
