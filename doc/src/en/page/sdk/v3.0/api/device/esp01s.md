# ESP01S Wi-Fi Module

Control the ESP01S Wi-Fi module through UART AT commands; supports network joining, TCP connections, and passthrough transmission.

- Header: `ecos/device/esp01s_at.h`
- Bus: UART
- Example: `examples/peripherals/uart/esp01s`

## Types and Constants

```c
typedef enum {
    ECOS_ESP01S_MODE_STA = 1,     /* Station mode */
    ECOS_ESP01S_MODE_AP = 2,      /* AP mode */
    ECOS_ESP01S_MODE_AP_STA = 3   /* mixed mode */
} ecos_esp01s_mode_t;

typedef enum {
    ECOS_ESP01S_CONNECTION_SINGLE = 0,  /* single connection (CIPMUX=0) */
    ECOS_ESP01S_CONNECTION_MULTI = 1    /* multiple connections (CIPMUX=1) */
} ecos_esp01s_connection_mode_t;

typedef struct {
    ecos_uart_port_t uart;   /* UART instance */
    uint32_t baud_rate;      /* baud rate */
} ecos_esp01s_config_t;

typedef struct {
    ecos_esp01s_config_t config;
    uint8_t initialized;
} ecos_esp01s_t;

/* ESP01S connects to UART1 (hp block) on the StarrySky L4 board */
#define ECOS_ESP01S_CONFIG_DEFAULT { ECOS_UART_PORT_1, 115200u }
```

## Functions

```c
ecos_err_t ecos_esp01s_init(ecos_esp01s_t *module,
                            const ecos_esp01s_config_t *config);
ecos_err_t ecos_esp01s_deinit(ecos_esp01s_t *module);
ecos_err_t ecos_esp01s_get_version(ecos_esp01s_t *module,
                                   char *version, size_t size);
ecos_err_t ecos_esp01s_set_mode(ecos_esp01s_t *module, ecos_esp01s_mode_t mode);
ecos_err_t ecos_esp01s_set_connection_mode(
    ecos_esp01s_t *module, ecos_esp01s_connection_mode_t mode);
ecos_err_t ecos_esp01s_wifi_join(ecos_esp01s_t *module, const char *ssid,
                                 const char *password);
ecos_err_t ecos_esp01s_tcp_connect(ecos_esp01s_t *module, const char *host,
                                   const char *port);
ecos_err_t ecos_esp01s_enter_passthrough(ecos_esp01s_t *module);
ecos_err_t ecos_esp01s_send(ecos_esp01s_t *module, const void *data, size_t size);
```

| Function | Description |
| --- | --- |
| `ecos_esp01s_init()` | Initialize UART, complete the AT handshake, and disable echo |
| `ecos_esp01s_get_version()` | Send `AT+GMR`; the first response line is copied into `version` (at most `size - 1` bytes) |
| `ecos_esp01s_set_mode()` | Set Station/AP/mixed mode |
| `ecos_esp01s_set_connection_mode()` | Set single/multiple connection |
| `ecos_esp01s_wifi_join()` | Join a WPA/WPA2 access point; the over-the-air handshake takes several seconds |
| `ecos_esp01s_tcp_connect()` | Establish a TCP connection; single-connection mode must be selected first |
| `ecos_esp01s_enter_passthrough()` | Enter passthrough mode (CIPMODE=1 + CIPSEND) |
| `ecos_esp01s_send()` | Write raw bytes in passthrough mode |

## Usage Example

```c
#include "ecos/device/esp01s_at.h"
#include "ecos/log.h"

#define LOG_TAG "esp01s"

void connect_wifi(void)
{
    ecos_esp01s_t module;
    char version[32];

    ecos_esp01s_init(&module, &(const ecos_esp01s_config_t)
                     ECOS_ESP01S_CONFIG_DEFAULT);
    ecos_esp01s_get_version(&module, version, sizeof(version));
    (void)ECOS_LOGI(LOG_TAG, "AT version: %s", version);

    ecos_esp01s_set_mode(&module, ECOS_ESP01S_MODE_STA);
    ecos_esp01s_wifi_join(&module, "ssid", "password");

    ecos_esp01s_set_connection_mode(&module, ECOS_ESP01S_CONNECTION_SINGLE);
    ecos_esp01s_tcp_connect(&module, "192.168.1.10", "8080");
    ecos_esp01s_enter_passthrough(&module);
    ecos_esp01s_send(&module, "hello\n", 6u);
}
```

## Notes

- `ecos_esp01s_init()` completes UART initialization, the AT handshake, and disables echo.
- `ecos_esp01s_get_version()` copies the first response line, NUL-terminated, into `version` (at most `size - 1` bytes).
- `ecos_esp01s_wifi_join()` joins a WPA/WPA2 access point; the over-the-air handshake takes several seconds.
- `ecos_esp01s_tcp_connect()` requires single-connection mode (CIPMUX=0) to be selected first.
- `ecos_esp01s_enter_passthrough()` enters passthrough (CIPMODE=1 + CIPSEND, waiting for `>`), after which `ecos_esp01s_send()` writes raw bytes.
- The module driver initializes the UART specified in config; the application must not `init` the same UART again.
- For the low-level interface, see [UART driver](../driver/uart.md).
