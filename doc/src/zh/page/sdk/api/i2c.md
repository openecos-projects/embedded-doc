# I2C API

## 目录

一、核心类型定义 (I2C Types)

1. 寄存器地址长度枚举 (i2c_reg_addr_len_t)
2. 驱动配置结构体 (i2c_config_t)

二、初始化配置 (Initialization)

1. I2C 初始化函数 (i2c_init)

三、数据传输接口 (Data Transfer APIs)

1. 多字节写入函数 (i2c_write_nbyte)
2. 多字节读取函数 (i2c_read_nbyte)

## 详细介绍

### 一、核心类型定义 (I2C Types)

#### 1. 寄存器地址长度枚举 (i2c_reg_addr_len_t)
（1）功能描述

用于定义目标外设寄存器地址的宽度。由于不同复杂度的 I2C 设备，简单的 像IO 扩展器复杂的例如 EEPROM寄存器，寻址范围不同，该枚举函数决定了驱动在传输起始阶段发送地址字节的次数。

（2）关键代码引用

```
// 引用自 i2c_type.h
typedef enum {
    I2C_REG_8 = 8,   // 8位地址长度，支持 256 个寄存器
    I2C_REG_16 = 16, // 16位地址长度，支持 65536 个寄存器
} i2c_reg_addr_len_t;
```

#### 2. 驱动配置结构体 (i2c_config_t)
（1）功能描述

该结构体封装了 I2C 总线的基础时序参数。

* 成员变量：uint32_t pscr
* 逻辑解析：该变量直接写入预分频寄存器，用于将系统时钟分频以产生 I2C 标准频率，是用来确保总线时序同步的物理基础。

### 二、初始化配置 (Initialization)

#### 1. I2C 初始化函数 (i2c_init)
（1）功能描述

该函数负责 I2C 控制器的硬件唤醒及总线使能，在配置时钟频率前需先复位控制器状态。

（2）关键代码引用

```
// 引用自 i2c.c
REG_I2C_0_CTRL = (uint32_t)0;          // 步骤1：禁用控制器，进入配置模式
REG_I2C_0_PSCR = config->pscr;         // 步骤2：加载预分频参数，设定通信速率
REG_I2C_0_CTRL = (uint32_t)0b10000000;  // 步骤3：Bit 7 置 1，开启 I2C 模块逻辑
```

* 配置注意：通过先清零 CTRL 寄存器，可以避免在更改分频参数时总线产生不可预期的电平毛刺。
* 使能机制：Bit 7 是 I2C IP 核的全局使能位，只有在该位置 1 后，内部状态机才开始响应 CMD 寄存器的指令。

### 三、数据传输接口 (Data Transfer APIs)

#### 1. 多字节写入函数 (i2c_write_nbyte)
（1）功能描述

该函数可以实现完整的 I2C 写操作，包括起始位、从机地址寻址、寄存器偏移量定位及数据流写入。

（2）关键代码引用

```
// 引用自 i2c.c
// 1. 地址兼容处理：根据枚举值决定发送 1 个或 2 个字节的寄存器地址
if(reg_addr_len == I2C_REG_8){
    i2c_write_byte((uint8_t)(reg_addr & 0xFF));
}else{
    i2c_write_byte((uint8_t)(reg_addr >> 8) & 0xFF); // 先发高 8 位
    i2c_write_byte((uint8_t)(reg_addr & 0xFF));      // 再发低 8 位
}

// 2. 连续写入：利用 for 循环实现 Block Write
for(uint32_t i=0; i<len; i++){
    i2c_write_byte(data[i]);
}
```

* 从高到低位传输：在 16 位地址模式下，代码通过位移操作 >> 8 优先发送高字节，符合 I2C 协议普遍的顺序标准。

* 自动应答检查：底层 i2c_write_byte 内部集成了对 ACK 的轮询，确保每个字节都已被从机正确接收。

#### 2. 多字节读取函数 (i2c_read_nbyte)
（1）功能描述

该函数用于执行复合格式读取，首先通过“伪写”操作告知从机目标地址，随后切换至读取模式提取数据。

（2）关键代码引用

```
// 引用自 i2c.c
// 阶段 1：数据提取。对于前 len-1 个字节，主机需回复 ACK 以维持从机发送
for(uint32_t i=0; i<len-1; i++){
    data[i] = i2c_read_byte(I2C_READ_ACK);
}

// 阶段 2：结束阶段。接收最后一个字节后回复 NACK，随后发送停止位
data[len-1] = i2c_read_byte(I2C_READ_NACK); 
i2c_stop();
```

* ACK 控制逻辑：这是 I2C 读取最核心的细节,主机通过 I2C_READ_ACK 告诉从机可以继续接受数据，而在接收最后一个字节时，必须通过 I2C_READ_NACK 来明确告知从机传输结束。
* 状态同步：函数末尾的 i2c_stop() 会轮询 BUSY 标志位，确保总线电平完全释放后才退出，防止连续调用时产生冲突。





















