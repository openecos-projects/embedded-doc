# UART Driver

Blocking serial byte-stream transmit and receive.

- Header: `ecos/driver/uart.h`
- Example: `examples/peripherals/uart/esp01s` (uses UART indirectly through the ESP01S device driver)

## Types and Constants

```c
typedef enum {
    ECOS_UART_PORT_0 = 0,   /* Console UART (sys UART) */
    ECOS_UART_PORT_1,       /* hp block UART (connects to ESP01S on StarrySky L4) */
    ECOS_UART_PORT_COUNT
} ecos_uart_port_t;

typedef enum {
    ECOS_UART_PARITY_NONE = 0,  /* No parity */
    ECOS_UART_PARITY_ODD,       /* Odd parity */
    ECOS_UART_PARITY_EVEN       /* Even parity */
} ecos_uart_parity_t;

typedef struct {
    uint32_t baud_rate;          /* Baud rate */
    uint8_t data_bits;           /* Data bits */
    uint8_t stop_bits;           /* Stop bits */
    ecos_uart_parity_t parity;   /* Parity */
} ecos_uart_config_t;

#define ECOS_UART_CONFIG_DEFAULT \
    { 115200u, 8u, 1u, ECOS_UART_PARITY_NONE }   /* 115200 8N1 */
```

## Functions

```c
ecos_err_t ecos_uart_init(ecos_uart_port_t port, const ecos_uart_config_t *config);
int ecos_uart_write(ecos_uart_port_t port, const void *data, size_t size);
int ecos_uart_read(ecos_uart_port_t port, void *data, size_t size);
int ecos_uart_try_read(ecos_uart_port_t port, uint8_t *data);
```

| Function | Description |
| --- | --- |
| `ecos_uart_init()` | Initialize the specified UART instance; return `ECOS_OK` or a negative error code |
| `ecos_uart_write()` | Blocking send; return the number of bytes actually sent, or a negative error code on failure |
| `ecos_uart_read()` | Blocking read of the specified number of bytes; return the number of bytes actually read, or a negative error code on failure |
| `ecos_uart_try_read()` | Non-blocking read of one byte: return 1 if a byte was read, 0 if no data is available, or a negative error code on failure |

## Minimal Skeleton

```c
#include "ecos/bsp/console.h"
#include "ecos/driver/uart.h"
#include "ecos/log.h"

#define LOG_TAG "uart"

int main(void)
{
    const ecos_uart_config_t config = ECOS_UART_CONFIG_DEFAULT;
    const char message[] = "ping\n";
    uint8_t byte;

    ECOS_PANIC_ON_ERROR(LOG_TAG, bsp_console_init(), "initialize console");
    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_uart_init(ECOS_UART_PORT_1, &config),
                        "initialize UART1");

    ECOS_PANIC_ON_ERROR(LOG_TAG,
                        ecos_uart_write(ECOS_UART_PORT_1,
                                        message, sizeof(message) - 1u),
                        "write UART1");

    for (;;) {
        int result = ecos_uart_try_read(ECOS_UART_PORT_1, &byte);

        ECOS_PANIC_ON_ERROR(LOG_TAG, result, "read UART1");
        if (result == 1)
            (void)ECOS_LOGI(LOG_TAG, "received 0x%02X", byte);
    }
}
```

## Notes

- Pure blocking byte stream: **there is no interrupt, ring buffer, or DMA API**. For continuous reception, poll
  `ecos_uart_try_read()`, or block in `ecos_uart_read()` in a dedicated task.
- `ECOS_UART_PORT_0` is the console UART; both `bsp_console_*` and `printf` go through it. Calling `init` on it
  again from the application reconfigures the console parameters.
- `ECOS_UART_PORT_1` is the hp block UART. On the StarrySky L4 board it is connected to the ESP01S Wi-Fi module and
  is generally used through the [ESP01S device driver](../device/esp01s.md).
- Text console semantics (CRLF, CR→LF normalization) exist only at the BSP console layer; the UART driver sends and
  receives raw bytes.
