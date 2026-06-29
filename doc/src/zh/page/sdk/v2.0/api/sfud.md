# SFUD API 2.0

!!! info "文档说明"

    本文档介绍 SDK 2.0 版本中 SFUD 组件的通用 SPI Flash 操作接口。SFUD用于屏蔽不同 SPI NOR Flash 的容量、擦除粒度、写入模式和 JEDEC/SFDP 参数差异，开发者可通过统一接口完成 Flash 初始化、读取、擦除、写入、整片擦除和状态寄存器访问。


## 概述
### 版本特性

SDK 2.0 版本的 SFUD 组件基于通用 Flash 抽象实现，支持通过 JEDEC ID 识别芯片、通过 SFDP 自动解析容量与擦除参数，并在 SFDP 不可用时回退到静态 Flash 信息表。当前默认配置使用软件 SPI 端口适配层，默认设备为 `W25Q64CV`，并开启 SFDP 与 Flash 信息表支持。
SFUD 会在初始化阶段完成端口初始化、JEDEC ID 读取、Flash 参数识别、芯片复位、必要的 4 字节地址模式切换等流程。完成初始化后，应用层可直接使用 `sfud_read`、`sfud_erase`、`sfud_write` 等接口访问片外 Flash。

### 适用范围

适用于 SDK 所支持的所有板卡上的 SPI NOR Flash 存储场景，包括参数保存、固件数据存储、文件系统底层块设备、日志缓存、资源文件读取、Flash 读写验证等。


## 头文件与依赖
### 核心头文件

```c title="main.c"
#include "sfud.h"
```

*   **sfud.h**：SFUD 对外接口头文件，包含初始化、设备获取、读写擦除、状态寄存器访问等核心函数声明。
*   **sfud_def.h**：定义错误码、Flash 设备对象、SPI 端口对象、SFDP 参数结构体、状态寄存器位等核心数据类型。
*   **sfud_flash_def.h**：定义 Flash 厂商 ID、芯片参数表、写入模式、QSPI 扩展读取信息等。
*   **sfud_cfg.h**：SFUD 配置文件，用于配置默认 Flash 设备表、是否启用 SFDP、是否启用静态 Flash 信息表、是否启用 QSPI 等。

### 编译依赖

*   **CONFIG_COMPONENT_SFUD**：该宏用于在板卡构建配置中开启 SFUD 组件编译，不定义此宏时，`components/sfud/src` 不会被加入工程。
*   **CONFIG_COMPONENT_SPI_SOFTWARE**：当前 `sfud_port.c` 端口层使用软件 SPI 的 `MYSPI_Init`、`MYSPI_Start`、`MYSPI_SwapByte`、`MYSPI_Stop` 接口，需要同时开启软件 SPI 组件。
*   **CONFIG_DRIVER_TIMER**：当前端口层使用 `hal_delay_us` 作为 Flash 忙等待重试延时，需要 TIMER 驱动提供微秒级延时能力。
*   **日志组件**：`sfud_def.h` 通过 `log_info`、`log_debug` 输出运行日志，工程需提供 `log.h` 及对应日志函数。

### 默认配置

```c title="sfud_cfg.h"
#define SFUD_DEBUG_MODE
#define SFUD_USING_SFDP
#define SFUD_USING_FLASH_INFO_TABLE

enum {
    SFUD_W25Q64CV_DEVICE_INDEX = 0,
};

#define SFUD_FLASH_DEVICE_TABLE                                                
{                                                                              
    [SFUD_W25Q64CV_DEVICE_INDEX] = {.name = "W25Q64CV", .spi.name = "SPI0"},   
}

// #define SFUD_USING_QSPI
```

*   **SFUD_DEBUG_MODE**：开启调试日志与断言检查。
*   **SFUD_USING_SFDP**：优先通过 JEDEC SFDP 读取 Flash 容量、写入粒度、擦除命令等参数。
*   **SFUD_USING_FLASH_INFO_TABLE**：当 SFDP 不可用时，使用内置 Flash 信息表匹配芯片参数。
*   **SFUD_FLASH_DEVICE_TABLE**：定义工程中可使用的 Flash 设备表，当前默认只有一个设备，索引为 `SFUD_W25Q64CV_DEVICE_INDEX`。
*   **SFUD_USING_QSPI**：当前默认关闭，启用后还需要端口层实现 `qspi_read`。


## 核心数据类型
### 返回值类型

```c title="sfud_def.h"
typedef enum {
    SFUD_SUCCESS = 0,
    SFUD_ERR_NOT_FOUND = 1,
    SFUD_ERR_WRITE = 2,
    SFUD_ERR_READ = 3,
    SFUD_ERR_TIMEOUT = 4,
    SFUD_ERR_ADDR_OUT_OF_BOUND = 5,
} sfud_err;
```

*   **SFUD_SUCCESS**：操作成功。
*   **SFUD_ERR_NOT_FOUND**：未找到 Flash 芯片，或当前芯片不受支持。
*   **SFUD_ERR_WRITE**：写入失败，常见于写使能失败或状态寄存器写入失败。
*   **SFUD_ERR_READ**：读取失败。
*   **SFUD_ERR_TIMEOUT**：等待 Flash 空闲超时。
*   **SFUD_ERR_ADDR_OUT_OF_BOUND**：读写擦除地址超出 Flash 容量范围。

### Flash 写入模式

```c title="sfud_flash_def.h"
enum sfud_write_mode {
    SFUD_WM_PAGE_256B = 1 << 0,
    SFUD_WM_BYTE = 1 << 1,
    SFUD_WM_AAI = 1 << 2,
    SFUD_WM_DUAL_BUFFER = 1 << 3,
};
```

*   **SFUD_WM_PAGE_256B**：页编程模式，单次最多写入 256 字节，适用于常见 SPI NOR Flash。
*   **SFUD_WM_BYTE**：字节写入模式。
*   **SFUD_WM_AAI**：自动地址递增写入模式，常见于部分 SST 系列 Flash。
*   **SFUD_WM_DUAL_BUFFER**：双缓冲写入模式，常见于 AT45DB 系列 Flash。

### Flash 芯片参数

```c title="sfud_flash_def.h"
typedef struct {
    char *name;
    uint8_t mf_id;
    uint8_t type_id;
    uint8_t capacity_id;
    uint32_t capacity;
    uint16_t write_mode;
    uint32_t erase_gran;
    uint8_t erase_gran_cmd;
} sfud_flash_chip;
```

*   **name**：Flash 芯片名称，如 `W25Q64CV`。
*   **mf_id/type_id/capacity_id**：JEDEC ID 的厂商、类型、容量字段。
*   **capacity**：Flash 总容量，单位为字节。
*   **write_mode**：当前芯片支持的写入模式。
*   **erase_gran**：默认擦除粒度，单位为字节。
*   **erase_gran_cmd**：默认擦除命令。

### SPI 端口对象

```c title="sfud_def.h"
typedef struct __sfud_spi {
    char *name;
    sfud_err (*wr)(const struct __sfud_spi *spi,
                   const uint8_t *write_buf,
                   size_t write_size,
                   uint8_t *read_buf,
                   size_t read_size);
    void (*lock)(const struct __sfud_spi *spi);
    void (*unlock)(const struct __sfud_spi *spi);
    void *user_data;
} sfud_spi;
```

*   **name**：SPI 端口名称。
*   **wr**：SPI 写后读接口，端口层必须实现。SFUD 所有命令、地址、数据读写最终都通过该函数发送。
*   **lock/unlock**：SPI 总线加锁与解锁函数，多任务或多外设共享总线时建议实现。
*   **user_data**：端口层自定义数据指针，可保存硬件 SPI 句柄、片选信息等。

### Flash 设备对象

```c title="sfud_def.h"
typedef struct {
    char *name;
    size_t index;
    sfud_flash_chip chip;
    sfud_spi spi;
    bool init_ok;
    bool addr_in_4_byte;
    struct {
        void (*delay)(void);
        size_t times;
    } retry;
    void *user_data;
} sfud_flash;
```

*   **name/index**：设备名称与设备表索引。
*   **chip**：Flash 芯片参数，初始化后会保存容量、擦除粒度、写入模式等信息。
*   **spi**：与该 Flash 绑定的 SPI 端口操作对象。
*   **init_ok**：初始化成功标志，所有读写擦除接口都要求该标志有效。
*   **addr_in_4_byte**：是否进入 4 字节地址模式，容量大于 16 MB 的 Flash 会自动进入该模式。
*   **retry**：等待 Flash 空闲时的重试延时与次数。当前端口层默认每次延时约 100 us，最多约60s。


## SFUD 标准接口（sfud.h）
### SFUD 全局初始化

```c title="sfud.h"
sfud_err sfud_init(void);
```

*   **功能**：初始化 `SFUD_FLASH_DEVICE_TABLE` 中配置的所有 Flash 设备。
*   **返回值**：`SFUD_SUCCESS` 表示全部初始化成功，其他值表示至少一个 Flash 初始化失败。
*   **调用说明**：
    * 系统启动后、所有 Flash 读写操作前调用一次。
    * 内部会依次调用端口层初始化、读取 JEDEC ID、读取 SFDP 或匹配静态芯片表、复位 Flash、设置 4 字节地址模式等流程。
    * 初始化成功后，对应设备的 `init_ok` 会被置为 `true`。

### 单设备初始化

```c title="sfud.h"
sfud_err sfud_device_init(sfud_flash *flash);
```

*   **功能**：初始化指定 Flash 设备对象。
*   **参数说明**：
    * `flash`：指向待初始化的 `sfud_flash` 设备对象。
*   **返回值**：`SFUD_SUCCESS` 表示初始化成功，其他值表示初始化失败。
*   **调用说明**：通常应用层直接调用 `sfud_init` 即可，仅在需要单独重新初始化某个 Flash 设备时使用该接口。

### 获取 Flash 设备

```c title="sfud.h"
sfud_flash *sfud_get_device(size_t index);
size_t sfud_get_device_num(void);
sfud_flash *sfud_get_device_table(void);
```

*   **功能**：获取 Flash 设备对象、设备数量或设备表首地址。
*   **参数说明**：
    * `index`：Flash 设备表索引，当前默认设备索引为 `SFUD_W25Q64CV_DEVICE_INDEX`。
*   **返回值说明**：
    * `sfud_get_device`：索引有效时返回设备指针，索引越界时返回 `NULL`。
    * `sfud_get_device_num`：返回设备表中 Flash 设备数量。
    * `sfud_get_device_table`：返回 Flash 设备表首地址。
*   **调用说明**：应用层通常在 `sfud_init` 成功后获取设备指针，再传入读写擦除接口。

### 读取 Flash 数据

```c title="sfud.h"
sfud_err sfud_read(const sfud_flash *flash, uint32_t addr, size_t size, uint8_t *data);
```

*   **功能**：从指定 Flash 地址读取连续数据。
*   **参数说明**：
    * `flash`：已初始化成功的 Flash 设备指针。
    * `addr`：读取起始地址，范围为 `0 ~ flash->chip.capacity - 1`。
    * `size`：读取长度，单位为字节。
    * `data`：读取缓冲区指针，缓冲区长度需不小于 `size`。
*   **返回值**：`SFUD_SUCCESS` 表示读取成功，`SFUD_ERR_ADDR_OUT_OF_BOUND` 表示地址范围越界，其他值表示 SPI 通信或等待忙状态失败。
*   **调用说明**：
    * 必须在 `sfud_init` 或 `sfud_device_init` 成功后调用。
    * 普通 SPI 模式下使用 `0x03` 读命令。
    * 若启用 QSPI 快速读取并配置成功，读取时会调用端口层 `qspi_read`。

### 擦除 Flash 数据

```c title="sfud.h"
sfud_err sfud_erase(const sfud_flash *flash, uint32_t addr, size_t size);
```

*   **功能**：擦除指定地址范围内的 Flash 数据。
*   **参数说明**：
    * `flash`：已初始化成功的 Flash 设备指针。
    * `addr`：擦除起始地址。
    * `size`：擦除长度，单位为字节。
*   **返回值**：`SFUD_SUCCESS` 表示擦除成功，`SFUD_ERR_ADDR_OUT_OF_BOUND` 表示地址范围越界，其他值表示写使能、擦除命令或忙等待失败。
*   **调用说明**：
    * Flash 只能按擦除块擦除，实际擦除范围会覆盖 `addr ~ addr + size` 所在的完整擦除块。
    * 当 `addr` 为 0 且 `size` 等于 Flash 总容量时，内部会自动执行整片擦除。
    * 若 SFDP 可用，驱动会根据当前地址和剩余长度选择合适的擦除命令，优先减少擦除命令次数。
    * 如只更新擦除块内的部分数据，应用层需要先备份同一擦除块内不需要修改的数据，再整体擦除和重写。

### 写入 Flash 数据

```c title="sfud.h"
sfud_err sfud_write(const sfud_flash *flash, uint32_t addr, size_t size, const uint8_t *data);
```

*   **功能**：向指定 Flash 地址写入连续数据。
*   **参数说明**：
    * `flash`：已初始化成功的 Flash 设备指针。
    * `addr`：写入起始地址。
    * `size`：写入长度，单位为字节。
    * `data`：待写入数据缓冲区指针。
*   **返回值**：`SFUD_SUCCESS` 表示写入成功，`SFUD_ERR_ADDR_OUT_OF_BOUND` 表示地址范围越界，其他值表示写使能、页编程或忙等待失败。
*   **调用说明**：
    * 该接口**不会自动擦除 Flash**，写入前必须确保目标区域已擦除。
    * 常见 SPI NOR Flash 写入只能将 bit 从 1 写为 0，不能直接把 0 写回 1。
    * 页编程模式下驱动会自动按 256 字节页边界拆分写入，避免跨页写入错误。
    * 需要自动完成擦除与写入时，应使用 `sfud_erase_write`。

### 擦除并写入 Flash 数据

```c title="sfud.h"
sfud_err sfud_erase_write(const sfud_flash *flash, uint32_t addr, size_t size, const uint8_t *data);
```

*   **功能**：先擦除指定地址范围，再写入数据。
*   **参数说明**：
    * `flash`：已初始化成功的 Flash 设备指针。
    * `addr`：写入起始地址。
    * `size`：写入长度，单位为字节。
    * `data`：待写入数据缓冲区指针。
*   **返回值**：`SFUD_SUCCESS` 表示擦写成功，其他值表示擦除或写入失败。
*   **调用说明**：
    * 内部流程为 `sfud_erase` → `sfud_write`。
    * 擦除动作仍按擦除块生效，可能影响目标范围前后的同一擦除块数据。
    * 适合整块数据重写、测试写入、文件系统块擦写等场景。

### 整片擦除

```c title="sfud.h"
sfud_err sfud_chip_erase(const sfud_flash *flash);
```

*   **功能**：擦除整个 Flash 芯片。
*   **参数说明**：
    * `flash`：已初始化成功的 Flash 设备指针。
*   **返回值**：`SFUD_SUCCESS` 表示整片擦除成功，其他值表示写使能、擦除命令或忙等待失败。
*   **调用说明**：
    * 该操作会清空整片 Flash，执行时间通常较长。
    * 当前端口层忙等待超时时间约为 60 s，容量较大或速度较慢的 Flash 需确认超时配置是否足够。

### 读取状态寄存器

```c title="sfud.h"
sfud_err sfud_read_status(const sfud_flash *flash, uint8_t *status);
```

*   **功能**：读取 Flash 状态寄存器。
*   **参数说明**：
    * `flash`：Flash 设备指针。
    * `status`：状态寄存器输出指针。
*   **返回值**：`SFUD_SUCCESS` 表示读取成功，其他值表示 SPI 通信失败。
*   **状态位说明**：
    * `SFUD_STATUS_REGISTER_BUSY`：Flash 忙标志，置位表示正在擦除、写入或内部处理。
    * `SFUD_STATUS_REGISTER_WEL`：写使能锁存标志，置位表示已进入写使能状态。
    * `SFUD_STATUS_REGISTER_SRP`：状态寄存器保护标志。

### 写入状态寄存器

```c title="sfud.h"
sfud_err sfud_write_status(const sfud_flash *flash, bool is_volatile, uint8_t status);
```

*   **功能**：写入 Flash 状态寄存器。
*   **参数说明**：
    * `flash`：Flash 设备指针。
    * `is_volatile`：`true` 表示使用易失写状态流程，`false` 表示使用非易失写状态流程。
    * `status`：待写入的状态寄存器值。
*   **返回值**：`SFUD_SUCCESS` 表示写入成功，其他值表示写使能或 SPI 通信失败。
*   **调用说明**：
    * 修改状态寄存器可能改变块保护、写保护等行为，需严格参考目标 Flash 数据手册。
    * 初始化 AAI 写入模式 Flash 时，驱动会使用该接口清除保护位。

### QSPI 快速读取配置

```c title="sfud.h"
sfud_err sfud_qspi_fast_read_enable(sfud_flash *flash, uint8_t data_line_width);
```

*   **功能**：启用 QSPI 快速读取模式，选择适合当前 Flash 的双线或四线读取命令。
*   **参数说明**：
    * `flash`：已初始化成功的 Flash 设备指针。
    * `data_line_width`：QSPI 数据线宽，只支持 `1`、`2`、`4`。
*   **返回值**：`SFUD_SUCCESS` 表示配置成功。
*   **调用说明**：
    * 仅在定义 `SFUD_USING_QSPI` 时可用。
    * 必须在 `sfud_device_init` 或 `sfud_init` 成功后调用。
    * 当前 `sfud_port.c` 中 `qspi_read` 仍为空实现，启用 QSPI 前必须完成端口层适配。


## 使用示例
### 基础读写验证

```c title="main.c"
#include "sfud.h"

#define TEST_ADDR 0
#define TEST_SIZE 1024

static uint8_t write_buf[TEST_SIZE];
static uint8_t read_buf[TEST_SIZE];

void flash_test(void)
{
    sfud_err result;
    const sfud_flash *flash;

    result = sfud_init();
    if (result != SFUD_SUCCESS) {
        return;
    }

    flash = sfud_get_device(SFUD_W25Q64CV_DEVICE_INDEX);
    if (flash == NULL) {
        return;
    }

    for (size_t i = 0; i < TEST_SIZE; i++) {
        write_buf[i] = i & 0xFF;
    }

    result = sfud_erase(flash, TEST_ADDR, TEST_SIZE);
    if (result != SFUD_SUCCESS) {
        return;
    }

    result = sfud_write(flash, TEST_ADDR, TEST_SIZE, write_buf);
    if (result != SFUD_SUCCESS) {
        return;
    }

    result = sfud_read(flash, TEST_ADDR, TEST_SIZE, read_buf);
    if (result != SFUD_SUCCESS) {
        return;
    }
}
```

### 擦除写入合并流程

```c title="main.c"
sfud_err flash_save_data(uint32_t addr, const uint8_t *data, size_t len)
{
    const sfud_flash *flash = sfud_get_device(SFUD_W25Q64CV_DEVICE_INDEX);

    if (flash == NULL) {
        return SFUD_ERR_NOT_FOUND;
    }

    return sfud_erase_write(flash, addr, len, data);
}
```

*   **使用说明**：
    * `sfud_erase_write` 适合整块数据更新。
    * 若只更新擦除块内的局部字段，需要应用层维护读改写流程，避免同一擦除块内其他数据被擦除。


!!! info "端口层实现说明"

    *   当前 `sfud_spi_port_init` 会调用 `MYSPI_Init()` 初始化软件 SPI，并将 `flash->spi.wr` 绑定到 `spi_write_read`。
    *   `spi_write_read` 在一次事务中先发送 `write_buf`，再发送 `SFUD_DUMMY_DATA` 读取 `read_buf`，事务开始和结束分别调用 `MYSPI_Start()` 与 `MYSPI_Stop()`。
    *   当前端口层未实现 `lock/unlock`，多任务或多外设共享 SPI 时需补充总线互斥。
    *   当前端口层默认重试延时为 100 us，重试次数为 `60 * 10000`，忙等待最长约 60 s。
    *   当前默认未启用 QSPI，若开启 `SFUD_USING_QSPI`，必须实现 `qspi_read` 并确认 Flash 支持对应读取模式。


!!! info "硬件通用限制说明"

    *   SPI NOR Flash 写入前必须擦除，普通写入接口不会自动擦除。
    *   擦除粒度由芯片参数决定。
    *   擦除和写入均为阻塞式操作，驱动会轮询状态寄存器 BUSY 位直到 Flash 空闲或超时。
    *   读写擦除地址必须位于 `0 ~ flash->chip.capacity - 1` 范围内。
    *   容量大于 16 MB 的 Flash 初始化时会尝试进入 4 字节地址模式。
    *   当前默认使用软件 SPI，传输速度低于硬件 SPI，适合功能验证和低速访问场景。


!!! info "通用使用规则"

    *   **标准流程**：`sfud_init` 初始化 → `sfud_get_device` 获取设备 → `sfud_erase` 擦除 → `sfud_write` 写入 → `sfud_read` 读取。
    *   **擦写规则**：需要把 0 写回 1 时必须先擦除；只写入已擦除区域时可直接调用 `sfud_write`。
    *   **范围规则**：每次读写擦除前确认 `addr + size` 不超过 `flash->chip.capacity`。
    *   **数据保护规则**：局部更新 Flash 时先备份同一擦除块内的旧数据，再擦除并重写完整块。
    *   **异常处理**：所有接口都应检查 `sfud_err` 返回值，出现 `SFUD_ERR_TIMEOUT` 时重点检查 Flash 供电、片选、SPI 时序和写保护状态。
