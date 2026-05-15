# PWM API 2.0

!!! info "文档说明"

    本文档介绍 SDK 2.0 版本中 PWM 驱动的统一 HAL 接口。该接口采用硬件抽象层设计，标准化 API 定义，具备跨平台兼容性。开发者无需关注底层寄存器与位操作，直接调用统一接口即可完成 PWM 输出控制。



## 概述
### 版本特性

SDK 2.0 版本的 PWM 驱动基于统一 HAL_PWM 接口实现，兼容标准 HAL 开发习惯。驱动支持 PWM 周期与预分频配置、多通道独立占空比设置、全局使能控制，所有接口统一规范、参数清晰，可在不同硬件平台间无缝移植，大幅提升开发效率与代码稳定性。

### 适用范围

适用于 SDK 支持的所有板子上的 PWM 输出场景，包括 LED 呼吸灯、电机调速、蜂鸣器控制、舵机角度控制、模拟电压输出等。

## 头文件与依赖
### 核心头文件

```c title="pwm.c"
#include "hal_pwm.h"
#include "hal_pwm_type.h"
```

*   **hal_pwm_type.h**：定义 PWM 相关枚举、配置结构体、状态类型，提供强类型安全，避免非法参数传入。
*   **hal_pwm.h**：对外暴露标准 HAL_PWM 操作接口，包含初始化、占空比设置、使能、关闭等核心函数。

### 编译依赖

*   **CONFIG_DRIVER_PWM**：该宏用于在 Kconfig 中开启 PWM 驱动编译，不定义此宏时，驱动不会被编译进工程。

*   **CONFIG_CPU_FREQ_MHZ**：CPU 主频配置，用于 PWM 输出频率计算，必须正确配置以保证波形频率准确。


## 核心数据类型（hal_pwm_type.h）
### PWM 通道枚举

```c title="hal_pwm_type.h"
typedef enum{
    PWM_CH0 = 0,
    PWM_CH1 = 1,
    PWM_CH2 = 2,
    PWM_CH3 = 3,
    PWM_CH_MAX
} pwm_channel_t;
```

*   **范围**：支持 PWM_CH0 ~ PWM_CH3  4 路独立输出通道，实际可用通道数量由目标硬件决定。
*   **使用说明**：建议直接使用枚举值作为通道参数，避免使用裸数字导致通道配置错误。

### PWM 配置结构体

```c title="hal_pwm_type.h"
typedef struct {
    uint32_t pscr;  // 时钟预分频系数
    uint32_t cmp;   // 周期自动重装载值
} pwm_config_t;
```

*   **pscr**：预分频系数，对系统时钟进行分频，决定 PWM 计数器的计数时钟频率。
*   **cmp**：周期重装载值，决定 PWM 完整周期长度，数值越大周期越长。
*   **频率公式**：PWM 频率 = 系统时钟 / (pscr + 1) / (cmp + 1)。
*   **使用说明**：同一定时器下的所有通道共用同一套 pscr 与 cmp 配置。

### PWM 状态枚举

```c title="hal_pwm_type.h"
typedef enum {
    PWM_STATE_DISABLE = 0,
    PWM_STATE_ENABLE  = 1
} pwm_state_t;
```

*   **功能**：标识 PWM 模块当前工作状态，关闭或运行。
*   **使用说明**：用于驱动内部状态管理，上层可通过此枚举判断模块运行状态。


## HAL_PWM 标准接口（hal_pwm.h）
### PWM 初始化

```c title="hal_pwm.h"
uint8_t pwm_hal_init(void *hal, uint8_t timer_id, pwm_config_t *config);
```

*   **功能**：初始化指定 timer_id 的 PWM 硬件模块，配置预分频系数与周期值，设定 PWM 基础输出频率。
*   **参数说明**：
	* `hal`：PWM HAL 实例指针，可直接传入 NULL。
	* `timer_id`：PWM 定时器编号，用于区分不同 PWM 硬件单元，有效值由具体的板子决定。
	* `config`：指向 pwm_config_t 结构体的指针，包含预分频与周期配置参数。
*   **返回值**：0 表示操作成功，1 表示操作失败。
*   **调用说明**：上电后只需调用一次，用于配置 PWM 全局周期与时钟。

### 设置通道占空比

```c title="hal_pwm.h"
uint8_t pwm_hal_set_compare(void *hal, uint8_t timer_id, pwm_channel_t ch, uint32_t cmp);
```

*   **功能**：设置指定 PWM 通道的比较值，实时调整该通道的输出占空比，比较值越大高电平时间越长。
*   **参数说明**：
	* `hal`：PWM HAL 实例指针，可传入 NULL。
	* `timer_id`：目标 PWM 定时器编号。
	* `ch`：目标通道，使用 PWM_CH0 ~ PWM_CH3 枚举。
	* `cmp`：通道比较值，必须小于初始化时设置的周期 cmp 值。
*   **返回值**：0 成功，1 失败。
*   **调用说明**：可在 PWM 运行时动态调用，配置立即生效，无需重启模块。

### 使能 PWM 模块

```c title="hal_pwm.h"
uint8_t pwm_hal_enable(void *hal, uint8_t timer_id);
```

*   **功能**：启动指定 timer_id 的 PWM 硬件模块，开始输出波形。
*   **参数说明**：
	* `hal`：可传入 NULL。
	* `timer_id`：目标 PWM 定时器编号。
*   **返回值**：0 成功，1 失败。
*   **调用说明**：初始化与占空比配置完成后必须调用，PWM 才会真正从引脚输出。

### 失能 PWM 模块

```c title="hal_pwm.h"
uint8_t pwm_hal_disable(void *hal, uint8_t timer_id);
```

*   **功能**：停止指定 timer_id 的 PWM 模块，关闭波形输出，引脚恢复默认状态。
*   **参数说明**：
	* `hal`：可传入 NULL。
	* `timer_id`：目标 PWM 定时器编号。
*   **返回值**：0 成功，1 失败。

*   **调用说明**：用于暂停 PWM 输出、降低功耗或切换引脚功能时使用。


!!! info "硬件通用限制说明"

    *   同一定时器下的所有 PWM 通道共用同一套周期与时钟配置，无法独立设置频率。
    *   通道比较值必须小于周期重装载值，否则占空比输出异常。
    *   部分平台仅支持单一定时器 PWM，timer_id 固定为 0，具体以硬件手册为准。
    *   不支持独立通道使能/失能，所有通道同步启动与停止。

!!! info "通用使用规则"

    *   **标准使用流程**：pwm_hal_init → pwm_hal_set_compare → pwm_hal_enable。
    *   **动态调整流程**：pwm_hal_set_compare 可随时调用，无需重新初始化与使能。
    *   **停止流程**：直接调用 pwm_hal_disable 即可关闭所有通道输出。
    *   **频率配置**：修改 pscr 或 cmp 后需重新调用初始化接口才能生效。
