# Device 与 Component

## Device Driver

Device Driver 通过公共 Driver 访问外部器件，不直接依赖具体 Board 的引脚：

| 器件 | 头文件 | 说明 |
| --- | --- | --- |
| AHT20 | `ecos/device/aht20.h` | 温湿度传感器 |
| AT24C64 | `ecos/device/at24c64.h` | I2C EEPROM |
| SGP30 | `ecos/device/sgp30.h` | 气体传感器 |
| PCF8563 | `ecos/device/pcf8563.h` | RTC 时钟芯片 |
| ST7735 | `ecos/device/st7735.h` | SPI TFT 显示屏 |
| ST7789 | `ecos/device/st7789.h` | SPI TFT 显示屏 |
| TM1650 | `ecos/device/tm1650.h` | 数码管驱动 |
| Buzzer | `ecos/device/buzzer.h` | 蜂鸣器 |
| ESP-01S | `ecos/device/esp01s_at.h` | AT 指令 Wi-Fi 模块 |

设备驱动通过配置结构体中的总线实例 ID 指定挂载点。**必须先初始化总线 Driver，
再初始化 Device Driver**：

```c
ecos_i2c_init(&i2c_config);
ecos_aht20_init(&aht20, &aht20_config);  /* aht20_config.i2c = 0 */
```

## Component

| 组件 | 头文件 | 说明 |
| --- | --- | --- |
| Core Runtime | `ecos/error.h`、`ecos/log.h` | 错误码、日志与 panic，默认组件 |
| libc 子集 | `string.h`、`stdio.h`、`assert.h` | 裸机编译所需的内存和字符串操作 |
| libgcc | `libgcc.h` | 乘除法、移位等运行时支持 |
| heap | `ecos/heap.h` | 堆内存管理 |
| SFUD | `sfud.h` | 串行 Flash 通用驱动 |
| FatFs | `ff.h`、`diskio.h` | FAT 文件系统 |
| Letter-Shell | `shell.h` | 命令行交互 |
| letter-shell-fs | `ecos/shell/fs.h` | Shell 文件系统扩展 |
| soft SPI | `ecos/soft_spi.h` | 软件 SPI |
| LightCoroutine | `coroutine.h` | 协程 |
| text-editor | `text_editor.h` | 文本编辑器 |
| FCC | `fcc.h` | 应用向组件 |

!!! note "首批 release 的组件范围"

    当前 `tools/sdk-manifest.json` 的 `release.exclude` 在首发发布包中排除了
    FatFs、FCC、Letter-Shell、letter-shell-fs 和 text-editor；这些组件目前
    需要在 development checkout 中使用。以后续版本的清单为准。

底层外设接口见[Driver 驱动层](driver.md)。
