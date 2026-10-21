# Timer Driver

Periodic timing, expiry query, and blocking delays.

- Header: `ecos/driver/timer.h`
- Example: `examples/get_start/blink` (`ecos_timer_delay_ms` is the standard delay mechanism in example programs)

## Types and Constants

```c
typedef uint8_t ecos_timer_id_t;               /* Timer instance number */

#define ECOS_TIMER_DEFAULT ((ecos_timer_id_t)0u) /* Default instance 0 */

typedef struct {
    uint32_t period_us;   /* Period (microseconds) */
} ecos_timer_config_t;

#define ECOS_TIMER_CONFIG_DEFAULT { 1000u }   /* 1 ms period */
```

## Functions

```c
int ecos_timer_get_instance_count(void);
ecos_err_t ecos_timer_init(ecos_timer_id_t timer, const ecos_timer_config_t *config);
ecos_err_t ecos_timer_deinit(ecos_timer_id_t timer);
ecos_err_t ecos_timer_start(ecos_timer_id_t timer);
ecos_err_t ecos_timer_stop(ecos_timer_id_t timer);
ecos_err_t ecos_timer_get_count(ecos_timer_id_t timer, uint32_t *count);
int ecos_timer_is_expired(ecos_timer_id_t timer);
ecos_err_t ecos_timer_delay_us(ecos_timer_id_t timer, uint32_t duration_us);
ecos_err_t ecos_timer_delay_ms(ecos_timer_id_t timer, uint32_t duration_ms);
ecos_err_t ecos_timer_delay_s(ecos_timer_id_t timer, uint32_t duration_s);
```

| Function | Description |
| --- | --- |
| `ecos_timer_get_instance_count()` | Return the number of Timer instances provided by the current Target |
| `ecos_timer_init()` / `ecos_timer_deinit()` | Initialize/deinitialize |
| `ecos_timer_start()` | Start and **restart from zero** the configured period |
| `ecos_timer_stop()` | Stop counting |
| `ecos_timer_get_count()` | Read the raw counter value; Targets that do not expose a counter value return `ECOS_ERR_UNSUPPORTED` |
| `ecos_timer_is_expired()` | Return 1 if expired, 0 if not expired, or a negative error code on failure |
| `ecos_timer_delay_us/ms/s()` | Blocking polling delay; **temporarily replaces the configuration of the selected instance** and restores it when done |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "timer"

int main(void)
{
    const ecos_timer_config_t config = ECOS_TIMER_CONFIG_DEFAULT;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_timer_init(ECOS_TIMER_DEFAULT, &config),
                        "initialize timer");
    ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_timer_start(ECOS_TIMER_DEFAULT), "start");

    for (;;) {
        int expired = ecos_timer_is_expired(ECOS_TIMER_DEFAULT);

        ECOS_PANIC_ON_ERROR(LOG_TAG, expired, "query timer");
        if (expired == 1) {
            (void)ECOS_LOGI(LOG_TAG, "period elapsed");
            ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_timer_start(ECOS_TIMER_DEFAULT),
                                "restart period");
        }
    }
}
```

If you only need a delay, there is no need to init/start; simply call
`ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 500u)` (see the blink example).

## Notes

- The polling delay functions (`delay_us/ms/s`) internally and temporarily rewrite the configuration of that Timer
  instance, so **do not mix them with periodic timing (start/is_expired) on the same instance**; use different
  instances when you need both.
- `get_count` returns `ECOS_ERR_UNSUPPORTED` on some Targets; handle this branch when porting code.
- There is no interrupt callback API; use `is_expired` polling for timing events. For periodic interrupts, see
  [Timer Periodic Interrupt](timer_interrupt.md).
- Do not mix with the 2.x legacy header `hal/timer/hal_timer.h`: its `hal_timer_config_t` conflicts with the
  identically named type in the new contract `ecos/hal/timer.h`.
