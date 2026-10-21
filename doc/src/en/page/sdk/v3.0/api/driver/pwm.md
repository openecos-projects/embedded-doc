# PWM Driver

Pulse-width modulation output: configure the period and divider, and set the duty cycle per channel.

- Header: `ecos/driver/pwm.h`
- Examples: `examples/peripherals/pwm/basic`, `examples/peripherals/pwm/buzzer`

## Types and Constants

```c
typedef uint8_t ecos_pwm_id_t;               /* PWM controller instance number */

#define ECOS_PWM_DEFAULT ((ecos_pwm_id_t)0u)  /* Default instance 0 */

typedef enum {
    ECOS_PWM_CHANNEL_0 = 0,
    ECOS_PWM_CHANNEL_1,
    ECOS_PWM_CHANNEL_2,
    ECOS_PWM_CHANNEL_3,
    ECOS_PWM_CHANNEL_COUNT
} ecos_pwm_channel_t;                        /* Output channels within the controller */

typedef struct {
    uint32_t clock_divider;  /* Input clock divider */
    uint32_t period_ticks;   /* Period length (number of counter ticks) */
} ecos_pwm_config_t;

#define ECOS_PWM_CONFIG_DEFAULT { 1u, 1000u }
```

Output frequency = controller input clock / `clock_divider` / `period_ticks`.

## Functions

```c
int ecos_pwm_get_instance_count(void);
ecos_err_t ecos_pwm_init(ecos_pwm_id_t pwm, const ecos_pwm_config_t *config);
ecos_err_t ecos_pwm_set_duty_cycle(ecos_pwm_id_t pwm, ecos_pwm_channel_t channel,
                                   uint8_t duty_percent);
ecos_err_t ecos_pwm_start(ecos_pwm_id_t pwm);
ecos_err_t ecos_pwm_stop(ecos_pwm_id_t pwm);
```

| Function | Description |
| --- | --- |
| `ecos_pwm_get_instance_count()` | Return the number of PWM controllers on the current Target |
| `ecos_pwm_init()` | Configure the controller, **without starting the counter** |
| `ecos_pwm_set_duty_cycle()` | Set the channel duty cycle, range 0..100 (percent, inclusive); can also be updated while running |
| `ecos_pwm_start()` / `ecos_pwm_stop()` | Start/stop counting for the entire controller |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/pwm.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "pwm"

int main(void)
{
    const ecos_pwm_config_t config = {
        .clock_divider = 50u,
        .period_ticks = 1000u,
    };

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_pwm_init(ECOS_PWM_DEFAULT, &config),
                        "configure PWM");

    for (;;) {
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            ecos_pwm_set_duty_cycle(ECOS_PWM_DEFAULT,
                                                    ECOS_PWM_CHANNEL_0, 25u),
                            "set duty 25%");
        ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_pwm_start(ECOS_PWM_DEFAULT), "start");
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 2000u),
                            "delay");
        ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_pwm_stop(ECOS_PWM_DEFAULT), "stop");
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 2000u),
                            "delay");
    }
}
```

## Notes

- `init` only writes the configuration and does not start the output; don't forget `start`. Calling `start` again
  after `stop` reuses the previous duty cycle.
- The duty cycle is set per channel, but the period/divider are controller-level; all channels of the same
  controller share the same frequency.
- For scenarios such as buzzers and servos, prefer the [buzzer device driver](../device/buzzer.md), which performs
  tone conversion on top of this module.
