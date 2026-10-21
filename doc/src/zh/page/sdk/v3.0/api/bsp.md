# BSP 板级支持

BSP 把板载 Console、LED、Button 和显示资源封装为与板卡无关的接口。

```c
#include "ecos/bsp/console.h"
#include "ecos/bsp/led.h"
#include "ecos/bsp/button.h"
```

| 接口 | 说明 |
| --- | --- |
| `bsp_console_init()` | 初始化板级控制台，通常应最先调用 |
| `bsp_console_write(text, size)` | 输出文本（CRLF），返回消费的字节数 |
| `bsp_console_read(data, size)` | 阻塞读取，CR 归一化为 LF |
| `bsp_console_try_read(&byte)` | 非阻塞读一个字节：1 读到、0 暂无、负数失败 |
| `bsp_led_init()` | 把所有板载 LED 配置为输出并熄灭 |
| `bsp_led_set_state(led, state)` | 点亮或熄灭指定 LED |
| `bsp_button_init()` | 把所有板载按键配置为输入 |
| `bsp_button_get_count()` | 返回当前 Board 的按键数量 |
| `bsp_button_get_state(button)` | 返回按下/松开状态或负错误码 |

板载资源的逻辑引脚由 CLI 生成到 `ecos/board_resources.h`，应用通过宏访问，
不要硬编码 GPIO 编号：

```c
#include "ecos/driver/gpio.h"
#include "ecos/board_resources.h"

#if !ECOS_BOARD_HAS_GPIO_DEMO
#error "this board does not provide the gpio-demo resource"
#endif

/* 宏的取值随 Board 变化；跨板代码只依赖宏名。 */
ecos_gpio_pin_t input  = ECOS_BOARD_GPIO_DEMO_INPUT;
ecos_gpio_pin_t output = ECOS_BOARD_GPIO_DEMO_OUTPUT;
```

设备驱动见[Driver 驱动层](driver.md)，外部器件见[Device 与 Component](device.md)。
