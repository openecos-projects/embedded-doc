# QSPI/SPI Master Driver

Raw frame writes for display controllers, plus SPI-Flash-style command/address/dummy transactions.

- Header: `ecos/driver/qspi.h`
- Example: `examples/peripherals/spi_master/st7789` (used with the ST7789 device driver)

## Types and Constants

```c
typedef uint8_t ecos_qspi_id_t;                /* QSPI controller instance number */

#define ECOS_QSPI_DEFAULT ((ecos_qspi_id_t)0u)  /* Default instance 0 */

typedef enum {
    ECOS_QSPI_CS_0 = 0,
    ECOS_QSPI_CS_1,
    ECOS_QSPI_CS_2,
    ECOS_QSPI_CS_3,
    ECOS_QSPI_CS_COUNT
} ecos_qspi_cs_t;                              /* Chip-select line number */

typedef struct {
    uint32_t clock_divider;   /* Clock divider; 0 means the Target default */
} ecos_qspi_config_t;

#define ECOS_QSPI_CONFIG_DEFAULT { 0u }
```

## Initialization

```c
int ecos_qspi_get_instance_count(void);
ecos_err_t ecos_qspi_init(ecos_qspi_id_t qspi, const ecos_qspi_config_t *config);
ecos_err_t ecos_qspi_deinit(ecos_qspi_id_t qspi);
```

`ecos_qspi_get_instance_count()` returns the number of QSPI controllers on the current Target.

## Frame Write

Each call = one CS assertion. CS0 is used by default; the `_cs`-suffixed versions explicitly specify the chip
select in the last parameter.

```c
ecos_err_t ecos_qspi_write_8(ecos_qspi_id_t qspi, uint8_t data);
ecos_err_t ecos_qspi_write_16(ecos_qspi_id_t qspi, uint16_t data);
ecos_err_t ecos_qspi_write_32(ecos_qspi_id_t qspi, uint32_t data);
ecos_err_t ecos_qspi_write_32_repeat(ecos_qspi_id_t qspi, uint32_t data,
                                     uint32_t words);
ecos_err_t ecos_qspi_write_32x2(ecos_qspi_id_t qspi,
                                uint32_t data1, uint32_t data2);
ecos_err_t ecos_qspi_write_32x8(ecos_qspi_id_t qspi,
                                uint32_t data1, uint32_t data2,
                                uint32_t data3, uint32_t data4,
                                uint32_t data5, uint32_t data6,
                                uint32_t data7, uint32_t data8);
ecos_err_t ecos_qspi_write_32x16(ecos_qspi_id_t qspi,
                                 uint32_t data1, /* ... 16 uint32_t values in total ... */
                                 uint32_t data16);
ecos_err_t ecos_qspi_write_32x32(ecos_qspi_id_t qspi,
                                 uint32_t data1, /* ... 32 uint32_t values in total ... */
                                 uint32_t data32);
```

Explicit chip-select versions (same names with `_cs`; the last parameter is `ecos_qspi_cs_t`):

```c
ecos_err_t ecos_qspi_write_8_cs(ecos_qspi_id_t qspi, uint8_t data,
                                ecos_qspi_cs_t cs);
ecos_err_t ecos_qspi_write_16_cs(ecos_qspi_id_t qspi, uint16_t data,
                                 ecos_qspi_cs_t cs);
ecos_err_t ecos_qspi_write_32_cs(ecos_qspi_id_t qspi, uint32_t data,
                                 ecos_qspi_cs_t cs);
ecos_err_t ecos_qspi_write_32x2_cs(ecos_qspi_id_t qspi, uint32_t data1,
                                   uint32_t data2, ecos_qspi_cs_t cs);
ecos_err_t ecos_qspi_write_32x8_cs(...);    /* 8 data words + cs */
ecos_err_t ecos_qspi_write_32x16_cs(...);   /* 16 data words + cs */
ecos_err_t ecos_qspi_write_32x32_cs(...);   /* 32 data words + cs */
```

| Function | Description |
| --- | --- |
| `write_8/16/32` | Write 1/2/4 bytes in a single transaction, commonly used for display controller commands and parameters |
| `write_32_repeat` | Write the same 32-bit word `words` times, used for full-screen/rectangle fills |
| `write_32xN` | Write N 32-bit words in sequence within a single CS assertion (x16/x32 take 16/32 separate `uint32_t` arguments) |

## Command/Address Transaction (always uses CS0)

SPI-Flash-style three-phase transaction, used by components such as sfud:

```c
ecos_err_t ecos_qspi_send_cmd(ecos_qspi_id_t qspi,
                              uint8_t command, uint8_t command_bits,
                              uint32_t address, uint8_t address_bits);
ecos_err_t ecos_qspi_write(ecos_qspi_id_t qspi,
                           uint8_t command, uint8_t command_bits,
                           uint32_t address, uint8_t address_bits,
                           const void *data, size_t size);
ecos_err_t ecos_qspi_read(ecos_qspi_id_t qspi,
                          uint8_t command, uint8_t command_bits,
                          uint32_t address, uint8_t address_bits,
                          uint8_t dummy_cycles, void *data, size_t size);
```

- `command_bits` / `address_bits`: lane width/bit count of the command and address; set to 0 to omit that phase.
- `ecos_qspi_send_cmd()`: send only the command (+ optional address).
- `ecos_qspi_write()`: command + address + data write.
- `ecos_qspi_read()`: command + address + dummy cycles + data read.

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/qspi.h"
#include "ecos/log.h"

#define LOG_TAG "qspi"

int main(void)
{
    const ecos_qspi_config_t config = { .clock_divider = 3u };

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_qspi_init(ECOS_QSPI_DEFAULT, &config),
                        "initialize QSPI");

    /* Write to display controller: single-byte command + repeated pixel for the whole frame */
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_qspi_write_8(ECOS_QSPI_DEFAULT, 0x2Cu),
                        "memory write command");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_qspi_write_32_repeat(ECOS_QSPI_DEFAULT,
                                                  0xF800F800u, 128u * 128u / 2u),
                        "fill red");
    for (;;)
        __asm__ volatile("nop");
}
```

## Notes

- **Each write call is an independent CS assertion**: calls are not merged into the same frame; if the protocol
  requires bytes to be in the same transaction, they must be placed in a single call (such as `write_32xN`).
- `write_32x16` / `write_32x32` have many parameters; real applications generally use them indirectly through the
  [ST7735/ST7789 device driver](../device/st7735.md).
- The command/address transaction group always uses CS0; in multi-slave scenarios you can only use the `_cs`
  versions of the frame-write group.
- `words` in `write_32_repeat` is the number of 32-bit words, not the number of bytes.
- **Target differences**: QSPI0 on cl1-2512 (StarrySky T1-Pico) supports only the command/address transaction group
  (QSPI protocol); the entire frame-write group returns `ECOS_ERR_UNSUPPORTED`, so display device drivers that rely
  on frame writes are unavailable on T1-Pico. Its `clock_divider` must be an even number ≥2 (DesignWare BAUDR
  semantics), unlike ysyx-2512, which accepts 0.
