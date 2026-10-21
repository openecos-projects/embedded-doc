# sfud 串行 Flash 驱动

标准 SFUD 库（Armink）：自动识别 SPI NOR Flash 并提供统一读写接口。

- 组件 ID：`sfud`
- 头文件：`sfud.h`，配置见 `sfud_cfg.h`
- 依赖：Board 提供 `qspi` 和 `console` 能力
- 示例：`examples/storage/flash-sfud`

## 函数

```c
sfud_err sfud_init(void);
sfud_err sfud_device_init(sfud_flash *flash);
sfud_flash *sfud_get_device(size_t index);
size_t sfud_get_device_num(void);
sfud_flash *sfud_get_device_table(void);

sfud_err sfud_read(const sfud_flash *flash, uint32_t addr, size_t size,
                   uint8_t *data);
sfud_err sfud_erase(const sfud_flash *flash, uint32_t addr, size_t size);
sfud_err sfud_write(const sfud_flash *flash, uint32_t addr, size_t size,
                    const uint8_t *data);
sfud_err sfud_erase_write(const sfud_flash *flash, uint32_t addr, size_t size,
                          const uint8_t *data);
sfud_err sfud_chip_erase(const sfud_flash *flash);
sfud_err sfud_read_status(const sfud_flash *flash, uint8_t *status);
sfud_err sfud_write_status(const sfud_flash *flash, bool is_volatile,
                           uint8_t status);
```

| 函数 | 说明 |
| --- | --- |
| `sfud_init()` | 探测并初始化设备表中的所有 Flash |
| `sfud_device_init()` | 初始化单个 Flash 设备 |
| `sfud_get_device()` / `sfud_get_device_num()` | 按索引取设备对象/设备数量 |
| `sfud_get_device_table()` | 返回设备表 |
| `sfud_read()` / `sfud_write()` / `sfud_erase()` | 按地址读写、擦除 |
| `sfud_erase_write()` | 擦除后写入 |
| `sfud_chip_erase()` | 整片擦除 |
| `sfud_read_status()` / `sfud_write_status()` | 读写状态寄存器 |

## 使用示例

```c
#include "sfud.h"

void check_flash(void)
{
    sfud_flash *flash;
    uint8_t id[3];

    if (sfud_init() != SFUD_SUCCESS)
        return;

    flash = sfud_get_device(0);
    if (flash == NULL)
        return;

    if (sfud_read(flash, 0u, sizeof(id), id) == SFUD_SUCCESS) {
        /* 使用 id…… */
    }
}
```

## 错误码与配置

- 错误类型 `sfud_err`：`SFUD_SUCCESS = 0`、`SFUD_ERR_NOT_FOUND`、
  `SFUD_ERR_WRITE`、`SFUD_ERR_READ`、`SFUD_ERR_TIMEOUT`、
  `SFUD_ERR_ADDR_OUT_OF_BOUND` 等。
- 设备对象类型 `sfud_flash`。
- SDK 配置（`sfud_cfg.h`）：启用 `SFUD_USING_SFDP`；`SFUD_FLASH_DEVICE_TABLE`
  预置一块 W25Q64CV @ SPI0。

## 注意事项

- 擦除粒度由 Flash 芯片决定；写入前必须确保目标区域已擦除。
- 示例覆盖初始化与设备识别；实板擦写、校验和掉电恢复仍按人工验收清单执行。
- 底层 QSPI 命令/地址事务见 [QSPI 驱动](../driver/qspi.md)。
