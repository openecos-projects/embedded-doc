# 示例工程

## Example 清单

`ecos project list` 会从清单实时解析 Example 与 Board 的兼容关系。当前 SDK 中的
Example 名称如下：

| 分类 | Example 名称 |
| --- | --- |
| 入门 | `hello`、`blink` |
| 显示 | `display-donut` |
| 外设 | `archinfo-chip-id`、`button-state`、`gpio-basic`、`gpio-interrupt`、`gpio-tm1650`、`pwm-basic`、`pwm-buzzer`、`ps2-keycodes`、`rcu-pll`、`rcu-status`、`rng-random`、`rtc-counter`、`timer-interrupt`、`wdg-reset` |
| 总线与存储 | `i2c-scan`、`i2c-aht20`、`i2c-at24c64`、`i2c-pcf8563`、`i2c-sgp30`、`soft-spi-jedec-id`、`spi-master-st7735`、`spi-master-st7789`、`flash-sfud` |
| 中断与系统 | `plic`、`clint-clock`、`sdram-init`、`crc-compute` |
| 通信 | `uart-esp01s` |
| 并发与 Shell | `coroutine-smoke`、`letter-shell-smoke` |
| 综合应用 | `llm-chat`、`text-editor`、`flash-fatfs`、`fcc` |

创建示例工程：

```bash
ecos project list
ecos project create blink --name myblink --board starrysky-l4-c1
cd myblink
ecos build
```

Example 名称全局唯一，创建时只使用清单中的 `name`，不带 `get_start/` 等父目录。
`letter-shell-smoke`、`text-editor`、`flash-fatfs`、`fcc` 依赖首发 release 暂未包含的
组件，需在 development checkout 中使用。

## 完整示例：blink

下面是一个完整的 `blink` 应用，演示 Console、Timer 和 LED BSP 的组合：

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

从零创建工程见[快速上手](quickstart.md)。
