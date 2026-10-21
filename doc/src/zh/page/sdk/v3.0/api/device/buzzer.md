# 蜂鸣器

基于 PWM 输出的蜂鸣器驱动，负责频率到周期/分频的换算。

- 头文件：`ecos/device/buzzer.h`
- 总线：PWM
- 示例：`examples/peripherals/pwm/buzzer`

## 类型与常量

```c
typedef struct {
    ecos_pwm_id_t pwm;            /* PWM 控制器实例 */
    ecos_pwm_channel_t channel;   /* 输出通道 */
    uint32_t pwm_clock_hz;        /* PWM 控制器输入时钟，用于换算音调 */
} ecos_buzzer_config_t;

typedef struct {
    ecos_buzzer_config_t config;
    uint8_t initialized;
} ecos_buzzer_t;

/* StarrySky L4 板载蜂鸣器：PWM0 通道 0，SoC PWM 按 CPU 时钟计数 */
#define ECOS_BUZZER_CONFIG_DEFAULT \
    { ECOS_PWM_DEFAULT, ECOS_PWM_CHANNEL_0, 50000000u }
```

## 函数

```c
ecos_err_t ecos_buzzer_init(ecos_buzzer_t *buzzer,
                            const ecos_buzzer_config_t *config);
ecos_err_t ecos_buzzer_deinit(ecos_buzzer_t *buzzer);
ecos_err_t ecos_buzzer_play_tone(ecos_buzzer_t *buzzer, uint32_t frequency_hz);
ecos_err_t ecos_buzzer_beep(ecos_buzzer_t *buzzer, uint32_t frequency_hz,
                            uint32_t duration_ms);
ecos_err_t ecos_buzzer_stop(ecos_buzzer_t *buzzer);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_buzzer_init()` | 保存配置并初始化依赖的 PWM 控制器，保持静默 |
| `ecos_buzzer_deinit()` | 停止发声并释放句柄 |
| `ecos_buzzer_play_tone()` | 以 50% 占空比持续发声，直到 `stop` |
| `ecos_buzzer_beep()` | 阻塞发声 `duration_ms` 毫秒后自动停止 |
| `ecos_buzzer_stop()` | 停止发声 |

## 使用示例

```c
#include "ecos/device/buzzer.h"

void signal(void)
{
    ecos_buzzer_t buzzer;

    ecos_buzzer_init(&buzzer, &(const ecos_buzzer_config_t)
                     ECOS_BUZZER_CONFIG_DEFAULT);
    ecos_buzzer_beep(&buzzer, 1000u, 200u);   /* 1 kHz，200 ms */
    ecos_buzzer_play_tone(&buzzer, 2000u);    /* 持续 2 kHz */
    /* ... */
    ecos_buzzer_stop(&buzzer);
}
```

## 注意事项

- `ecos_buzzer_init()` 只保存配置，蜂鸣器保持静默直到发声。
- 蜂鸣器驱动自行初始化 PWM 控制器，应用不要再对同一 PWM 实例 `init`。
- `pwm_clock_hz` 必须与板卡实际 PWM 输入时钟一致，否则音调会偏移；
  `ECOS_BUZZER_CONFIG_DEFAULT` 对应 StarrySky L4（50 MHz）。
- 底层接口见 [PWM 驱动](../driver/pwm.md)。
