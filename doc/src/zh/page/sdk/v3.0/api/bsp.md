# BSP 板级支持

BSP（板级支持包）把具体板卡上的控制台串口、LED、按键和显示资源封装成与板卡
无关的接口，是应用最先初始化的模块。

- 头文件：`ecos/bsp/console.h`、`led.h`、`button.h`、`display.h`
- 板级资源：`ecos/board_resources.h`（由 CLI 依板级清单生成到工程的
  `.ecos/generated/include/`）
- 示例：`examples/get_start/hello`、`examples/get_start/blink`、
  `examples/peripherals/button/state`

## 控制台 console

控制台是 CRLF 文本输出通道 + 阻塞文本输入通道，输入中的 CR 会归一化为 LF。

```c
ecos_err_t bsp_console_init(void);
int bsp_console_write(const char *text, size_t size);
int bsp_console_read(void *data, size_t size);
int bsp_console_try_read(uint8_t *data);
```

| 函数 | 说明 |
| --- | --- |
| `bsp_console_init()` | 初始化板卡选定的控制台，返回 0 或负错误码。几乎每个应用的第一行都是它 |
| `bsp_console_write()` | 输出一段文本（按 CRLF 约定），返回消费的字节数，失败返回负错误码 |
| `bsp_console_read()` | 阻塞读取直到读满 `size` 字节；回车（CR）归一化为换行（LF） |
| `bsp_console_try_read()` | 非阻塞读一个字节：读到返回 1，暂无数据返回 0，失败返回负错误码 |

日志默认写到控制台，因此 `bsp_console_init()` 应最先调用。

## LED

```c
typedef enum {
    BSP_LED_0 = 0,
    BSP_LED_1,
    BSP_LED_COUNT
} bsp_led_t;

typedef enum {
    BSP_LED_OFF = 0,
    BSP_LED_ON
} bsp_led_state_t;

ecos_err_t bsp_led_init(void);
ecos_err_t bsp_led_set_state(bsp_led_t led, bsp_led_state_t state);
```

| 函数 | 说明 |
| --- | --- |
| `bsp_led_init()` | 把所有板载 LED 配置为 GPIO 输出并置为熄灭 |
| `bsp_led_set_state()` | 点亮（`BSP_LED_ON`）或熄灭（`BSP_LED_OFF`）指定 LED |

`BSP_LED_COUNT` 是公共接口允许的最大编号上界，具体数量由板卡决定。

## 按键 button

```c
typedef enum {
    BSP_BUTTON_0 = 0,
    BSP_BUTTON_1,
    BSP_BUTTON_COUNT
} bsp_button_t;

typedef enum {
    BSP_BUTTON_RELEASED = 0,
    BSP_BUTTON_PRESSED
} bsp_button_state_t;

ecos_err_t bsp_button_init(void);
int bsp_button_get_count(void);
int bsp_button_get_state(bsp_button_t button);
```

| 函数 | 说明 |
| --- | --- |
| `bsp_button_init()` | 把所有板载按键配置为 GPIO 输入 |
| `bsp_button_get_count()` | 返回当前 Board 的板载按键数 |
| `bsp_button_get_state()` | 返回 `BSP_BUTTON_RELEASED`（0）或 `BSP_BUTTON_PRESSED`（1），失败返回负错误码 |

按键驱动无消抖、无中断；需要消抖时由应用轮询实现。

## BSP Display

使用 `bsp-display-st7735` 组件时，应用可以通过统一接口驱动板载屏，无需自己处理
QSPI 配置和 D/C、RST、BLK 引脚：

```c
#include "ecos/bsp/display.h"

ecos_err_t bsp_display_init(void);
ecos_err_t bsp_display_deinit(void);
ecos_err_t bsp_display_fill_rect(uint16_t x, uint16_t y,
                                 uint16_t width, uint16_t height,
                                 uint16_t rgb565);
uint16_t bsp_display_width(void);
uint16_t bsp_display_height(void);
```

| 函数 | 说明 |
| --- | --- |
| `bsp_display_init()` | 按板级清单初始化显示控制器和面板 |
| `bsp_display_deinit()` | 关闭显示 |
| `bsp_display_fill_rect()` | 用 RGB565 颜色填充矩形；未初始化、越界等错误以 `ecos_err_t` 返回 |
| `bsp_display_width()` / `bsp_display_height()` | 返回面板像素尺寸 |

`display-donut` 例程通过这组接口展示完整的 BSP/Device/QSPI 链路；直接使用
ST7735/ST7789 设备驱动的场景见 [Device 驱动](device.md)。

## 板级资源 board_resources.h {#board-resources}

`ecos/board_resources.h` 由 `ecos` CLI 在配置工程时根据所选 Board 的资源清单
生成，不存在于 SDK 源码树中。每个资源组都以 `ECOS_BOARD_HAS_*` 作为存在性开关，
示例代码用 `#if !ECOS_BOARD_HAS_*` + `#error` 做编译期断言。

### GPIO 演示资源

一组输入引脚 + 一组输出引脚，可回环对连：

```c
#define ECOS_BOARD_HAS_GPIO_DEMO 1
#define ECOS_BOARD_GPIO_DEMO_INPUT  { ECOS_GPIO_PORT_1, 7u }
#define ECOS_BOARD_GPIO_DEMO_INPUT_LABEL "GPIO1[7]"
#define ECOS_BOARD_GPIO_DEMO_INPUT_IDLE_LEVEL ECOS_GPIO_LEVEL_HIGH
#define ECOS_BOARD_GPIO_DEMO_OUTPUT { ECOS_GPIO_PORT_1, 5u }
#define ECOS_BOARD_GPIO_DEMO_OUTPUT_LABEL "GPIO1[5]"
#define ECOS_BOARD_GPIO_DEMO_OUTPUT_INITIAL_LEVEL ECOS_GPIO_LEVEL_HIGH
```

### QSPI 总线资源

```c
#define ECOS_BOARD_HAS_QSPI_BUS 1
#define ECOS_BOARD_QSPI_BUS_CONTROLLER ((ecos_qspi_id_t)0u)
#define ECOS_BOARD_QSPI_BUS_CLOCK_DIVIDER 3u
```

### 软件 SPI 资源

```c
#define ECOS_BOARD_HAS_SOFT_SPI_BUS 1
#define ECOS_BOARD_SOFT_SPI_CHIP_SELECT { ECOS_GPIO_PORT_0, 0u }
#define ECOS_BOARD_SOFT_SPI_CLOCK       { ECOS_GPIO_PORT_0, 1u }
#define ECOS_BOARD_SOFT_SPI_MOSI        { ECOS_GPIO_PORT_0, 2u }
#define ECOS_BOARD_SOFT_SPI_MISO        { ECOS_GPIO_PORT_0, 3u }
#define ECOS_BOARD_SOFT_SPI_MODE        0u
```

`soft-spi-bus` 的四个引脚和 mode 来自 Board 清单；应用将这些宏填入
`ecos_soft_spi_config_t`，不得重新写板卡 GPIO 编号。详见
[soft-spi 组件](components/soft-spi.md)。

### 显示资源

配合 ST7735/ST7789 设备驱动的 config 结构体逐字段使用：

```c
#define ECOS_BOARD_HAS_DISPLAY 1
#define ECOS_BOARD_DISPLAY_CHIP_SELECT ECOS_QSPI_CS_0
#define ECOS_BOARD_DISPLAY_DC_PORT ECOS_GPIO_PORT_0
#define ECOS_BOARD_DISPLAY_DC_PIN 29u
#define ECOS_BOARD_DISPLAY_RESET_PORT ECOS_GPIO_PORT_0
#define ECOS_BOARD_DISPLAY_RESET_PIN 30u
#define ECOS_BOARD_DISPLAY_BACKLIGHT_PORT ECOS_GPIO_PORT_0
#define ECOS_BOARD_DISPLAY_BACKLIGHT_PIN 31u
#define ECOS_BOARD_DISPLAY_WIDTH 128u
#define ECOS_BOARD_DISPLAY_HEIGHT 128u
#define ECOS_BOARD_DISPLAY_ROTATION 0u
#define ECOS_BOARD_DISPLAY_HORIZONTAL_OFFSET 2u
#define ECOS_BOARD_DISPLAY_VERTICAL_OFFSET 3u
```

`display` 对应 ST7735，`display-st7789` 对应 ST7789；生成器对两者输出同一组
`ECOS_BOARD_DISPLAY_*` 宏。固定接线、没有软件控制的 RST 或 BLK 可在 Board 清单中
省略，对应的 `*_PORT` 宏为 `ECOS_GPIO_PORT_COUNT`，设备驱动不会访问该引脚。

## 最小使用骨架

```c
#include "ecos/bsp/console.h"
#include "ecos/bsp/led.h"
#include "ecos/driver/timer.h"
#include "ecos/log.h"

#define LOG_TAG "blink"

int main(void)
{
    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_led_init(), "initialize LED");

    for (;;) {
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            bsp_led_set_state(BSP_LED_0, BSP_LED_ON), "LED on");
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 500u),
                            "delay");
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            bsp_led_set_state(BSP_LED_0, BSP_LED_OFF), "LED off");
        ECOS_PANIC_ON_ERROR(LOG_TAG,
                            ecos_timer_delay_ms(ECOS_TIMER_DEFAULT, 500u),
                            "delay");
    }
}
```

## 注意事项

- `bsp_console_init()` 应最先调用：日志默认写到控制台，初始化失败时
  `ECOS_PANIC_ON_ERROR` 也能输出错误信息。
- 控制台写的是文本：`\n` 会被加上 `\r` 组成 CRLF；二进制通道请用
  [UART 驱动](driver/uart.md)。
- `board_resources.h` 的具体取值随 Board 变化，跨板移植代码时只依赖宏名，不要
  硬编码引脚。
- LED/按键的具体数量由板卡决定，`BSP_LED_COUNT` / `BSP_BUTTON_COUNT` 之外的编号
  行为未定义。
- 板载资源的逻辑引脚与 Demo 示例的对应关系见
  [示例工程](../examples.md)。
