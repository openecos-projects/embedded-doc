# PWM API

## 核心类型定义 (PWM Types)

### 驱动配置结构体 (`pwm_config_t`)

用于初始化 PWM 模块的全局参数，即基础频率。该结构体定义的参数决定了 PWM 波形的“大框架”，即载波频率。

```c title="pwm_type.h"
typedef struct {
    uint32_t pscr; // 预分频系数
    uint32_t cmp;  // 自动重装载值
} pwm_config_t;
```

**成员变量解析**

| 成员变量 | 描述 | 详细说明 |
| :--- | :--- | :--- |
| `pscr` (Prescaler) | 预分频系数 | 对原始时钟进行降频，决定计数器的递增速度。 |
| `cmp` (Period/Compare) | 自动重装载值 | 决定了计数器数到多少后归零，从而确定波形的完整周期。 |

### 通道选择枚举 (`pwm_channel_t`)

将硬件 PWM 控制器的物理输出通道映射为逻辑常量，确保精确控制特定的引脚输出。

```c title="pwm_type.h"
typedef enum {
    PWM_CH0 = 0,
    PWM_CH1 = 1,
    PWM_CH2 = 2,
    PWM_CH3 = 3,
} pwm_channel_t;
```

*   **范围**：支持 `PWM_CH0` 到 `PWM_CH3` 四个独立通道。
*   **数值**：枚举值直接对应硬件通道索引 0-3。

## 配置体系 (Configuration Object)

### PWM 初始化函数 (`pwm_init`)

作为 PWM 驱动的总入口，负责激活硬件模块并设定全局时序基准。

```c title="pwm.h"
void pwm_init(pwm_config_t* config);
```

**参数解析**

*   `config`: 指向配置结构体的指针。
    *   **注意**：调用前需先根据目标频率计算好 `pscr` 和 `cmp`。

## 功能接口 (Functional APIs)

### 占空比设置函数 (`pwm_set_compare`)

在 PWM 模块运行过程中，动态修改特定通道的比较值，从而实时改变输出波形的占空比。

```mermaid
graph LR
    A[调用 pwm_set_compare] --> B[选择对应通道 ch]
    B --> C[写入新 cmp 值]
    C --> D[下个周期生效<br>占空比更新]
```

```c title="pwm.h"
void pwm_set_compare(pwm_channel_t ch, uint32_t cmp);
```

**参数解析**

| 参数 | 类型 | 说明 |
| :--- | :--- | :--- |
| `ch` | `pwm_channel_t` | 目标物理通道。 |
| `cmp` | `uint32_t` | 该通道的比较值。**注意**：该值必须小于 `pwm_init` 中设定的全局 `cmp` 值。数值越大，输出高电平的时长就越长。 |















