# GPIO API

## 目录

一、核心类型定义（GPIO Types）

1. 引脚编号枚举 (gpio_num_t)

2. 模式控制枚举 (gpio_mode_t)

3. 电平逻辑枚举 (gpio_level_t)

4. GPIO复用功能枚举（gpio_func_t）

二、配置体系（Configuration Object）

1. 驱动配置结构体 (gpio_config_t)

2. 统一配置函数（gpio_config）

三、功能接口（Functional APIs）

1. 设置电平函数（gpio_set_level）

2. 获取电平函数（gpio_get_level）

3. 配置引脚复用功能（gpio_set_function）

4. 设置引脚方向函数（gpio_set_direction）

   
## 详细介绍

### 一、核心类型定义（GPIO Types）

####  1. 引脚编号枚举（gpio_num_t）
(1) 功能描述

该函数可以将硬件物理管脚映射为逻辑常量，通过枚举类型代替宏定义，可以在编译阶段提供强类型检查，防止非法地址传入。

(2) 关键代码引用

```
// 引用自 gpio_type.h
typedef enum {
    GPIO_NUM_0 = 0,
    GPIO_NUM_1 = 1,
    // ... 
    GPIO_NUM_63 = 63,
    GPIO_NUM_MAX
} gpio_num_t;
```

* 硬件映射一致性：枚举值直接对应硬件寄存器的位偏移，使得代码中的引脚号与手册中的物理引脚一一对应。
* 编译期防护：若传入负数或超出 GPIO_NUM_MAX 的值，静态检查工具能及时预警，避免非法内存访问。

#### 2. 模式控制枚举（gpio_mode_t）
(1) 功能描述

该函数用于定义引脚的输入/输出属性，决定内部数据总线与物理引脚之间的信号流向。

(2) 关键代码引用

```
typedef enum {
    GPIO_MODE_INPUT  = 0,  // 高阻输入，用于感测信号
    GPIO_MODE_OUTPUT = 1,  // 推挽输出，用于驱动负载
} gpio_mode_t;
```

* 状态确定：可以明确区分输入与输出，在输出模式下，驱动能力增强；在输入模式下，引脚呈现高阻抗，减少对外部信号源的影响。

#### 3. 电平逻辑枚举（gpio_level_t）
(1) 功能描述

该枚举用于标准化引脚的逻辑电平状态，通过定义明确的逻辑高与逻辑低，屏蔽了底层不同硬件架构对于“1”和“0”的具体电压定义，增强了代码的可读性。

(2) 关键代码引用

```
// 引用自 gpio_type.h
typedef enum {
    GPIO_LEVEL_LOW  = 0,  // 逻辑低电平 (通常对应 GND)
    GPIO_LEVEL_HIGH = 1   // 逻辑高电平 (通常对应 VCC)
} gpio_level_t;
```

* 严谨的逻辑映射：虽然底层寄存器使用单比特存储状态，但使用枚举值可以有效避免在逻辑中直接出现硬编码的 0 或 1，使得代码意图更清晰。

* 统一电平标准：在处理反向逻辑时，我们可以基于此枚举构建中间层，确保在整个工程范围内逻辑电平的一致性。

* 寄存器兼容：枚举值 0 和 1 的设计直接兼容大多数 SoC 的 SET/CLR 寄存器位操作需求，无需额外的类型转换即可进行位运算。

#### 4. GPIO复用功能枚举（gpio_func_t）
(1) 功能描述

该枚举可以定义引脚的“多重身份”，现代芯片的引脚通常连接到一个复杂的信号交换矩阵，该枚举用于指定某个物理引脚当前是作为普通 GPIO 使用，还是切换为 UART、PWM 或 QSPI 等专用外设路径。

(2) 关键代码引用

```
// 引用自 gpio_type.h
typedef enum {
    GPIO_FUNC_GPIO  = 0,  // 普通通用输入输出功能
    GPIO_FUNC_UART  = 1,  // 切换为串口传输模式
    GPIO_FUNC_PWM   = 2,  // 切换为脉冲宽度调制输出
    GPIO_FUNC_QSPI  = 3,  // 切换为高速串行外设接口
    GPIO_FUNC_MAX
} gpio_func_t;
```

* 硬件信号控制：每一个枚举值实际上对应着引脚控制寄存器中 FUNC_SEL 字段的配置值，选择不同的项，本质上是在调整芯片内部的“电子开关”，将引脚导向不同的硬件控制器。
* 引脚资源冲突保护：通过枚举化管理，可以在初始化阶段明确引脚的归属，如果两个外设尝试复用同一个引脚，可以通过检查 gpio_func_t 的状态来预防硬件冲突。
* 外设路径激活：只有当引脚被设置为特定的非 GPIO 功能时，相应的硬件外设发出的信号才能真正到达物理引脚。

### 二、配置体系（Configuration Object）

#### 1.驱动配置结构体 (gpio_config_t)
(1) 功能描述

该结构体是一个轻量级的配置包，采用“声明式”设计，允许先定义一组引脚的期望状态，再进行一次性初始化。

(2) 关键代码引用

```
// 引用自 gpio_type.h
typedef struct {
    uint64_t pin_bit_mask;    // 引脚掩码：Bit 0~63 对应 GPIO 0~63
    gpio_mode_t mode;         // 目标工作模式
} gpio_config_t;
```

* 多引脚同步选择：利用 uint64_t 的每一位代表一个引脚，例如传入 (1ULL << 4) | (1ULL << 5) ，即可同时选中 GPIO4 和 GPIO5 。

#### 2. 统一配置函数（gpio_config）
(1) 功能描述

该函数是GPIO 驱动的总入口，负责解析配置结构体，并将参数落实到物理寄存器中。

(2) 关键代码引用

```
// 引用自 gpio.c
void gpio_config(const gpio_config_t *config) {
    for (int i = 0; i < 64; i++) {
        if ((config->pin_bit_mask >> i) & 1) { // 步骤1：遍历并识别掩码位
            gpio_set_direction(i, config->mode); // 步骤2：写入方向寄存器
        }
    }
}
```

* 位掩码循环解析：函数内部通过 for 循环轮询 64 位掩码，这种设计支持一次性配置任意组合的引脚，极大提升了初始化效率 。
* 底层配置：在循环内调用底层方向设置函数，确保配置过程的逻辑一致性。
* 消除硬件依赖：开发者只需修改结构体成员，而无需了解底层具体的 DIRECTION 寄存器地址，实现了应用层与驱动层的分离 。

### 三、功能接口（Functional APIs）

#### 1.设置电平函数（gpio_set_level）
(1) 功能描述

该函数通过指令改变物理引脚的电压状态，用于驱动 LED、继电器或发送数字信号等。

(2) 关键代码引用

```
// 引用自 gpio.c
void gpio_set_level(gpio_num_t gpio_num, gpio_level_t level) {
    if (level == GPIO_LEVEL_HIGH) {
        REG_GPIO_OUT_SET = (1ULL << gpio_num); // 步骤1：对应位置1输出高
    } else {
        REG_GPIO_OUT_CLR = (1ULL << gpio_num); // 步骤2：对应位清零输出低
    }
}
```

* 寄存器加速访问：代码采用 SET/CLR 寄存器组而非直接读改写，这避免了多任务环境下的位冲突问题 。
* 即时生效：指令执行后，硬件逻辑立即调整 CMOS 驱动管状态，将逻辑信号转化为物理电压。
* 范围越界保护：内部通常包含对 gpio_num 的合法性检查，防止对保留位进行非法写入。

#### 2.获取电平函数（gpio_get_level）
(1) 功能描述

该函数用于感知外部信号，读取引脚当前的逻辑电平，常用于按键扫描或传感器数据提取。

(2) 关键代码引用

```
// 引用自 gpio.c
int gpio_get_level(gpio_num_t gpio_num) {
    // 读取输入数据寄存器并提取对应位
    return (int)((REG_GPIO_IN >> gpio_num) & 0x1); 
}
```

* 硬件同步：函数直接访问硬件输入寄存器，确保读到的是引脚上的真实实时电平，而非软件缓存值 。
* 反馈确认机制：该函数常作为控制逻辑的反馈环，用于确认 gpio_set_level 后的硬件状态是否由于负载过大而未达标。
* 信号一致性：返回值为 0 或 1，屏蔽了底层具体的电压波动，为应用层提供清晰的逻辑状态 。

#### 3.配置引脚复用功能（gpio_set_function）
(1) 功能描述

该函数可以切换引脚的硬件身份，将其从普通 I/O 切换到特定的高速外设路径。

(2) 关键代码引用

```
// 引用自 gpio.c
void gpio_set_function(gpio_num_t gpio_num, gpio_func_t func) {
    // 定位到具体的引脚复用控制寄存器 (IOMUX)
    uint32_t reg_val = REG_GPIO_FUNC_SEL[gpio_num];
    reg_val &= ~FUNC_MASK;        // 清除旧功能
    reg_val |= (func << FUNC_SFT); // 写入新功能编号
    REG_GPIO_FUNC_SEL[gpio_num] = reg_val;
}
```

* 硬件路径切换：该函数控制着芯片内部的信号交换矩阵，通过修改寄存器值，可以将物理引脚的连接点从 GPIO 模块重定向到其他硬件控制器。
* 灵活性分配：同一物理引脚可被定义为多种角色，开发者可根据板级布局灵活分配引脚资源。
* 隔离保护：在切换功能前，系统通常会暂时禁用引脚驱动，防止在切换瞬间产生不可预测的逻辑竞争 。

#### 4. 设置引脚方向函数（gpio_set_direction）
(1) 功能描述

该函数用于在程序运行期间，根据业务需求动态调整引脚的输入或输出方向。

(2) 关键代码引用

```
// 引用自 gpio.c
void gpio_set_direction(gpio_num_t gpio_num, gpio_mode_t direction) {
    if (direction == GPIO_MODE_OUTPUT) {
        REG_GPIO_DIR |= (1ULL << gpio_num); // 设置为输出方向
    } else {
        REG_GPIO_DIR &= ~(1ULL << gpio_num); // 设置为输入方向
    }
}
```

* 动态状态切换：支持如 I2C 数据线这种需要在收发之间快速切换方向的总线协议。
* 位操作精准度：通过 |= 和 &= ~ 确保仅修改目标引脚的方向位，而不干扰总线上其他 63 个引脚的状态 。
* 低功耗控制：将不使用的引脚动态设置为输入方向并拉低，可以有效降低引脚上的漏电流。











