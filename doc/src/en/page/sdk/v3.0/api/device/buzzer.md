# Buzzer

A buzzer driver based on PWM output, responsible for converting frequency into period/divider.

- Header: `ecos/device/buzzer.h`
- Bus: PWM
- Example: `examples/peripherals/pwm/buzzer`

## Types and Constants

```c
typedef struct {
    ecos_pwm_id_t pwm;            /* PWM controller instance */
    ecos_pwm_channel_t channel;   /* output channel */
    uint32_t pwm_clock_hz;        /* PWM controller input clock, used to convert the tone */
} ecos_buzzer_config_t;

typedef struct {
    ecos_buzzer_config_t config;
    uint8_t initialized;
} ecos_buzzer_t;

/* StarrySky L4 onboard buzzer: PWM0 channel 0, SoC PWM counts by the CPU clock */
#define ECOS_BUZZER_CONFIG_DEFAULT \
    { ECOS_PWM_DEFAULT, ECOS_PWM_CHANNEL_0, 50000000u }
```

## Functions

```c
ecos_err_t ecos_buzzer_init(ecos_buzzer_t *buzzer,
                            const ecos_buzzer_config_t *config);
ecos_err_t ecos_buzzer_deinit(ecos_buzzer_t *buzzer);
ecos_err_t ecos_buzzer_play_tone(ecos_buzzer_t *buzzer, uint32_t frequency_hz);
ecos_err_t ecos_buzzer_beep(ecos_buzzer_t *buzzer, uint32_t frequency_hz,
                            uint32_t duration_ms);
ecos_err_t ecos_buzzer_stop(ecos_buzzer_t *buzzer);
```

| Function | Description |
| --- | --- |
| `ecos_buzzer_init()` | Save the configuration and initialize the dependent PWM controller, staying silent |
| `ecos_buzzer_deinit()` | Stop sounding and release the handle |
| `ecos_buzzer_play_tone()` | Sound continuously at 50% duty cycle until `stop` |
| `ecos_buzzer_beep()` | Block while sounding for `duration_ms` milliseconds, then stop automatically |
| `ecos_buzzer_stop()` | Stop sounding |

## Usage Example

```c
#include "ecos/device/buzzer.h"

void signal(void)
{
    ecos_buzzer_t buzzer;

    ecos_buzzer_init(&buzzer, &(const ecos_buzzer_config_t)
                     ECOS_BUZZER_CONFIG_DEFAULT);
    ecos_buzzer_beep(&buzzer, 1000u, 200u);   /* 1 kHz, 200 ms */
    ecos_buzzer_play_tone(&buzzer, 2000u);    /* continuous 2 kHz */
    /* ... */
    ecos_buzzer_stop(&buzzer);
}
```

## Notes

- `ecos_buzzer_init()` only saves the configuration; the buzzer stays silent until it sounds.
- The buzzer driver initializes the PWM controller itself; the application must not `init` the same PWM instance again.
- `pwm_clock_hz` must match the board's actual PWM input clock, otherwise the tone will shift; `ECOS_BUZZER_CONFIG_DEFAULT` corresponds to StarrySky L4 (50 MHz).
- For the low-level interface, see [PWM driver](../driver/pwm.md).
