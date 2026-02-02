# PWM API

## 目录

一、核心类型定义（PWM Types）

1. 驱动配置结构体 (pwm_config_t)
2. 通道选择枚举 (pwm_channel_t)

二、配置体系（Configuration Object）

1. PWM 初始化函数 (pwm_init)

三、功能接口（Functional APIs）

1. 占空比设置函数 (pwm_set_compare)

## 详细介绍

### 一、核心类型定义（PWM Types）

#### 1. 驱动配置结构体 (pwm_config_t)
（1）功能描述

用于初始化 PWM 模块的全局参数,也就是基础频率。

（2）成员变量解析

* uint32_t pscr (Prescaler)：预分频系数,对原始时钟进行降频，来决定计数器的递增速度 。
* uint32_t cmp (Period/Compare)：自动重装载值。决定了计数器数到多少后归零，从而确定波形的完整周期 。

#### 2. 通道选择枚举 (pwm_channel_t)
（1）功能描述

将硬件 PWM 控制器的物理输出通道映射为逻辑常量，确保我们精确控制特定的引脚输出 。

* 范围：支持PWM_CH0到PWM_CH3四个独立通道 。

* 数值：枚举值直接对应硬件通道索引 0-3 。

### 二、配置体系（Configuration Object）

#### 1. PWM 初始化函数 (pwm_init)
（1）功能描述

作为 PWM 驱动的总入口，负责激活硬件模块并设定全局时序基准 。

* 多IP支持：通过 CONFIG_PWM_IP_ID 宏切换，可以兼容不同版本的硬件控制器 。
* 寄存器联动：通过写入REG_PWM_0_PSCR设定分频 ；写入REG_PWM_0_CMP设定周期上限 ；最后向REG_PWM_0_CTRL写入 3，同步开启时钟使能与计数使能，正式启动硬件计数 。

（2）参数解析

* 参数：pwm_config_t* config

* 含义：指向配置结构体的指针，调用前需先根据目标频率计算好 pscr和 cmp。

### 三、功能接口（Functional APIs）

#### 1. 占空比设置函数 (pwm_set_compare)
（1）功能描述

在 PWM 模块运行过程中，动态修改特定通道的比较值，从而实时改变输出波形的占空比 。

（2）参数解析

参数1：pwm_channel_t ch —— 目标物理通道 

参数2：uint32_t cmp —— 该通道的比较值，注意该值必须小于pwm_init 中设定的全局cmp 值。数值越大，输出高电平的时长就越长。














