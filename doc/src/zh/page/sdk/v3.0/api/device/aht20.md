# AHT20 温湿度传感器

I2C 接口的温湿度传感器，读数以 ×100 定点数返回。

- 头文件：`ecos/device/aht20.h`
- 总线：I2C
- 示例：`examples/peripherals/i2c/aht20`

## 类型与常量

```c
#define ECOS_AHT20_I2C_ADDRESS 0x38u   /* 7 位 I2C 地址 */

typedef struct {
    ecos_i2c_id_t i2c;      /* 挂接的 I2C 控制器实例 */
    uint8_t address;        /* 设备地址 */
} ecos_aht20_config_t;

typedef struct {
    ecos_aht20_config_t config;
    uint8_t initialized;
} ecos_aht20_t;

typedef struct {
    int32_t temperature_x100;   /* 摄氏温度 ×100（定点，可为负） */
    uint32_t humidity_x100;     /* 相对湿度 % ×100（定点） */
} ecos_aht20_data_t;

#define ECOS_AHT20_CONFIG_DEFAULT { ECOS_I2C_DEFAULT, ECOS_AHT20_I2C_ADDRESS }
```

## 函数

```c
ecos_err_t ecos_aht20_init(ecos_aht20_t *sensor,
                           const ecos_aht20_config_t *config);
ecos_err_t ecos_aht20_deinit(ecos_aht20_t *sensor);
ecos_err_t ecos_aht20_read(ecos_aht20_t *sensor, ecos_aht20_data_t *data);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_aht20_init()` | 初始化句柄；调用前必须先初始化 config 中指定的 I2C 控制器 |
| `ecos_aht20_deinit()` | 反初始化句柄 |
| `ecos_aht20_read()` | 触发一次测量并返回换算后的温湿度 |

## 使用示例

```c
#include "ecos/bsp/console.h"
#include "ecos/device/aht20.h"
#include "ecos/driver/i2c.h"
#include "ecos/log.h"

#define LOG_TAG "aht20"

int main(void)
{
    const ecos_i2c_config_t bus_config = ECOS_I2C_CONFIG_DEFAULT;
    const ecos_aht20_config_t dev_config = ECOS_AHT20_CONFIG_DEFAULT;
    ecos_aht20_t sensor;
    ecos_aht20_data_t data;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_i2c_init(ECOS_I2C_DEFAULT, &bus_config),
                        "initialize I2C");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_aht20_init(&sensor, &dev_config),
                        "initialize AHT20");

    ECOS_PANIC_ON_ERROR(LOG_TAG, ecos_aht20_read(&sensor, &data), "read sensor");
    (void)ECOS_LOGI(LOG_TAG, "temperature: %d.%02d C, humidity: %u.%02u %%",
                    data.temperature_x100 / 100,
                    data.temperature_x100 % 100,
                    data.humidity_x100 / 100u,
                    data.humidity_x100 % 100u);
    for (;;) { }
}
```

## 注意事项

- 读数为 ×100 定点数，避免在裸机环境引入浮点格式化；打印整数/小数部分请自行
  拆分（示例中有参考实现）。
- `temperature_x100` 可能为负，打印时注意符号与取模方向。
- 同一 I2C 控制器只初始化一次；多个 I2C 设备各自调用自己的 `init`。
- 通用 I2C 接口见 [I2C 主机驱动](../driver/i2c.md)。
