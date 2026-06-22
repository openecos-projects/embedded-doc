# APB4 UART 控制器设计说明

!!! info "阅读目标"
    这篇文档是按照“先看懂，再能写”的顺序讲 APB4 UART 控制器。读完后，你应该能把一次 UART 发送、一次 UART 接收和一次中断处理从软件寄存器一直追到 `tx_o`、`rx_i` 和 `irq_o`，也能按文章末尾给出的实现清单实现同类控制器的设计。


## 快速导航

| 想看什么 | 直接跳转 |
| -------- | -------- |
| 先把整个 UART IP 串起来 | [一分钟看懂这个 IP](#one-minute) |
| UART 帧、波特率、采样为什么这样设计 | [UART 协议基础](#uart-basic) |
| 顶层端口和模块边界 | [接口与模块边界](#interfaces) |
| 软件读写哪些寄存器 | [寄存器说明](#registers) |
| APB4 访问、FIFO、TX、RX、中断怎么写 | [硬件实现思路](#hardware) |
| 初始化、发送、接收、中断的完整流程 | [工作流程](#workflow) |
| 看波形时重点检查什么 | [时序分析](#timing) |
| 从零实现和验证的顺序 | [实现清单](#checklist) |
| 出问题时先查哪里 | [调试建议](#debug) |

## 一分钟看懂这个 IP {#one-minute}

UART 控制器的核心作用是连接 APB4 总线和 UART 串口：软件通过寄存器配置工作方式，数据通过 FIFO 缓冲，`uart_tx` 和 `uart_rx` 负责串并转换，`uart_irq` 负责把状态转换成中断。

<img src="../../../res/img/ip/uart_main/uart_overview.webp" alt="APB4 UART 控制器总览" style="zoom:100%;" />

所以这个 IP 可以拆成四个模块来看：

| 模块 | 主要内容 | 去哪里看 |
| ---- | -------- | -------- |
| 软件 | 软件如何配置波特率、帧格式、FIFO 和中断 |  [寄存器说明](#registers) |
| 发送 | `TRX` 写入后，数据如何经过 TX FIFO 和 `uart_tx` 到 `tx_o` |  [UART 发送流程](#flow-tx) |
| 接收 | `rx_i` 上的一帧数据如何被采样、校验并送到 RX FIFO | [UART 接收流程](#flow-rx) |
| 中断 | RX、TX、错误状态如何变成 `irq_o` |  [中断处理流程](#flow-irq) |

这里最容易混淆的是 `TRX`。它不是普通保存数据的寄存器，而是收发共用的数据窗口：

| 访问 `TRX` 的方式 | 实际硬件动作 |
| ----------------- | ------------ |
| 写 `TRX` | push TX FIFO，等待 `uart_tx` 发送 |
| 读 `TRX` | pop RX FIFO，把接收数据返回给 CPU |

<img src="../../../res/img/ip/uart_main/uart_trx_path.webp" alt="TRX 收发共用数据窗口" style="zoom:100%;" />



## UART 协议基础 {#uart-basic}
### UART 通信特点

UART（Universal Asynchronous Receiver Transmitter）是一种异步串行通信协议。它没有独立的时钟线，发送端和接收端靠事先约定的波特率来对齐时间。常见 UART 连接只需要两根数据信号线：

| 信号 | 方向 | 作用 |
| ---- | ---- | ---- |
| TX | 输出 | 把本设备的数据发送给外部设备 |
| RX | 输入 | 接收外部设备发来的数据 |

UART 信号线空闲时保持高电平。发送一帧数据时，发送端先把线拉低一个 bit 时间作为起始位，接收端检测到下降沿后，再按照约定波特率采样后续 bit。

本工程把 UART 物理侧信号封装在 `uart_if` 中：

```systemverilog
interface uart_if ();
  logic rx_i;
  logic tx_o;
  logic irq_o;

  modport dut(input rx_i, output tx_o, output irq_o);
  modport tb(output rx_i, input tx_o, input irq_o);
endinterface
```

其中 `tx_o` 由 [uart_tx 发送模块](#uart-tx) 驱动，`rx_i` 进入 [uart_rx 接收模块](#uart-rx)，`irq_o` 由 [uart_irq 中断模块](#uart-irq) 产生。

### UART 帧格式

UART 以“帧”为单位传输数据。一帧通常从起始位开始，随后是低位优先的数据位、可选校验位和停止位。采样位置和 bit 宽度可以直接来看下图。

<img src="../../../res/img/ip/uart_main/uart_frame_sample.webp" alt="UART 帧格式与采样位置" style="zoom:100%;" />

| 组成 | 电平或内容 | 在硬件里的动作 |
| ---- | ---------- | -------------- |
| 起始位 | 低电平 `0` | `uart_tx` 先拉低 `tx_o`；`uart_rx` 检测 `rx_i` 下降沿 |
| 数据位 | 有效数据，低位先传 | 发送端右移输出，接收端按位采样并写入接收寄存器 |
| 校验位 | 可选 | 由 `LCR` 配置，发送端生成，接收端检查 |
| 停止位 | 高电平 `1` | 发送端拉高 `tx_o`，接收端检查该位置是否为高 |

这个工程没有把帧格式写死在状态机里，而是通过 [LCR 线控制寄存器](#reg-lcr) 配置数据位长度、停止位数量和校验方式。

### 波特率与采样

波特率表示串口每秒传输的 bit 数，例如 9600、115200。UART 没有共享时钟，所以发送端和接收端的波特率必须接近。如果误差过大，接收端采样点会逐渐偏离 bit 中心，最后读到错误数据。本工程用 [DIV 分频寄存器](#reg-div) 来配置 bit 时间。以 50 MHz 时钟、115200 波特率为例：

```c
UART1_REG_DIV = 434;  // 50MHz / 115200
```

可以把 `DIV` 理解成“一个 UART bit 要等待多少个 `pclk` 周期”。发送端按 `DIV` 切换输出位，接收端先等 `DIV/2` 找到起始位中心，再按 `DIV` 采样后续的比特。接收端的波形见 [UART 接收采样时序](#timing-rx)。


## 接口与模块边界 {#interfaces}
### 顶层端口

本工程顶层模块为 `apb4_uart`，一侧接 APB4 总线，另一侧接 UART 串口接口：

```systemverilog title="apb4_uart.sv"
module apb4_uart #(
    parameter int FIFO_DEPTH     = 32,
    parameter int LOG_FIFO_DEPTH = $clog2(FIFO_DEPTH)
) (
    apb4_if.slave apb4,
    uart_if.dut   uart
);
```

`FIFO_DEPTH=32` 表示 TX FIFO 和 RX FIFO 都可以缓存 32 个字节；`LOG_FIFO_DEPTH` 用于 FIFO 指针或计数器宽度。

### APB4 总线接口

APB4 接口用于连接 CPU 或 SoC 内部总线主机。软件通过它读写 UART 寄存器，完成初始化、发送、接收和状态查询。

| 信号 | 方向 | 说明 |
| ---- | ---- | ---- |
| `pclk`  | 输入 | APB4 总线时钟，也是 UART 内部工作时钟 |
| `presetn`  | 输入 | 低有效复位 |
| `psel` | 输入 | 当前外设被选中 |
| `penable` | 输入 | APB4 access 阶段有效 |
| `pwrite` | 输入 | 读写方向，1 表示写，0 表示读 |
| `paddr` | 输入 | 寄存器地址 |
| `pwdata` | 输入 | 写数据 |
| `prdata` | 输出 | 读数据 |
| `pready` | 输出 | 从设备就绪 |
| `pslverr` | 输出 | 从设备错误响应 |

APB4 访问分 setup 和 access 两个阶段。写 `TRX` push TX FIFO、读 `TRX` pop RX FIFO，必须只在 access 握手完成时发生。具体写法见 [APB4 访问逻辑](#apb4-access)，对应波形见 [APB 写寄存器时序](#timing-apb-write) 和 [APB 读寄存器时序](#timing-apb-read)。

### UART 串口接口 {#uart-uart}

UART 串口接口用于连接外部 UART 设备。

| 信号 | 方向 | 说明 |
| ---- | ---- | ---- |
| `rx_i` | 输入 | UART 串行接收信号，由外部设备输入 |
| `tx_o` | 输出 | UART 串行发送信号，由本模块输出 |
| `irq_o` | 输出 | UART 中断请求信号，输出给系统中断控制逻辑 |

`rx_i` 是异步输入，应在 `uart_rx` 内部先同步再使用。`tx_o` 由 `uart_tx` 状态机驱动，空闲时保持高电平。`irq_o` 由中断 pending 状态组合产生。

### 模块划分

读源码或自己实现时，建议按下面顺序理解模块边界：

| 模块 | 位置 | 主要职责 | 继续阅读 |
| ---- | ---- | -------- | -------- |
| `apb4_uart` | 顶层 | APB4 地址译码、寄存器读写、FIFO 连接、子模块例化 | [apb4_uart 顶层模块](#apb4-uart) |
| `uart_tx` | 发送通路 | 从 TX FIFO 取并行字节，转换为 UART 串行帧 | [uart_tx 发送模块](#uart-tx) |
| `uart_rx` | 接收通路 | 同步 `rx_i`，采样 UART 帧，恢复并行字节 | [uart_rx 接收模块](#uart-rx) |
| `uart_irq` | 状态与中断 | 根据 FIFO 状态、错误状态和中断使能产生 `irq_o` | [uart_irq 中断模块](#uart-irq) |
| `uart_if` | 对外接口 | 统一定义 `rx_i`、`tx_o`、`irq_o` | [UART 串口接口](#uart-uart) |
| `uart_define.svh` | 公共定义 | 定义寄存器地址、字段宽度和复位值 | [寄存器速查表](#reg-table) |

从功能上看，可以把它们归成三类：

| 类别 | 包含内容 | 设计重点 |
| ---- | -------- | -------- |
| 总线与寄存器逻辑 | `apb4_uart`、`uart_define.svh` | 地址译码、寄存器读写、状态返回 |
| 数据收发逻辑 | TX FIFO、RX FIFO、`uart_tx`、`uart_rx` | 用 FIFO 分离 APB4 访问和 UART bit 时序 |
| 状态与中断逻辑 | `uart_irq`、`LSR` 状态寄存器 | 把硬件状态转换成软件可查询、可响应的状态 |

### 数据通路 {#datapath}

发送和接收是两条方向相反的数据通路，`TRX` 是软件侧共同入口。

| 方向 | 数据来源 | 缓冲结构 | 处理模块 | 数据输出 |
| ---- | -------- | -------- | -------- | -------- |
| 发送通路 | 软件写入 `TRX` 寄存器 | TX FIFO | `uart_tx` | `tx_o` |
| 接收通路 | 外部设备输入 `rx_i` | RX FIFO | `uart_rx` | 软件读取 `TRX` 寄存器 |

发送侧由软件写入 TX FIFO，接收侧由 `uart_rx` 写入 RX FIFO。FIFO 的作用是将 APB4 的快速访问和 UART 的慢速 bit 传输分离开，避免软件跟着每一位串口时序工作。

### 控制通路

控制通路负责把软件配置分发给硬件模块：

| 控制对象 | 控制内容 | 来自寄存器 |
| -------- | -------- | ---------- |
| `uart_tx` | 波特率分频、数据位长度、停止位、校验方式 | `DIV`、`LCR` |
| `uart_rx` | 波特率分频、数据位长度、停止位、校验方式 | `DIV`、`LCR` |
| TX/RX FIFO | FIFO 清空、写入、读取、RX 触发阈值 | `FCR`、`TRX` |
| `uart_irq` | 中断使能、FIFO 状态、错误状态 | `LCR`、`LSR` 相关状态 |

一句话区分它们：数据通路搬运字节，控制通路决定字节按什么格式发送、什么时候产生中断、软件能看到哪些状态。

### 时钟与复位

本设计使用 APB4 总线时钟 `pclk` 作为内部主时钟。寄存器、FIFO、发送模块、接收模块和中断模块都工作在 `pclk` 下。复位信号为低有效 `presetn`。

复位后应满足以下状态：

| 对象 | 复位后状态 |
| ---- | ---------- |
| 配置寄存器 | 恢复默认值 |
| TX FIFO / RX FIFO | 清空 |
| `uart_tx` | 回到空闲态，`tx_o` 保持高电平 |
| `uart_rx` | 回到等待起始位状态 |
| 中断输出 | 无 pending 中断时 `irq_o` 为低 |

## 寄存器说明 {#registers}

寄存器是软件和硬件之间的合同。软件不需要知道 `uart_tx` 里有多少状态，但它必须知道写哪个寄存器可以发送数据，读哪个状态位可以判断 FIFO 是否满。

<img src="../../../res/img/ip/uart_main/uart_register_map.webp" alt="UART 寄存器与硬件模块关系" style="zoom:100%;" />

### 寄存器速查表 {#reg-table}

UART 内部寄存器通过 APB4 总线访问，地址按 4 字节对齐。当前设计主要包含 `LCR`、`DIV`、`TRX`、`FCR` 和 `LSR` 五个寄存器。

| 寄存器 | 偏移地址 | 访问属性 | 作用 |
| ------ | -------- | -------- | ---- |
| `LCR` | `0x00` | 读写 | 配置数据位、停止位、校验方式和中断使能 |
| `DIV` | `0x04` | 读写 | 配置波特率分频值 |
| `TRX` | `0x08` | 读写 | 写入时进入 TX FIFO，读取时从 RX FIFO 取数 |
| `FCR` | `0x0C` | 读写 | 清空 FIFO，配置 RX FIFO 中断触发阈值 |
| `LSR` | `0x10` | 只读 | 反馈 FIFO、发送器、接收器和中断状态 |

推荐理解顺序是：先看 `DIV` 和 `LCR` 确定 UART 怎么工作，再看 `TRX` 知道数据怎么进出，最后看 `FCR` 和 `LSR` 理解缓冲和状态反馈。

### LCR 线控制寄存器 {#reg-lcr}

`LCR` 决定 UART 以什么格式收发数据，也控制中断是否允许输出。它影响 [uart_tx 发送模块](#uart-tx)、[uart_rx 接收模块](#uart-rx) 和 [uart_irq 中断模块](#uart-irq)。

| 字段功能 | 用途 | 连接到的硬件逻辑 |
| -------- | ---- | ---------------- |
| 数据位长度 | 选择 5、6、7、8 bit 数据长度 | TX/RX 的 bit 计数上限 |
| 停止位长度 | 选择 1 或 2 个停止位 | TX/RX 的 stop 状态计数 |
| 校验方式 | 关闭校验、奇校验、偶校验、固定 0、固定 1 | TX 的校验位生成、RX 的校验检查 |
| 中断使能 | 允许 RX、TX、校验错误中断输出 | `uart_irq` |

设计时不要让 `uart_tx` 和 `uart_rx` 各自保存一套重复配置。更清晰的方式是让顶层寄存器逻辑统一产生配置线，再把配置线接到两个模块。

### DIV 分频寄存器 {#reg-div}

`DIV` 用于配置 UART 的 bit 时间，偏移地址为 `0x04`。该寄存器低 16 位有效，高 16 位保留。发送模块和接收模块都使用该分频值。

本工程常用配置如下：

```c
UART1_REG_DIV = 434;  // 50MHz / 115200
```

发送侧计满一次 `DIV` 就切换下一位；接收侧先等 `DIV/2` 确认起始位中心，再按 `DIV` 周期采样数据位。

### TRX 收发数据寄存器 {#reg-trx}

`TRX` 是发送和接收共用的数据窗口，偏移地址为 `0x08`，低 8 位有效。

写 `TRX` 会 push TX FIFO，读 `TRX` 会 pop RX FIFO。因此这两个动作必须只在 APB4 access 握手完成时发生一次。具体写法见 [APB4 访问逻辑](#apb4-access)。

### FCR FIFO 控制寄存器 {#reg-fcr}

`FCR` 用于控制 TX FIFO 和 RX FIFO，偏移地址为 `0x0C`。

它主要做两件事：

1. 清空 TX FIFO 和 RX FIFO。
2. 配置 RX FIFO 中断触发阈值。

本工程初始化时使用如下写法：

```c
UART1_REG_FCR = 0b1111;  // 清空 TX/RX FIFO，并设置 RX 触发阈值
UART1_REG_FCR = 0b1100;  // 释放 FIFO clear
```

这里的两次写入很关键：第一次让 clear 信号有效，第二次释放 clear 信号。RX 触发阈值越低，中断响应越快但次数越多；阈值越高，中断次数越少但单次处理数据更多。

### LSR 线状态寄存器 {#reg-lsr}

`LSR` 是只读状态寄存器，偏移地址为 `0x10`。软件发送、接收和处理中断时都要读它。

| 状态 | 含义 | 软件怎么用 |
| ---- | ---- | ---------- |
| `FULL` | TX FIFO 已满 | 发送前轮询该位，为 0 才写 `TRX` |
| `EMPT` | RX FIFO 为空 | 读取前可用它判断是否没有数据 |
| `TEMT` | TX FIFO 为空且发送模块空闲 | 用于等待所有数据真正发送完成 |
| `THRE` | TX FIFO 为空 | 可继续批量写入待发送数据 |
| `PE` | 接收数据存在校验错误 | 错误处理或统计 |
| `DR` | RX FIFO 中存在有效数据 | 为 1 时读取 `TRX` |
| `RXIP` | 接收中断 pending | 中断处理函数判断来源 |
| `TXIP` | 发送中断 pending | 中断处理函数判断来源 |
| `PEIP` | 校验错误中断 pending | 中断处理函数判断来源 |

发送一个字节最少只需要两个动作：

```c
while (UART1_REG_LSR & UART_LSR_FULL) {
    ;
}
UART1_REG_TRX = ch;
```

接收一个字节则是：

```c
if (UART1_REG_LSR & UART_LSR_DR) {
    ch = UART1_REG_TRX & 0xff;
}
```

如果要等所有数据真正离开发送线，应看 `TEMT`，不要只看 `THRE`。`THRE` 只能说明 TX FIFO 空了，最后一个字节可能还在发送状态机里。


## 硬件实现思路 {#hardware}

这一节按硬件连接顺序展开：顶层先接 APB4 和寄存器，再把 `TRX` 接到 FIFO，然后分别实现 TX、RX 和 IRQ。

### apb4_uart 顶层模块 {#apb4-uart}

`apb4_uart` 是整个控制器的集成层。它主要完成四件事：

1. APB4 地址译码和寄存器读写。
2. TX/RX FIFO 的 push、pop 和状态汇总。
3. 把 `LCR`、`DIV`、`FCR` 配置送到 TX、RX 和 IRQ 模块。
4. 例化 `uart_tx`、`uart_rx` 和 `uart_irq`。

顶层内部可以按四类关系来读：配置写入由 APB4 地址译码后更新 `LCR`、`DIV` 和 `FCR`；发送数据由 `TRX` 写入进入 TX FIFO，再交给 `uart_tx` 输出到 `tx_o`；接收数据从 `rx_i` 进入 `uart_rx`，写入 RX FIFO 后由 `TRX` 读访问返回给 CPU；中断则由 FIFO 状态、TX/RX 状态和错误状态共同决定，最后反映到 `LSR` 和 `irq_o`。

### APB4 访问逻辑 {#apb4-access}

寄存器访问逻辑的核心是只在 APB4 access 握手完成时产生读写动作：

```systemverilog
logic apb_wr_en;
logic apb_rd_en;

assign apb_wr_en = apb.psel && apb.penable && apb.pwrite  && apb.pready;
assign apb_rd_en = apb.psel && apb.penable && !apb.pwrite && apb.pready;
```

写逻辑先处理普通配置寄存器：

```systemverilog
always_ff @(posedge apb.pclk or negedge apb.presetn) begin
  if (!apb.presetn) begin
    lcr_q <= LCR_RESET_VALUE;
    div_q <= DIV_RESET_VALUE;
    fcr_q <= FCR_RESET_VALUE;
  end else if (apb_wr_en) begin
    unique case (apb.paddr)
      UART_LCR_ADDR: lcr_q <= apb.pwdata;
      UART_DIV_ADDR: div_q <= apb.pwdata;
      UART_FCR_ADDR: fcr_q <= apb.pwdata;
      UART_TRX_ADDR: begin
        // TRX 写入不保存到普通寄存器，而是 push TX FIFO
      end
      default: ;
    endcase
  end
end
```

读逻辑把寄存器、RX FIFO 数据和状态寄存器组合到 `prdata`：

```systemverilog
always_comb begin
  unique case (apb.paddr)
    UART_LCR_ADDR: apb.prdata = lcr_q;
    UART_DIV_ADDR: apb.prdata = div_q;
    UART_TRX_ADDR: apb.prdata = {24'b0, rx_fifo_rdata};
    UART_FCR_ADDR: apb.prdata = fcr_q;
    UART_LSR_ADDR: apb.prdata = lsr_status;
    default:       apb.prdata = 32'b0;
  endcase
end
```

`TRX` 读写要直接接 FIFO：

```systemverilog
assign tx_fifo_wr = apb_wr_en && (apb.paddr == UART_TRX_ADDR) && !tx_fifo_full;
assign tx_fifo_wdata = apb.pwdata[7:0];

assign rx_fifo_rd = apb_rd_en && (apb.paddr == UART_TRX_ADDR) && !rx_fifo_empty;
```

这就是 APB4 UART 顶层最关键的分界：`LCR`、`DIV`、`FCR` 是配置寄存器，`TRX` 是 FIFO 访问窗口，`LSR` 是状态窗口。

### TX/RX FIFO {#fifo}

本设计使用两个 FIFO 做数据缓冲：

| FIFO | 写入方 | 读取方 | 解决的问题 |
| ---- | ------ | ------ | ---------- |
| TX FIFO | 软件写入 `TRX` | `uart_tx` | 软件可以快速写入多个字节，不必等待每帧发送结束 |
| RX FIFO | `uart_rx` | 软件读取 `TRX` | 接收到的数据可以先缓存，软件稍后读取 |

FIFO 至少要提供这些信号：

| 信号 | 含义 |
| ---- | ---- |
| `wr_en` | 写使能 |
| `wdata` | 写数据 |
| `rd_en` | 读使能 |
| `rdata` | 读数据 |
| `full` | FIFO 已满 |
| `empty` | FIFO 为空 |
| `level` | 当前缓存数据数量，用于 RX 触发阈值 |

加入 FIFO 后，APB4 的快速寄存器访问和 UART 的慢速串行传输可以各按自己的节奏运行。

### uart_tx 发送模块 {#uart-tx}

`uart_tx` 负责把 TX FIFO 里的并行字节变成 UART 串行帧。完整流程图见 [UART 发送流程](#flow-tx)，实际输出波形见 [UART 发送帧时序](#timing-tx)。

发送模块内部通常包含这些寄存器或信号：

| 寄存器/信号 | 作用 |
| ----------- | ---- |
| `tx_state` | 当前发送状态，例如 IDLE、START、DATA、PARITY、STOP |
| `baud_cnt` | 根据 `DIV` 计数，控制每个 bit 的持续时间 |
| `bit_cnt` | 已发送的数据 bit 数 |
| `tx_shift` | 保存当前待发送字节，按低位优先移出 |
| `parity_bit` | 根据数据和 `LCR` 配置生成的校验位 |

状态机可以按下面逻辑写：

| 状态 | 输出或动作 | 下一个状态 |
| ---- | ---------- | ---------- |
| IDLE | `tx_o=1`，等待 TX FIFO 非空 | 取数后进入 START |
| START | `tx_o=0`，保持一个 bit 时间 | DATA |
| DATA | 低位先输出 `tx_shift`，每 bit 保持一个 bit 时间 | PARITY 或 STOP |
| PARITY | 如果启用校验，输出 `parity_bit` | STOP |
| STOP | `tx_o=1`，保持 1 或 2 个 bit 时间 | FIFO 非空继续 START，否则 IDLE |

写代码时抓住一个原则：状态跳转只在 bit 时间结束时发生。`baud_cnt` 计满之前，`tx_o` 应保持不变。

### uart_rx 接收模块 {#uart-rx}

`uart_rx` 负责从 `rx_i` 接收 UART 帧，并恢复成并行字节。完整流程图见 [UART 接收流程](#flow-rx)，采样点位置见 [UART 接收采样时序](#timing-rx)。

接收比发送更容易出错，因为采样点必须对准 bit 中心。接收模块建议按下面四步实现：

1. 对 `rx_i` 做两级同步。
2. 在空闲态检测同步后信号的下降沿。
3. 等待半个 bit 时间，在起始位中心确认它仍然为低。
4. 每隔一个 bit 时间采样一个数据位，采完后检查校验位和停止位。

状态机可以按下面逻辑写：

| 状态 | 动作 | 异常处理 |
| ---- | ---- | -------- |
| IDLE | 等待 `rx_i` 从 1 变 0 | 无 |
| START | 等待 `DIV/2` 后确认起始位仍为 0 | 如果已回到 1，认为是毛刺，回 IDLE |
| DATA | 每隔 `DIV` 采样一次，低位先写入 `rx_shift` | 数据位数量由 `LCR` 决定 |
| PARITY | 如果启用校验，采样并比较校验位 | 不一致则置位 `PE` |
| STOP | 采样停止位，应为 1 | 一帧结束后产生 `rx_valid` |

`rx_valid` 只应该拉高一个 `pclk` 周期，用来写 RX FIFO：

```systemverilog
assign rx_fifo_wr = rx_valid && !rx_fifo_full;
assign rx_fifo_wdata = rx_data;
```

如果 RX FIFO 已满，设计中需要明确处理逻辑：丢弃新数据、覆盖旧数据或增加溢出状态位。本文列出的状态位没有单独包含 overflow，因此实现和验证时要确认 RTL 对满 FIFO 接收的处理方式。

### uart_irq 中断模块 {#uart-irq}

`uart_irq` 的职责是把硬件状态转换成一个给 CPU 的中断请求。它不搬运数据，只判断“现在是否需要软件介入”。完整处理过程见 [中断处理流程](#flow-irq)。

中断逻辑可以写成：

```systemverilog
assign rx_irq_pending = rx_irq_en && (rx_fifo_level >= rx_trigger_level);
assign tx_irq_pending = tx_irq_en && tx_fifo_empty;
assign pe_irq_pending = pe_irq_en && parity_error_pending;

assign uart.irq_o = rx_irq_pending | tx_irq_pending | pe_irq_pending;
```

这里有两个设计点需要明确：

* pending 是“状态型”还是“锁存型”。状态型 pending 会随着 FIFO 数据量的变化自动消失；锁存型 pending 需要软件读/写某个寄存器清除。
* 每类中断都要有明确退出条件。RX 中断通过读取 `TRX` 降低 FIFO 水位退出；TX 中断通过写入新数据或关闭 TX 中断退出；校验错误中断通过读取状态并处理错误数据退出。

本工程文档中 `LSR` 提供 `RXIP`、`TXIP` 和 `PEIP` 三个 pending 状态。软件可先读 [LSR 线状态寄存器](#reg-lsr) 判断中断来源，再执行对应处理。

## 工作流程 {#workflow}

这一节从软件使用角度看完整流程。每个流程都配了现有流程图，并标出它和寄存器、硬件模块的关系。

### 软件初始化流程 {#flow-init}

UART 初始化要按顺序完成波特率、FIFO 和帧格式配置。初始化流程如下：

<img src="../../../res/img/ip/uart_main/initialization.webp" alt="UART 初始化流程" style="zoom:100%;" />

本工程的初始化代码如下：

```c
UART1_REG_DIV = 434;        // 50MHz / 115200
UART1_REG_FCR = 0b1111;     // 清空 TX/RX FIFO，并设置 RX 触发阈值
UART1_REG_FCR = 0b1100;     // 释放 FIFO clear
UART1_REG_LCR = 0b00011111; // 配置 UART 数据格式，并使能相关中断
```

每一步对应的硬件效果如下：

| 步骤 | 写入寄存器 | 硬件效果 |
| ---- | ---------- | -------- |
| 1 | `DIV` | `uart_tx` 和 `uart_rx` 获得 bit 时间 |
| 2 | `FCR=0b1111` | TX/RX FIFO 被清空，RX 触发阈值被设置 |
| 3 | `FCR=0b1100` | FIFO clear 释放，FIFO 可以正常收发 |
| 4 | `LCR` | 设置数据位、停止位、校验方式和中断使能 |

初始化完成后，UART 才进入正常收发状态。

### UART 发送流程 {#flow-tx}

发送流程图如下：

<img src="../../../res/img/ip/uart_main/TX.webp" alt="UART 发送流程" style="zoom:100%;" />

发送时只抓住两点：写 `TRX` 前先确认 TX FIFO 未满；如果要等最后一位真正发完，看 `TEMT`，不要只看 `THRE`。

一个最小发送函数可以写成：

```c
void uart_putc(uint8_t ch)
{
    while (UART1_REG_LSR & UART_LSR_FULL) {
        ;
    }
    UART1_REG_TRX = ch;
}
```

### UART 接收流程 {#flow-rx}

接收流程图如下：

<img src="../../../res/img/ip/uart_main/RX.webp" alt="UART 接收流程" style="zoom:100%;" />

接收时只抓住两点：硬件在 bit 中心采样，软件只在 `LSR.DR=1` 时读取 `TRX`。如果启用了校验，再结合 `PE` 或 `PEIP` 判断是否要丢弃数据。

一个最小接收函数可以写成：

```c
int uart_getc(uint8_t *ch)
{
    if ((UART1_REG_LSR & UART_LSR_DR) == 0) {
        return 0;
    }

    *ch = UART1_REG_TRX & 0xff;
    return 1;
}
```

### 中断处理流程 {#flow-irq}

UART 中断由 `uart_irq` 模块产生。中断来源主要包括 RX FIFO 触发、TX FIFO 为空以及接收校验错误。

中断产生与清除流程如下：

<img src="../../../res/img/ip/uart_main/FIFO.webp" alt="UART 中断产生与清除流程" style="zoom:100%;" />

中断服务函数的基本结构如下：

```c
void uart_irq_handler(void)
{
    uint32_t lsr = UART1_REG_LSR;

    if (lsr & UART_LSR_RXIP) {
        while (UART1_REG_LSR & UART_LSR_DR) {
            uint8_t ch = UART1_REG_TRX & 0xff;
            // 处理接收到的 ch
        }
    }

    if (lsr & UART_LSR_TXIP) {
        while ((UART1_REG_LSR & UART_LSR_FULL) == 0) {
            // 如果软件发送缓冲区还有数据，继续写 TRX
            // 如果没有数据，可以退出或关闭 TX 中断
            break;
        }
    }

    if (lsr & UART_LSR_PEIP) {
        // 读取错误状态，统计或丢弃错误数据
    }
}
```

中断处理的核心原则是：先读 `LSR` 判断来源，再通过读 `TRX`、写 `TRX` 或处理错误状态让 pending 条件消失。

## 时序分析 {#timing}

这一节专门对应已有时序图。看 RTL 波形时，可以按表格里的检查项逐项确认。

### APB 写寄存器时序 {#timing-apb-write}

APB 写操作分为 setup 和 access 两个阶段。setup 阶段 `psel` 拉高，地址和写数据保持稳定；access 阶段 `penable` 拉高，当 `pready` 有效时完成写访问。

写握手条件为：

```systemverilog
apb.psel && apb.penable && apb.pwrite && apb.pready
```

时序图如下：

<img src="../../../res/img/ip/uart_main/Sequence%20Diagram1.webp" alt="APB 写寄存器时序" style="zoom:100%;" />

看波形时重点检查：

| 检查项 | 期望结果 |
| ------ | -------- |
| setup 阶段 | `paddr`、`pwdata` 稳定，但不产生寄存器写副作用 |
| access 阶段 | `penable=1` 且 `pready=1` 时写入一次 |
| 写 `TRX` | TX FIFO 只 push 一次 |
| 写 `FCR` | clear 信号按配置拉高或释放 |

### APB 读寄存器时序 {#timing-apb-read}

APB 读操作同样分为 setup 和 access 两个阶段。setup 阶段地址保持稳定；access 阶段 `penable` 拉高，从设备通过 `prdata` 返回读数据。

读握手条件为：

```systemverilog
apb.psel && apb.penable && !apb.pwrite && apb.pready
```

时序图如下：

<img src="../../../res/img/ip/uart_main/Sequence%20Diagram2.webp" alt="APB 读寄存器时序" style="zoom:100%;" />

看波形时重点检查：

| 检查项 | 期望结果 |
| ------ | -------- |
| 读 `LCR/DIV/FCR/LSR` | `prdata` 返回对应寄存器或状态 |
| 读 `TRX` | `prdata[7:0]` 返回 RX FIFO 当前数据 |
| 读 `TRX` 副作用 | RX FIFO 只 pop 一次 |
| RX FIFO 为空时读 `TRX` | 返回值和错误处理策略应在设计中明确 |

### UART 发送帧时序 {#timing-tx}

UART 发送线 `tx_o` 空闲时为高电平。发送开始时，`tx_o` 先拉低一个 bit 时间作为起始位，随后按低位优先发送数据位。如果启用校验，再发送校验位；最后发送停止位，使 `tx_o` 回到高电平。

时序图如下：

<img src="../../../res/img/ip/uart_main/Sequence%20Diagram3.webp" alt="UART 发送帧时序" style="zoom:100%;" />

看波形时重点检查：

| 检查项 | 期望结果 |
| ------ | -------- |
| 空闲态 | `tx_o=1` |
| 起始位 | `tx_o=0`，持续一个 bit 时间 |
| 数据位 | 低位先发，每一位持续 `DIV` 个 `pclk` 周期 |
| 校验位 | 只有启用校验时出现 |
| 停止位 | `tx_o=1`，持续 1 或 2 个 bit 时间 |
| 连续发送 | 一帧结束后，如果 TX FIFO 非空，可以立即开始下一帧 |

### UART 接收采样时序 {#timing-rx}

UART 接收模块先检测 `rx_i` 的下降沿。检测到下降沿后，模块等待半个 bit 时间，在起始位中心确认低电平；之后每隔一个 bit 时间，在每个数据位中心采样一次。

时序图如下：

<img src="../../../res/img/ip/uart_main/Sequence%20Diagram4.webp" alt="UART 接收采样时序" style="zoom:100%;" />

看波形时重点检查：

| 检查项 | 期望结果 |
| ------ | -------- |
| `rx_i` 同步 | 外部输入先经过同步寄存器 |
| 起始位确认 | 下降沿后等待 `DIV/2` 再判断 |
| 数据采样 | 每隔 `DIV` 周期采样一次 |
| bit 顺序 | 第一次数据采样写入 bit0 |
| `rx_valid` | 一帧结束后拉高一个 `pclk` 周期 |
| RX FIFO 写入 | `rx_valid` 有效且 FIFO 未满时 push |

## 实现清单 {#checklist}

如果要从零写出一个 APB4 UART 控制器，可以按下面顺序实现。每一步都能单独验证，整体风险会低很多。

| 步骤 | 做什么 | 验证目标 |
| ---- | ------ | -------- |
| 1 | 定义 `uart_if` 和 `uart_define.svh`，列出 `LCR/DIV/TRX/FCR/LSR` 偏移 | testbench 能例化顶层，APB4 读默认值正确 |
| 2 | 实现 [APB4 访问逻辑](#apb4-access)，先只支持普通寄存器读写 | 写 `DIV/LCR/FCR` 后能读回 |
| 3 | 加入 [TX/RX FIFO](#fifo)，把 `TRX` 读写接到 FIFO | 写 `TRX` 增加 TX FIFO level，读 `TRX` 弹出 RX FIFO |
| 4 | 实现 [uart_tx](#uart-tx)，先固定 8N1，再接 `LCR` | 发送 `0x55` 时 `tx_o` bit 顺序和 bit 宽度正确 |
| 5 | 实现 [uart_rx](#uart-rx)，先固定 8N1，再接 `LCR` | 输入合法帧后 `rx_valid` 拉高，`rx_data` 正确 |
| 6 | 实现 [uart_irq](#uart-irq) | RX 阈值、TX 空、校验错误能产生对应 pending 和 `irq_o` |
| 7 | 顶层联调 | 初始化后能完成 `uart_putc`、`uart_getc` 和中断处理 |

顶层联调可以用下面的软件流程驱动：

```c
UART1_REG_DIV = 434;
UART1_REG_FCR = 0b1111;
UART1_REG_FCR = 0b1100;
UART1_REG_LCR = 0b00011111;

uart_putc('A');
uart_getc(&ch);
```

联调时至少覆盖这些场景：

| 场景 | 预期 |
| ---- | ---- |
| 软件写 `TRX='A'` | `tx_o` 输出字符 `A` 的 UART 帧 |
| testbench 驱动 `rx_i` 输入字符 | 软件读 `TRX` 得到同一字符 |
| RX 中断 | 软件读出数据后 pending 消失 |
| TX 中断 | 软件补充发送数据后 pending 变化正确 |
| 校验错误 | `PE` 或 `PEIP` 被置位，软件能识别错误来源 |

