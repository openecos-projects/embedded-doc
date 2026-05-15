# HP_UART API 2.0

!!! info "文档说明"

    本文档介绍 SDK 2.0 版本中 HP_UART 驱动的统一 HAL 接口。该接口采用硬件抽象层设计，标准化 API 定义，具备跨平台兼容性。开发者无需关注底层寄存器与位操作，可直接调用统一接口完成高性能串口的收发控制。


## 概述
### 版本特性

SDK 2.0 版本的 HP_UART 驱动基于统一 HAL_HP_UART 接口实现，兼容标准 HAL 开发习惯。驱动支持波特率配置、数据位 / 校验位 / 停止位自定义、单字符 / 字符串收发、FIFO 硬件控制，并内置读写同步逻辑，提升接口易用性与数据可靠性。

### 适用范围

适用于 SDK 支持的所有平台上的高性能串口（HP_UART）通信场景，包括日志打印、指令交互、传感器数据收发、上位机通信等。


## 头文件与依赖
### 核心头文件

```c title="hp_uart.c"
#include "hal_hp_uart.h"
#include "hal_hp_uart_type.h"
```

*   **hal_hp_uart_type.h**：定义HP_UART相关枚举、配置结构体等，避免非法参数传入。
*   **hal_hp_uart.h**：对外暴露标准HAL HP_UART操作接口，包含初始化、配置、发送、接收等核心函数。

### 编译依赖

*   **CONFIG_CPU_FREQ_MHZ**：CPU 主频配置，用于波特率分频系数计算，需正确配置以保证串口通信正常。

*   **CONFIG_DRIVER_HP_UART**：在Kconfig 中需要开启HP_UART驱动编译，否则不参与编译。


## 核心数据类型（hal_hp_uart_type.h）
### 波特率枚举

```c title="hal_hp_uart_type.h"
typedef enum{
    HP_UART_BAUDRATE_9600    = 9600,
    HP_UART_BAUDRATE_115200  = 115200,
} hp_uart_baudrate_t;
```

*   支持常用标准波特率：9600、115200。
*   枚举值直接对应真实波特率，可直接传入初始化函数。

### 串口基础配置宏

```c title="hal_hp_uart_type.h"
#define HP_UART_PARITY_NONE       0
#define HP_UART_ODD_PARITY        (0b00 << 8)
#define HP_UART_EVEN_PARITY       (0b01 << 8)
#define HP_UART_STOP_BITS_1       (0b00 << 6)
#define HP_UART_STOP_BITS_2       (0b01 << 6)
```

*   **校验位**：支持无校验、奇校验、偶校验，宏定义值适配底层寄存器位域规则。
*   **停止位**：支持 1 位、2 位停止位，宏定义直接对应硬件寄存器配置值。

### 串口完整配置结构体

```c title="hal_hp_uart_type.h"
typedef struct{
    hp_uart_baudrate_t  baudrate;    // 波特率
    uint8_t             stop_bits;   // 停止位
    uint8_t             parity;     // 校验位
    uint8_t             data_bits;   // 数据位
} hp_uart_config_t;
```

*   **功能**：用于一次性配置串口所有参数，支持灵活自定义帧格式。
*   **使用说明**：结构体成员需传入对应宏/枚举值，避免非法值导致通信异常。

### HAL 状态枚举

```c title="hal_hp_uart_type.h"
typedef enum{
    HAL_OK      = 0,    // 操作成功
    HAL_ERROR   = 1,    // 操作失败
    HAL_BUSY    = 2,    // 设备忙
    HAL_TIMEOUT = 3,    // 操作超时
} hal_status_t;
```

*   **说明**：统一 HAL 库返回值更加规范，便于使用者判断执行结果。


## HAL_HP_UART 标准接口（hal_hp_uart.h）
### 串口初始化

```c title="hal_hp_uart.h"
void hal_hp_uart_init(uint32_t baudrate);
```

*   **功能**：初始化 HP_UART，使用默认帧格式（8 数据位、无校验、1 停止位），根据 CPU 主频自动计算分频系数。
*   **参数说明**：`baudrate`波特率，可直接填数字（如 115200）或使用枚举 `HP_UART_BAUDRATE_115200`进行配置。
*   **调用说明**：上电后只需调用一次，用于快速开启串口打印、日志输出。

### 串口高级配置

```c title="hal_hp_uart.h"
void hal_hp_uart_config(hp_uart_config_t *config);
```

*   **功能**：完整配置HP_UART所有参数，包括波特率、数据位、校验位、停止位，并初始化 FIFO 控制器。
*   **参数说明**：
	* `config`：指向 `hp_uart_config_t` 结构体的指针，传入完整串口参数。
*   **调用说明**：在自定义通信格式时使用，如特殊波特率、带校验通信、双停止位场景。

### 单字符发送

```c title="hal_hp_uart.h"
void hal_hp_uart_send(char c);
```

*   **功能**：发送单个字符，内部轮询发送状态，等待发送 FIFO 空闲后写入数据。
*   **参数说明**：
	* `c`：待发送的字符 / 字节数据。
*   **调用说明**：阻塞式发送，直到数据写入发送寄存器，适用于单字节控制指令输出。

### 字符串发送

```c title="hal_hp_uart.h"
void hal_hp_uart_putstr(char *str);
```

*   **功能**：发送以 `\0` 结尾的标准 C 字符串，循环调用单字符发送接口，直到结束符。
*   **参数说明**：
	* `str`：字符串首地址。
*   **调用说明**：常用于日志、提示信息、上位机指令输出，使用简单高效。

### 单字符接收

```c title="hal_hp_uart.h"
void hal_hp_uart_recv(char *c);
```

*   **功能**：阻塞式接收单个字符，等待接收FIFO存在有效数据时，读取并存储到指定地址。
*   **参数说明**：
	* `c`：存储接收数据的指针。
	* 若未定义`CONFIG_DRIVER_GPIO_OVERCLOCK`，函数内部会自带一定的延时，保证硬件读写时序稳定，避免读取到错误数据。
	* 建议在按键检测、传感器读取等需要输入电平的场景中，每次读取前都调用一次该函数。

* **调用说明**：未收到数据时会一直阻塞，适用于简单应答式通信、按键指令接收。

### 字符串接收

```c title="hal_hp_uart.h"
void hal_hp_uart_recv_str(char *str);
```

*   **功能**：连续接收字符，直到收到换行符 `\n`，自动在末尾添加字符串结束符 `\0`。
*   **参数说明**：
	* `str`：接收缓冲区首地址。
*   **调用说明**：专门用于串口指令交互，如上位机下发指令以回车换行结尾，可直接接收为完整字符串。


!!! info "C2板卡硬件特殊说明——硬件限制"

    *   星空 C2 仅支持**一路高性能 HP_UART**，对应硬件 UART_1 控制器，无额外串口扩展。
    *   硬件自带 **FIFO 缓存**，驱动默认开启并初始化 FIFO，提升收发稳定性。
    *   波特率由系统主频分频决定，必须保证 `CONFIG_CPU_FREQ_MHZ` 配置正确，否则会导致通信乱码。
    *   不支持中断收发、DMA 收发，当前驱动仅实现**阻塞式轮询模式**。


!!! info "通信规则（必须遵守）"

    *   **使用流程**：初始化 / 配置 → 发送 / 接收。
    *   **发送规则**：直接调用发送接口即可，内部自动等待发送空闲。
    *   **接收规则**：单字符接收会阻塞等待；字符串接收以 `\n` 作为结束标志。
