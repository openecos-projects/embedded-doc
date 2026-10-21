# Device 驱动

Device Driver 通过公共 Driver 访问外部器件，不直接依赖具体 Board 的引脚。

- 头文件：`ecos/device/*.h`
- 示例：`examples/peripherals/i2c/*`、`examples/peripherals/pwm/buzzer`、
  `examples/peripherals/spi_master/*`

## 器件索引

| 器件 | 头文件 | 总线 | 说明 |
| --- | --- | --- | --- |
| [AHT20](device/aht20.md) | `ecos/device/aht20.h` | I2C | 温湿度传感器 |
| [AT24C64](device/at24c64.md) | `ecos/device/at24c64.h` | I2C | 8 KB EEPROM |
| [SGP30](device/sgp30.md) | `ecos/device/sgp30.h` | I2C | 空气质量传感器 |
| [PCF8563](device/pcf8563.md) | `ecos/device/pcf8563.h` | I2C | RTC 时钟芯片 |
| [Buzzer](device/buzzer.md) | `ecos/device/buzzer.h` | PWM | 蜂鸣器 |
| [ESP01S](device/esp01s.md) | `ecos/device/esp01s_at.h` | UART | AT 指令 Wi-Fi 模组 |
| [ST7735](device/st7735.md) | `ecos/device/st7735.h` | QSPI | 128×128 TFT 显示屏 |
| [ST7789](device/st7789.md) | `ecos/device/st7789.h` | QSPI | 240×240 TFT 显示屏 |
| [TM1650](device/tm1650.md) | `ecos/device/tm1650.h` | GPIO | 四位数码管 |

## 通用模式

所有设备驱动遵循同一结构：

- **config 结构体** `ecos_<dev>_config_t`：指定挂接的总线实例与芯片参数
  （I2C 地址、PWM 通道、QSPI 片选、GPIO 引脚等）；
- **默认值宏** `ECOS_<DEV>_CONFIG_DEFAULT`：对常见板卡接线的默认初始化器；
- **句柄结构体** `ecos_<dev>_t`：内含 `config` 副本与 `initialized` 标志，由应用
  持有并传给每个 API；
- 所有函数返回 `ecos_err_t`（见 [错误模型](core.md#error-model)）。

使用顺序固定为：**应用先初始化总线 Driver**（如 `ecos_i2c_init`），**再调用
`ecos_<dev>_init`**：

```c
const ecos_i2c_config_t bus_config = ECOS_I2C_CONFIG_DEFAULT;
const ecos_aht20_config_t dev_config = ECOS_AHT20_CONFIG_DEFAULT;
ecos_aht20_t sensor;

ECOS_PANIC_ON_ERROR(TAG, ecos_i2c_init(ECOS_I2C_DEFAULT, &bus_config), "i2c");
ECOS_PANIC_ON_ERROR(TAG, ecos_aht20_init(&sensor, &dev_config), "aht20");
```

## 按总线分组

### I2C 器件

同一条 I2C 总线上的多个器件共用一次 `ecos_i2c_init()`，随后各自初始化：

- [AHT20 温湿度传感器](device/aht20.md)
- [AT24C64 EEPROM](device/at24c64.md)
- [SGP30 空气质量传感器](device/sgp30.md)
- [PCF8563 RTC](device/pcf8563.md)

### 显示与指示

- [ST7735 TFT](device/st7735.md) / [ST7789 TFT](device/st7789.md)
- [TM1650 数码管](device/tm1650.md)
- [Buzzer 蜂鸣器](device/buzzer.md)

### 通信模组

- [ESP01S Wi-Fi 模组](device/esp01s.md)

## 注意事项

- 所有 I2C 设备共用总线时，`ecos_i2c_init` 只调用一次，各设备驱动分别
  `ecos_<dev>_init`。
- 设备句柄（`ecos_<dev>_t`）由应用分配，可放静态区；不要在多任务/中断中并发
  访问同一句柄（SDK 为单线程裸机模型）。
- 显示与模组类驱动（ST7735/ST7789/ESP01S）内部会初始化其依赖的总线/引脚；与其
  共用一个控制器实例时要避免重复初始化。
- 兼容旧行为的内部头文件不属于本页 API；新应用请使用 `ecos/device/*.h`。
- 应用向组件（heap、FatFs、Shell、soft-spi 等）见 [Component 组件](components.md)。
