# sfud Serial Flash Driver

The standard SFUD library (Armink): automatically identifies SPI NOR Flash and provides a unified read/write interface.

- Component ID: `sfud`
- Header: `sfud.h`; configuration in `sfud_cfg.h`
- Dependencies: the Board provides the `qspi` and `console` capabilities
- Example: `examples/storage/flash-sfud`

## Functions

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

| Function | Description |
| --- | --- |
| `sfud_init()` | Probe and initialize all Flash devices in the device table |
| `sfud_device_init()` | Initialize a single Flash device |
| `sfud_get_device()` / `sfud_get_device_num()` | Get a device object by index / get the device count |
| `sfud_get_device_table()` | Return the device table |
| `sfud_read()` / `sfud_write()` / `sfud_erase()` | Read/write and erase by address |
| `sfud_erase_write()` | Erase then write |
| `sfud_chip_erase()` | Erase the entire chip |
| `sfud_read_status()` / `sfud_write_status()` | Read/write the status register |

## Usage Example

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
        /* use id... */
    }
}
```

## Error Codes and Configuration

- Error type `sfud_err`: `SFUD_SUCCESS = 0`, `SFUD_ERR_NOT_FOUND`,
  `SFUD_ERR_WRITE`, `SFUD_ERR_READ`, `SFUD_ERR_TIMEOUT`,
  `SFUD_ERR_ADDR_OUT_OF_BOUND`, etc.
- Device object type `sfud_flash`.
- SDK configuration (`sfud_cfg.h`): enables `SFUD_USING_SFDP`; `SFUD_FLASH_DEVICE_TABLE`
  presets one W25Q64CV @ SPI0.

## Notes

- Erase granularity is determined by the Flash chip; before writing, make sure the target area has been erased.
- The examples cover initialization and device identification; real-board erase/write, verification, and power-loss recovery are still performed according to the manual acceptance checklist.
- For the underlying QSPI command/address transactions, see [QSPI driver](../driver/qspi.md).
