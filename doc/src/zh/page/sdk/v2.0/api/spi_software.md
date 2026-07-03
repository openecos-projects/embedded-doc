# SPI_SOFTWARE API 2.0

!!! info "文档说明"

    本文档介绍 SDK 2.0 版本中 SPI_SOFTWARE 组件的软件 SPI 接口。该组件通过 GPIO 手动翻转片选、时钟和 MOSI，并读取 MISO，实现一个轻量级 SPI 主机接口。当前默认用于 SFUD 组件访问片外 SPI NOR Flash，也可由应用层直接调用 `MYSPI_Init`、`MYSPI_Start`、`MYSPI_SwapByte`、`MYSPI_Stop` 完成简单 SPI 设备通信。


## 概述
### 版本特性

SDK 2.0 版本的 SPI_SOFTWARE 组件基于 GPIO HAL 实现，固定使用 4 根 GPIO 线模拟 SPI 主机通信。当前实现采用空闲低电平时钟、上升沿采样、MSB first 的传输方式，单次接口以 8 bit 为单位完成全双工交换。

该组件不依赖硬件 SPI 控制器，适合硬件 SPI 不可用、临时调试、低速 SPI 外设访问、SFUD Flash 功能验证等场景。由于每个 bit 都需要多次 GPIO 同步操作，传输速度明显低于硬件 SPI，不适合高吞吐连续数据传输。

### 适用范围

适用于 SDK 支持板卡上的低速 spi 主机场景，包括 SPI NOR Flash 调试、简单传感器访问、低速寄存器读写、板级 bring-up、临时通信验证等。


## 头文件与依赖
### 核心头文件

```c title="main.c"
#include "spi_software.h"
```

*   **spi_software.h**：软件 SPI 对外接口头文件，包含初始化、片选控制、单字节交换函数声明，以及默认引脚宏定义。

### 编译依赖

*   **CONFIG_COMPONENT_SPI_SOFTWARE**：该宏用于在板卡构建配置中开启软件 SPI 组件编译，不定义此宏时，`components/spi_software/src` 不会被加入工程。
*   **CONFIG_DRIVER_GPIO**：软件 SPI 通过 `hal_gpio.h` 操作 GPIO 方向、电平和读写同步，工程需要启用 GPIO 驱动。
*   **GPIO HAL**：当前实现使用 `gpio_hal_output_enable`、`gpio_hal_input_enable`、`gpio_hal_set_level`、`gpio_hal_get_level`、`gpio_hal_write_update`、`gpio_hal_read_update`函数。

### 默认引脚配置

```c title="spi_software.h"
#define SS_PORT     0
#define SS_PIN      GPIO_NUM_0
#define CLK_PORT    0
#define CLK_PIN     GPIO_NUM_1
#define MOSI_PORT   0
#define MOSI_PIN    GPIO_NUM_2
#define MISO_PORT   0
#define MISO_PIN    GPIO_NUM_3
```

*   **SS**：片选信号，默认 GPIO0，空闲高电平，传输期间拉低。
*   **CLK**：SPI 时钟信号，默认 GPIO1，空闲低电平。
*   **MOSI**：主机输出从机输入信号，默认 GPIO2。
*   **MISO**：主机输入从机输出信号，默认 GPIO3。
*   **端口号**：当前默认全部使用 GPIO 端口 0。

!!! info "时序分析"

    当前软件 SPI 时序可按 SPI Mode 0 理解：

    *   `CLK` 空闲为低电平。
    *   每个 bit 先设置 `MOSI`，再拉高 `CLK`。
    *   `CLK` 拉高后读取 `MISO`。
    *   最后拉低 `CLK`，进入下一 bit。
    *   数据按 MSB first 发送和接收。


## 核心接口（spi_software.h）
### 初始化软件 SPI

```c title="spi_software.h"
void MYSPI_Init(void);
```

*   **功能**：初始化软件 SPI 使用的 GPIO 引脚方向和空闲电平。
*   **当前实现**：
    * `SS`、`CLK`、`MOSI` 配置为输出。
    * `MISO` 配置为输入。
    * `SS` 置为高电平，表示从设备未选中。
    * `CLK` 置为低电平，建立 SPI 空闲状态。
    * 调用 `gpio_hal_write_update()` 将输出配置同步到硬件。
*   **调用说明**：
    * 使用任何软件 SPI 传输前必须先调用一次。
    * 若 GPIO 复用或引脚定义被其他模块修改，需要重新初始化。

### 开始一次 SPI 通信

```c title="spi_software.h"
void MYSPI_Start(void);
```

*   **功能**：拉低片选信号，开始一次 SPI 通信。
*   **当前实现**：将 `SS` 设置为低电平，并调用 `gpio_hal_write_update()` 同步到硬件。
*   **调用说明**：
    * 应在连续发送命令、地址和数据前调用。
    * 同一次进程中的多个 `MYSPI_SwapByte` 之间会保持片选为低电平。

### 结束一次 SPI 通信

```c title="spi_software.h"
void MYSPI_Stop(void);
```

*   **功能**：拉高片选信号，结束一次 SPI 通信。
*   **当前实现**：将 `SS` 设置为高电平，并调用 `gpio_hal_write_update()` 同步到硬件。
*   **调用说明**：
    * 命令或数据传输完成后必须调用。
    * 对 SPI Flash 等设备，片选释放通常表示当前命令结束。

### 单字节全双工交换

```c title="spi_software.h"
uint8_t MYSPI_SwapByte(uint8_t wdata);
```

*   **功能**：通过软件 SPI 发送 1 字节数据，同时读取 1 字节返回数据。
*   **参数说明**：
    * `wdata`：待发送的 8 bit 数据。
*   **返回值**：传输期间从 `MISO` 读取到的 8 bit 数据。
*   **当前实现**：
    * 从 bit7 到 bit0 依次发送，按 MSB first 传输。
    * 每个 bit 先写 `MOSI`，调用 `gpio_hal_write_update()`。
    * 拉高 `CLK` 后调用 `gpio_hal_write_update()`。
    * 调用 `gpio_hal_read_update()` 刷新输入缓存，再读取 `MISO`。
    * 将 `CLK` 拉低，继续下一 bit。
    * 8 bit 完成后再次调用 `gpio_hal_write_update()`。
*   **调用说明**：
    * 该接口只交换一个字节，不自动控制片选。
    * 使用时应按 `MYSPI_Start` → 多次 `MYSPI_SwapByte` → `MYSPI_Stop` 的顺序组织通信。
    * 读取型命令通常先发送命令和地址，再发送 dummy 字节以换取从设备返回数据。


## 与 SFUD 的关系
### SFUD 端口层绑定

当前 SFUD 组件的 `sfud_port.c` 默认使用软件 SPI 作为 Flash 总线：

```c title="sfud_port.c"
sfud_err sfud_spi_port_init(sfud_flash *flash)
{
    MYSPI_Init();
    flash->spi.wr = spi_write_read;
    flash->spi.lock = NULL;
    flash->spi.unlock = NULL;
    flash->spi.user_data = NULL;
    flash->retry.delay = delay100us;
    flash->retry.times = 60 * 10000;

    return SFUD_SUCCESS;
}
```

*   **初始化**：SFUD 初始化时调用 `MYSPI_Init`。
*   **写后读**：`spi_write_read` 内部调用 `MYSPI_Start`，连续交换写入数据和 dummy 数据，最后调用 `MYSPI_Stop`。
*   **读数据流程**：当写入阶段结束后，端口层发送 `SFUD_DUMMY_DATA`，并把 `MYSPI_SwapByte` 返回值写入读缓冲区。
*   **互斥**：当前 SFUD 端口层未实现 `lock/unlock`，共享总线或多任务场景需自行加锁。


## 引脚迁移
### 修改默认引脚

软件 SPI 引脚通过 `spi_software.h` 中的宏定义指定：

```c title="spi_software.h"
#define SS_PORT     0
#define SS_PIN      GPIO_NUM_0
#define CLK_PORT    0
#define CLK_PIN     GPIO_NUM_1
#define MOSI_PORT   0
#define MOSI_PIN    GPIO_NUM_2
#define MISO_PORT   0
#define MISO_PIN    GPIO_NUM_3
```

如需迁移到其他 GPIO，需要同步修改端口号和引脚号，并确认这些引脚没有被 UART、QSPI、PS2、屏幕或其他外设占用。

### 多设备片选

当前组件只有一个 `SS` 宏定义，不内置多片选管理。若同一组 `CLK/MOSI/MISO` 连接多个 SPI 设备，可在应用层自行增加多个片选 GPIO，并按设备选择不同片选线；同时需要保证同一时刻只有一个设备片选为低电平。


!!! info "硬件通用限制说明"

    *   当前实现为 SPI 主机模式，不支持从机模式。
    *   当前固定为 Mode 0 时序，不提供 CPOL/CPHA 配置接口。
    *   当前固定 MSB first，不提供 LSB first 配置接口。
    *   当前只支持单字节阻塞式交换，不支持中断、DMA、FIFO 或批量传输接口。
    *   当前没有速度配置，实际频率由 CPU 执行速度、GPIO HAL 同步开销和编译优化共同决定。
    *   当前没有总线互斥，多任务或多个上层组件共享软件 SPI 时需要应用层加锁。
    *   软件 SPI 每个 bit 都会进行 GPIO 写同步和读同步，吞吐量较低，批量数据传输优先考虑硬件 SPI/QSPI。


!!! info "通用使用规则"

    *   **标准流程**：`MYSPI_Init` 初始化 → `MYSPI_Start` 拉低片选 → `MYSPI_SwapByte` 交换数据 → `MYSPI_Stop` 释放片选。
    *   **片选规则**：一个完整设备命令应放在同一次 `Start/Stop` 之间，避免从设备提前结束命令解析。
    *   **读写规则**：SPI 为全双工通信，发送命令或地址时返回值通常可忽略；读取数据时需要发送 dummy 字节。
    *   **引脚规则**：迁移引脚后必须确认 GPIO 方向、复用和外部上拉/下拉满足目标设备要求。
    *   **调试规则**：通信异常时优先检查片选极性、时钟模式、MISO/MOSI 是否接反、GPIO 复用是否被其他外设占用。
