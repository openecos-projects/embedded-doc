# GPIO API 2.0

!!! info "文档说明"

    *   本文档适用于**星空 C2 板卡 2.0 版本**，基于全新**HAL 统一硬件抽象层**实现，接口标准化、跨平台兼容、使用更简洁。相比 1.0 直接操作寄存器，2.0 则对底层进行全面封装，开发者无需关心寄存器地址与位操作，直接调用统一 HAL 接口即可完成 GPIO 控制

## 概述
### 版本特性
星空C2 2.0 版本的 GPIO 驱动，基于统一的 HAL_GPIO 接口实现，兼容标准 HAL 开发习惯；驱动支持输入 / 输出方向配置、电平设置与读取，并深度适配了星空 C2 硬件的读写机制，便于开发者可以专注业务逻辑，无需手动处理底层硬件缺陷。

### 适用范围
星空 C2 板卡所有通用 GPIO 控制（LED、按键、继电器、通用 IO 等）。

## 头文件与依赖
### 核心头文件

```c title="gpio.c"
#include "hal_gpio.h"
#include "hal_gpio_type.h"
```

*   **hal_gpio_type.h**：定义了 GPIO 相关的枚举类型、数据结构，避免非法参数传入。
*   **hal_gpio.h**：对外暴露的标准 HAL GPIO 操作接口，包含初始化、配置、读写等核心函数。

### 编译依赖

*   **CONFIG_DRIVER_GPIO**：该宏用于在 Kconfig 中开启 GPIO 驱动编译，不定义此宏时，驱动不会被编译进工程。

*   **CONFIG_DRIVER_GPIO_OVERCLOCK**：定义此宏后，会关闭驱动中内置的读写延时，用于追求 IO 翻转速度；不建议在稳定性优先的场景使用，可能因硬件时序不满足导致读写错误。


## 核心数据类型（hal_gpio_type.h）
### GPIO 引脚编号

```c title="hal_gpio_type.h"
typedef enum {
    GPIO_NUM_0  = 0,
    GPIO_NUM_1  = 1,
    // ... 中间引脚省略
    GPIO_NUM_63 = 63,
} gpio_num_t;
```

*   **范围**：**0 ~ 63**，直接对应硬件寄存器中的位偏移，每一个值对应 C2 板卡上的一个物理 GPIO 引脚。
*   **使用说明**：建议直接使用该枚举值作为引脚参数，避免直接传入 0~63 的裸数字，防止引脚号传错。

### GPIO 工作模式

```c title="hal_gpio_type.h"
typedef enum {
    GPIO_MODE_INPUT  = 0,  // 输入模式
    GPIO_MODE_OUTPUT = 1,  // 输出模式
} gpio_mode_t;
```

*   **GPIO_MODE_INPUT**：配置为输入模式，用于读取外部电平信号，如按键、传感器输入。
*   **GPIO_MODE_OUTPUT**：配置为输出模式，用于驱动外部负载，如 LED、继电器。

### GPIO 电平状态

```c title="hal_gpio_type.h"
typedef enum {
    GPIO_LEVEL_LOW  = 0,  // 低电平
    GPIO_LEVEL_HIGH = 1,  // 高电平
} gpio_level_t;
```

*   **GPIO_LEVEL_LOW**：对应硬件低电平（通常为 0V）。
*   **GPIO_LEVEL_HIGH**：对应硬件高电平（通常为板卡供电电压，如 3.3V）。

### GPIO 功能配置

```c title="hal_gpio_type.h"
typedef enum {
    GPIO_FUNCTION_0 = 0,
    GPIO_FUNCTION_1 = 1,
    GPIO_FUNCTION_2 = 2,
} gpio_func_t;
```

*   **说明**：星空 C2**不支持引脚复用功能**。

## HAL_GPIO 标准接口（hal_gpio.h）
### 启用输入模式

```c title="hal_gpio.h"
void gpio_hal_input_enable(uint8_t gpio_id, uint8_t gpio_num);
```

*   **功能**：将指定 GPIO 配置为**输入模式**，修改硬件方向寄存器，使引脚处于高阻输入状态，可读取外部电平信号。
*   **参数说明**：
	* `gpio_id`：GPIO 组编号，星空 C2 板卡仅支持一组 GPIO 外设，此参数固定填**0**，填写其他值会触发断言报错。
	* `gpio_num`：引脚编号，范围为`GPIO_NUM_0`~`GPIO_NUM_63`，需使用`gpio_num_t`枚举值传入。
*   **调用说明**：调用该函数后，引脚会被设置为输入模式，但硬件寄存器的配置会先写入软件缓存，需配合后续的同步函数才能生效。

### 启用输出模式

```c title="hal_gpio.h"
void gpio_hal_output_enable(uint8_t gpio_id, uint8_t gpio_num);
```

*   **功能**：将指定 GPIO 配置为**输出模式**，修改硬件方向寄存器，使引脚处于推挽输出状态，可驱动外部负载。
*   **参数说明**：
	* `gpio_id`：固定为 0，与gpio_hal_input_enable参数说明一致。
	* `gpio_num`：引脚编号，同`gpio_hal_input_enable`。
*   **调用说明**：调用该函数后，引脚方向会被设置为输出，但配置仅写入软件缓存，需调用`gpio_hal_write_update()`同步到硬件后，配置才会真正生效。

### 设置输出电平

```c title="hal_gpio.h"
void gpio_hal_set_level(uint8_t gpio_id, uint8_t gpio_num, uint8_t level);
```

*   **功能**：设置指定 GPIO 引脚的输出电平状态，修改软件中的输出缓存值。
*   **参数说明**：
	* `gpio_id`：固定为 0。
	* `gpio_num`：引脚编号，同前。
	* `level`：输出电平值，需传入`GPIO_LEVEL_HIGH`或`GPIO_LEVEL_LOW`，传入其他值会触发断言报错。
*   **调用说明**：此函数仅修改驱动内部的软件输出缓存，**不直接写入硬件寄存器**，必须调用`gpio_hal_write_update()`后，电平状态才会真正输出到硬件引脚上。

### 获取引脚电平

```c title="hal_gpio.h"
uint8_t gpio_hal_get_level(uint8_t gpio_id, uint8_t gpio_num);
```

*   **功能**：读取指定 GPIO 引脚的当前逻辑电平状态，返回硬件实际电平或软件缓存的输出电平。
*   **参数说明**：
	* `gpio_id`：固定为 0。
	* `gpio_num`：引脚编号，同前。
*   **返回值说明**：返回`0`表示低电平，`1`表示高电平，与`GPIO_LEVEL_LOW`/`GPIO_LEVEL_HIGH`枚举值对应。

*   **调用说明**：
	* 若引脚为输入模式，返回值来自`gpio_hal_read_update()`刷新的硬件输入缓存。
	* 若引脚为输出模式，返回值来自驱动内部的软件输出缓存，无需读取硬件寄存器。
	* 必须先调用`gpio_hal_read_update()`刷新缓存，再调用此函数读取，否则会读到旧数据。

### 读操作同步

```c title="hal_gpio.h"
void gpio_hal_read_update(void);
```

*   **功能**：从 GPIO 输入寄存器读取所有引脚的电平状态，并刷新到驱动内部的软件缓存`rdr`中，解决 C2 硬件读寄存器数据冒险的问题。

*   **调用说明**：
	* 必须在调用`gpio_hal_get_level()`**之前调用**，确保读取的是最新的硬件电平状态。
	* 若未定义`CONFIG_DRIVER_GPIO_OVERCLOCK`，函数内部会自带一定的延时，保证硬件读写时序稳定，避免读取到错误数据。
	* 建议在按键检测、传感器读取等需要输入电平的场景中，每次读取前都调用一次该函数。

### 写操作同步

```c title="hal_gpio.h"
void gpio_hal_write_update(void);
```

*   **功能**：将驱动内部缓存的方向寄存器配置`ddr`和输出电平值`wdr`，一次性写入硬件寄存器，完成配置同步。

*   **调用说明**：
	* 必须在调用`gpio_hal_output_enable()`、`gpio_hal_set_level()`等修改缓存的函数**之后调用**，否则配置不会生效。
	* 若未定义`CONFIG_DRIVER_GPIO_OVERCLOCK`，函数内部会自带一定的延时，保证硬件写入时序稳定，避免配置失败。
	* 若需要同时修改多个引脚的配置，可一次性修改所有引脚的缓存，再调用一次该函数，减少寄存器写入次数，提高效率。

### 设置功能配置

```c title="hal_gpio.h"
void gpio_hal_set_fcfg(uint8_t gpio_id, uint8_t gpio_num, uint8_t val);
```

*   **说明**：星空 C2 板卡不支持 FCFG 功能配置，调用该函数会触发断言，直接终止程序执行，防止错误操作影响硬件稳定性。

### 设置引脚复用

```c title="hal_gpio.h"
void gpio_hal_set_mux(uint8_t gpio_id, uint8_t gpio_num, uint8_t val);
```

*   **说明**：星空 C2 板卡不支持引脚复用功能，调用该函数会触发断言，直接终止程序执行，防止错误配置引脚功能。

!!! info "C2板卡硬件特殊说明——硬件限制"

    *   **读取GPIO_DR 寄存器存在数据冒险**：硬件寄存器在读取时，旧数据会移位到高 16 位，导致直接读取时可能获取到错误的电平状态，驱动层通过软件缓存rdr屏蔽了该问题。
    *   仅支持一组 GPIO 外设，无多组 GPIO 扩展，所有操作的gpio_id参数固定为 0。
    *   不支持 FCFG、PINMUX 引脚复用功能，所有 GPIO 引脚默认仅作为通用输入 / 输出使用，无法切换为外设功能引脚。

!!! info "C2板卡硬件特殊说明——读写规则"

    *   **输入读取流程**：调用gpio_hal_read_update() → 调用gpio_hal_get_level()，先刷新硬件电平到软件缓存，再读取缓存值，确保数据准确。
    *   **输出控制流程**：调用gpio_hal_output_enable() → 调用gpio_hal_set_level() → 调用gpio_hal_write_update()，先配置引脚方向和电平，再同步到硬件寄存器，确保配置生效。

