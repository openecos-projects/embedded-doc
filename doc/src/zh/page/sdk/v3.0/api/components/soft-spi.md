# soft-spi 软件 SPI

GPIO 位 bang 实现的 SPI 主机，替代旧的固定引脚 `spi_software`。

- 组件 ID：`soft-spi`
- 头文件：`ecos/soft_spi.h`
- 依赖：`driver-gpio`
- 资源：Board 清单中的 `soft-spi-bus`（四个引脚 + mode）

## 类型与常量

```c
typedef enum {
    ECOS_SOFT_SPI_MODE_0 = 0,
    ECOS_SOFT_SPI_MODE_1,
    ECOS_SOFT_SPI_MODE_2,
    ECOS_SOFT_SPI_MODE_3
} ecos_soft_spi_mode_t;

typedef void (*ecos_soft_spi_delay_fn)(void *context);

typedef struct {
    ecos_gpio_pin_t chip_select;
    ecos_gpio_pin_t clock;
    ecos_gpio_pin_t mosi;
    ecos_gpio_pin_t miso;
    ecos_soft_spi_mode_t mode;
    ecos_soft_spi_delay_fn delay;   /* 可选：每半周期回调延时 */
    void *delay_context;            /* 传给 delay 的上下文 */
} ecos_soft_spi_config_t;

typedef struct {
    ecos_soft_spi_config_t config;
    bool initialized;
    bool active;
} ecos_soft_spi_t;
```

## 函数

```c
ecos_err_t ecos_soft_spi_init(ecos_soft_spi_t *bus,
                              const ecos_soft_spi_config_t *config);
ecos_err_t ecos_soft_spi_start(ecos_soft_spi_t *bus);
ecos_err_t ecos_soft_spi_stop(ecos_soft_spi_t *bus);
ecos_err_t ecos_soft_spi_transfer_byte(ecos_soft_spi_t *bus,
                                       uint8_t tx, uint8_t *rx);
```

| 函数 | 说明 |
| --- | --- |
| `ecos_soft_spi_init()` | 配置 GPIO 并保存参数 |
| `ecos_soft_spi_start()` | 拉低片选，开始一次事务 |
| `ecos_soft_spi_stop()` | 释放片选，结束事务 |
| `ecos_soft_spi_transfer_byte()` | MSB-first 收发一个字节 |

支持 SPI mode 0–3、MSB-first 单字节收发和可选的每半周期回调延时。

## 使用示例

```c
#include "ecos/board_resources.h"
#include "ecos/soft_spi.h"

void read_id(void)
{
    ecos_soft_spi_config_t config = {
        .chip_select = ECOS_BOARD_SOFT_SPI_CHIP_SELECT,
        .clock = ECOS_BOARD_SOFT_SPI_CLOCK,
        .mosi = ECOS_BOARD_SOFT_SPI_MOSI,
        .miso = ECOS_BOARD_SOFT_SPI_MISO,
        .mode = (ecos_soft_spi_mode_t)ECOS_BOARD_SOFT_SPI_MODE,
    };
    ecos_soft_spi_t bus;
    uint8_t received;

    ecos_soft_spi_init(&bus, &config);
    ecos_soft_spi_start(&bus);
    ecos_soft_spi_transfer_byte(&bus, 0x9fu, &received);
    ecos_soft_spi_stop(&bus);
}
```

## 注意事项

- Board 通过 `soft-spi-bus` 资源声明四个引脚和 mode，配置阶段生成
  `ecos/board_resources.h` 宏；应用不能把板卡引脚写进组件。
- 事务必须显式 `start` / `stop`，调用方负责选择与硬件匹配的 GPIO 资源。
- 位 bang 时序受 CPU 频率和 GPIO 写延迟影响；需要精确时钟时使用硬件 QSPI，见
  [QSPI 驱动](../driver/qspi.md)。
- 宿主测试覆盖四种 mode、引脚冲突和状态机；具体板卡时钟频率、外设电气连接和长
  时间稳定性仍需实板验收。
- 资源宏定义见 [BSP 板级支持](../bsp.md#board-resources)。
