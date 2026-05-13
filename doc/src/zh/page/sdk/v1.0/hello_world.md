# Hello World 示例工程

本示例工程旨在展示如何在板卡上完成最基础的硬件初始化，主要包括通过串口打印“Hello, World!”字符串，这是开发者上手该硬件平台的第一步，用于验证编译链、烧录工具及基础运行时环境是否工作正常。

### 1. 支持的板卡

本示例支持基于 RISC-V 架构 的 SoC 系列板卡：星空L和星空C系列。根据 sections.lds 的配置，该工程具备高度的内存适配性，例如内部 SRAM 运行模式适用于资源精简型应用；外部 PSRAM 扩展模式支持在大容量 PSRAM 中运行代码和存储数据；Flash 直接运行模式可以让代码存储于 Flash，数据存放于内部 SRAM。

### 2. 核心功能实现详解

该工程通过汇编与 C 语言协作，完成了从上电到输出结果的全过程。

#### 2.1 硬件复位与栈初始化

```
start:
# zero-initialize register file
addi x1, zero, 0
la sp, _stack_point
...
addi x31, zero, 0
```

* 寄存器清零：在程序刚上电时，为了保证系统处于确定的状态，汇编代码将 RISC-V 的 31 个通用寄存器全部手动置零 。
* 设置栈指针 (SP)：通过加载链接脚本定义的 _stack_point 地址，初始化栈指针 。

#### 2.2 C 运行时环境 (CRT) 加载

```
# copy data section
la a0, _sidata
la a1, _sdata
la a2, _edata
loop_init_data:
lw a3, 0(a0)
sw a3, 0(a1)
...
blt a1, a2, loop_init_data
```

* 数据搬运 (.data)：已初始化的全局变量在 Flash 中备份，程序通过 _sidata（Flash 中源地址）和 _sdata（RAM 中目标地址）定义的范围，将这些数据搬移到 RAM 中，以便程序在运行期间可以读写它们 。

  

```
# zero-init bss section
la a0, _sbss
la a1, _ebss
loop_init_bss:
sw zero, 0(a0)
...
blt a0, a1, loop_init_bss
```

BSS 段清零：为了节省 Flash 空间，未初始化的全局变量不存储在 Flash 中，该循环利用链接脚本定义的 _sbss 和 _ebss 符号，将 RAM 中对应的内存区域全部填充为零 。

#### 2.3 应用层逻辑实现

```
void main(void){
    sys_uart_init();
    printf("Hello, World!\n");
}
```

* 串口驱动初始化：调用 sys_uart_init() 配置硬件 UART 控制器（包括波特率、GPIO 复用等） 。

* 标准输出：使用 printf 函数向串口线发送字符串 ，由于前两个步骤（栈初始化和数据拷贝）已经完成，此时 C 语言环境已经完全可用。

  

### 3. 代码结构与流程说明

#### 3.1 文件组织结构

(1) start.s：入口文件，负责最底层的 CPU 寄存器初始化和 C 环境搭建 。

(2) sections.lds：内存地图，规定了代码 (.text)、变量 (.data) 以及栈 (.stack) 的物理地址分配 。

(3) main.c：逻辑文件，用户代码入口，执行串口打印任务 。

(4) main.h：配置文件，包含系统头文件及 PSRAM 频率计算宏 。

#### 3.2 程序运行流程图

![board](../../../res/img/sdk/quickstart/hello_world.webp)

### 4. 预期展示效果

连接串口调试助手（例如设置波特率为 115200），按下板卡的复位键，您将看到控制台实时输出：

```
Hello, World!
```

