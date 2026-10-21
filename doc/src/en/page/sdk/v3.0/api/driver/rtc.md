# RTC Driver

A free-running counter plus alarm comparison (not a calendar clock).

- Header: `ecos/driver/rtc.h`
- Example: `examples/peripherals/rtc/counter`

## Types and Constants

```c
typedef enum {
    ECOS_RTC_ID_0 = 0,   /* the only instance */
    ECOS_RTC_ID_COUNT
} ecos_rtc_id_t;

#define ECOS_RTC_DEFAULT ((ecos_rtc_id_t)ECOS_RTC_ID_0)

typedef struct {
    uint32_t prescaler;      /* input clock divider ratio; 1 means no division */
    uint8_t alarm_enabled;   /* non-zero enables alarm triggering */
} ecos_rtc_config_t;

#define ECOS_RTC_CONFIG_DEFAULT { 1u, 0u }
```

## Functions

```c
ecos_err_t ecos_rtc_init(ecos_rtc_id_t id, const ecos_rtc_config_t *config);
ecos_err_t ecos_rtc_deinit(ecos_rtc_id_t id);
ecos_err_t ecos_rtc_get_counter(ecos_rtc_id_t id, uint32_t *counter);
ecos_err_t ecos_rtc_set_counter(ecos_rtc_id_t id, uint32_t counter);
ecos_err_t ecos_rtc_set_alarm(ecos_rtc_id_t id, uint32_t alarm);
int ecos_rtc_alarm_triggered(ecos_rtc_id_t id);
```

| Function | Description |
| --- | --- |
| `ecos_rtc_init()` | Configure the divider ratio and start counting; when `alarm_enabled` is non-zero, also enable alarm triggering |
| `ecos_rtc_get_counter()` / `set_counter()` | Read/write the counter |
| `ecos_rtc_set_alarm()` | Set the alarm compare value (triggered when the count value reaches it) |
| `ecos_rtc_alarm_triggered()` | Returns 1 when triggered, 0 when not triggered, and a negative error code on failure |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/rtc.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "rtc"

int main(void)
{
    const ecos_rtc_config_t config = { 50000u, 0u };  /* 1 kHz with a 50 MHz input */
    uint32_t before;
    uint32_t after;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rtc_init(ECOS_RTC_DEFAULT, &config),
                        "initialize RTC");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rtc_get_counter(ECOS_RTC_DEFAULT, &before),
                        "read counter");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 100u),
                        "delay");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_rtc_get_counter(ECOS_RTC_DEFAULT, &after),
                        "re-read counter");
    (void)ECOS_LOGI(LOG_TAG, "counter: %u -> %u", before, after);
    for (;;) { }
}
```

## Notes

- This IP is a counter plus alarm comparison, **not a calendar clock**; for calendar functionality use an external RTC device (such as [PCF8563](../device/pcf8563.md)).
- Counting frequency = input clock / `prescaler`; the input clock source is SoC-defined.
- Poll the alarm status with `ecos_rtc_alarm_triggered()`; there is no interrupt callback API.
- ysyx-l3-1, ysyx-2512-1 and ysyx-2512-2 provide this IP; CL1-2512 (T1-Pico) does not.
- Do not mix with the 2.x legacy header `hal/rtc/hal_rtc.h`.
