# soft-spi Software SPI

An SPI master implemented with GPIO bit-banging, replacing the old fixed-pin `spi_software`.

- Component ID: `soft-spi`
- Header: `ecos/soft_spi.h`
- Dependencies: `driver-gpio`
- Resources: `soft-spi-bus` in the Board manifest (four pins + mode)

## Types and Constants

```c
typedef enum {
    ECOS_SOFT_SPI_MODE_0 = 0,
    ECOS_SOFT_SPI_MODE_1,
    ECOS_SOFT_SPI_MODE_2,
    ECOS_SOFT_SPI_MODE_3
} ecos_soft_spi_mode_t;

typedef void (*ecos_soft_spi_delay_fn)(void *context);

typedef struct {
    ecos_gpio_pin_t chip_select;
    ecos_gpio_pin_t clock;
    ecos_gpio_pin_t mosi;
    ecos_gpio_pin_t miso;
    ecos_soft_spi_mode_t mode;
    ecos_soft_spi_delay_fn delay;   /* Optional: callback delay per half cycle */
    void *delay_context;            /* Context passed to delay */
} ecos_soft_spi_config_t;

typedef struct {
    ecos_soft_spi_config_t config;
    bool initialized;
    bool active;
} ecos_soft_spi_t;
```

## Functions

```c
ecos_err_t ecos_soft_spi_init(ecos_soft_spi_t *bus,
                              const ecos_soft_spi_config_t *config);
ecos_err_t ecos_soft_spi_start(ecos_soft_spi_t *bus);
ecos_err_t ecos_soft_spi_stop(ecos_soft_spi_t *bus);
ecos_err_t ecos_soft_spi_transfer_byte(ecos_soft_spi_t *bus,
                                       uint8_t tx, uint8_t *rx);
```

| Function | Description |
| --- | --- |
| `ecos_soft_spi_init()` | Configure the GPIOs and save the parameters |
| `ecos_soft_spi_start()` | Drive chip select low and begin a transaction |
| `ecos_soft_spi_stop()` | Release chip select and end the transaction |
| `ecos_soft_spi_transfer_byte()` | Send and receive one byte, MSB-first |

Supports SPI mode 0–3, MSB-first single-byte transfer, and an optional callback delay per half cycle.

## Usage Example

```c
#include "ecos/board_resources.h"
#include "ecos/soft_spi.h"

void read_id(void)
{
    ecos_soft_spi_config_t config = {
        .chip_select = ECOS_BOARD_SOFT_SPI_CHIP_SELECT,
        .clock = ECOS_BOARD_SOFT_SPI_CLOCK,
        .mosi = ECOS_BOARD_SOFT_SPI_MOSI,
        .miso = ECOS_BOARD_SOFT_SPI_MISO,
        .mode = (ecos_soft_spi_mode_t)ECOS_BOARD_SOFT_SPI_MODE,
    };
    ecos_soft_spi_t bus;
    uint8_t received;

    ecos_soft_spi_init(&bus, &config);
    ecos_soft_spi_start(&bus);
    ecos_soft_spi_transfer_byte(&bus, 0x9fu, &received);
    ecos_soft_spi_stop(&bus);
}
```

## Notes

- The Board declares the four pins and the mode through the `soft-spi-bus` resource, and the configuration stage generates the
  `ecos/board_resources.h` macros; applications must not hard-code board pins into the component.
- A transaction must explicitly `start` / `stop`; the caller is responsible for selecting GPIO resources that match the hardware.
- Bit-bang timing is affected by the CPU frequency and GPIO write latency; when an accurate clock is required, use hardware QSPI, see
  [QSPI driver](../driver/qspi.md).
- Host tests cover the four modes, pin conflicts, and the state machine; the specific board clock frequency, peripheral electrical connections, and long-
  term stability still require real-board acceptance.
- For resource macro definitions, see [BSP board support](../bsp.md#board-resources).
