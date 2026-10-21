# Example Projects

## Example Manifest

`ecos project list` resolves Example-to-Board compatibility from the manifests in real time. The Example names in the current SDK are as follows:

| Category | Example names |
| --- | --- |
| Getting Started | `hello`, `blink` |
| Display | `display-donut` |
| Peripherals | `archinfo-chip-id`, `button-state`, `gpio-basic`, `gpio-interrupt`, `gpio-tm1650`, `pwm-basic`, `pwm-buzzer`, `ps2-keycodes`, `rcu-pll`, `rcu-status`, `rng-random`, `rtc-counter`, `timer-interrupt`, `wdg-reset` |
| Buses and Storage | `i2c-scan`, `i2c-aht20`, `i2c-at24c64`, `i2c-pcf8563`, `i2c-sgp30`, `soft-spi-jedec-id`, `spi-master-st7735`, `spi-master-st7789`, `flash-sfud` |
| Interrupts and System | `plic`, `clint-clock`, `sdram-init`, `crc-compute` |
| Communication | `uart-esp01s` |
| Concurrency and Shell | `coroutine-smoke`, `letter-shell-smoke` |
| Integrated Applications | `llm-chat`, `text-editor`, `flash-fatfs`, `fcc` |

Create an Example project:

```bash
ecos project list
ecos project create blink --name myblink --board starrysky-l4-c1
cd myblink
ecos build
```

Example names are globally unique; when creating a project, use only the `name` from the manifest, without parent directories such as `get_start/`. `letter-shell-smoke`, `text-editor`, `flash-fatfs`, and `fcc` depend on components not yet included in the initial release and must be used in a development checkout.

## Complete Example: blink

The following is a complete `blink` application demonstrating the combination of Console, Timer, and LED BSP:

```c
#include "ecos/bsp/console.h"
#include "ecos/bsp/led.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define BLINK_DELAY_MS 500u
#define LOG_TAG "blink"

int main(void)
{
    int timer_count;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    (void)ECOS_LOGI(LOG_TAG, "Starting blink example");

    timer_count = ecos_timer_get_instance_count();
    ECOS_PANIC_ON_ERROR(LOG_TAG, timer_count, "query timers");
    if (timer_count < 1)
        ECOS_PANIC_ON_ERROR(LOG_TAG, ECOS_ERR_NOT_FOUND, "find default timer");

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_led_init(), "initialize LED");
    (void)ECOS_LOGI(LOG_TAG, "Blinking LED 0 every %u ms", BLINK_DELAY_MS);

    for (;;) {
        ECOS_PANIC_ON_ERROR(
            LOG_TAG, bsp_led_set_state(BSP_LED_0, BSP_LED_ON), "turn LED on"
        );
        ECOS_PANIC_ON_ERROR(
            LOG_TAG, ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, BLINK_DELAY_MS),
            "wait after turning LED on"
        );
        ECOS_PANIC_ON_ERROR(
            LOG_TAG, bsp_led_set_state(BSP_LED_0, BSP_LED_OFF), "turn LED off"
        );
        ECOS_PANIC_ON_ERROR(
            LOG_TAG, ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, BLINK_DELAY_MS),
            "wait after turning LED off"
        );
    }
}
```

To create a project from scratch, see [Quick Start](quickstart.md).
