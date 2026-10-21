# SGP30 空气质量传感器

I2C 接口的 eCO2/TVOC 传感器，支持基线保存与恢复。

- 头文件：`ecos/device/sgp30.h`
- 总线：I2C
- 示例：`examples/peripherals/i2c/sgp30`

## 类型与常量

```c
#define ECOS_SGP30_I2C_ADDRESS 0x58u

typedef struct {
    ecos_i2c_id_t i2c;
    uint8_t address;
} ecos_sgp30_config_t;

typedef struct {
    ecos_sgp30_config_t config;
    uint8_t initialized;
} ecos_sgp30_t;

typedef struct {
    uint16_t co2_eq_ppm;   /* eCO2 浓度（ppm） */
    uint16_t tvoc_ppb;     /* TVOC 浓度（ppb） */
} ecos_sgp30_air_quality_t;

typedef struct {
    uint16_t co2_eq_baseline;   /* eCO2 基线 */
    uint16_t tvoc_baseline;     /* TVOC 基线 */
} ecos_sgp30_baseline_t;

#define ECOS_SGP30_CONFIG_DEFAULT { ECOS_I2C_DEFAULT, ECOS_SGP30_I2C_ADDRESS }
```

## 函数

```c
ecos_err_t ecos_sgp30_init(ecos_sgp30_t *sensor,
                           const ecos_sgp30_config_t *config);
ecos_err_t ecos_sgp30_deinit(ecos_sgp30_t *sensor);
ecos_err_t ecos_sgp30_read_serial_id(ecos_sgp30_t *sensor, uint64_t *serial_id);
ecos_err_t ecos_sgp30_measure_air_quality(ecos_sgp30_t *sensor,
                                          ecos_sgp30_air_quality_t *air_quality);
ecos_err_t ecos_sgp30_get_baseline(ecos_sgp30_t *sensor,
                                   ecos_sgp30_baseline_t *baseline);
ecos_err_t ecos_sgp30_set_baseline(ecos_sgp30_t *sensor,
                                   const ecos_sgp30_baseline_t *baseline);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_sgp30_init()` | probe 设备并启动 IAQ 测量 |
| `ecos_sgp30_deinit()` | 反初始化句柄 |
| `ecos_sgp30_read_serial_id()` | 读取 64 位序列号 |
| `ecos_sgp30_measure_air_quality()` | 读取一次 eCO2 与 TVOC |
| `ecos_sgp30_get_baseline()` / `set_baseline()` | 读取/恢复基线，用于缩短重新上电后的稳定时间 |

## 使用示例

```c
#include "ecos/device/sgp30.h"
#include "ecos/driver/i2c.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "sgp30"

void measure(void)
{
    ecos_sgp30_t sensor;
    ecos_sgp30_air_quality_t air;
    const ecos_sgp30_config_t config = ECOS_SGP30_CONFIG_DEFAULT;

    ecos_i2c_init(ECOS_I2C_DEFAULT, &(const ecos_i2c_config_t)ECOS_I2C_CONFIG_DEFAULT);
    ecos_sgp30_init(&sensor, &config);

    for (;;) {
        if (ecos_sgp30_measure_air_quality(&sensor, &air) == ECOS_OK)
            (void)ECOS_LOGI(LOG_TAG, "eCO2: %u ppm, TVOC: %u ppb",
                            air.co2_eq_ppm, air.tvoc_ppb);
        ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 1000u);
    }
}
```

## 注意事项

- `init` 会 probe 设备并启动 IAQ 测量；芯片启动后**前 15 秒返回默认值**
  （400 ppm / 0 ppb），属正常现象。
- 基线（baseline）可用于掉电保存/恢复，缩短再次上电的稳定时间；保存到 EEPROM 或
  Flash 的方式见 [AT24C64](at24c64.md)。
- 测量周期建议 1 秒，过于频繁的读取不会加快传感器响应。
- 通用 I2C 接口见 [I2C 主机驱动](../driver/i2c.md)。
