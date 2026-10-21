# ESP01S Wi-Fi 模组

通过 UART AT 指令控制 ESP01S Wi-Fi 模组，支持联网、TCP 连接和透传发送。

- 头文件：`ecos/device/esp01s_at.h`
- 总线：UART
- 示例：`examples/peripherals/uart/esp01s`

## 类型与常量

```c
typedef enum {
    ECOS_ESP01S_MODE_STA = 1,     /* Station 模式 */
    ECOS_ESP01S_MODE_AP = 2,      /* AP 模式 */
    ECOS_ESP01S_MODE_AP_STA = 3   /* 混合模式 */
} ecos_esp01s_mode_t;

typedef enum {
    ECOS_ESP01S_CONNECTION_SINGLE = 0,  /* 单连接（CIPMUX=0） */
    ECOS_ESP01S_CONNECTION_MULTI = 1    /* 多连接（CIPMUX=1） */
} ecos_esp01s_connection_mode_t;

typedef struct {
    ecos_uart_port_t uart;   /* 串口实例 */
    uint32_t baud_rate;      /* 波特率 */
} ecos_esp01s_config_t;

typedef struct {
    ecos_esp01s_config_t config;
    uint8_t initialized;
} ecos_esp01s_t;

/* ESP01S 在 StarrySky L4 板上接 UART1（hp 块） */
#define ECOS_ESP01S_CONFIG_DEFAULT { ECOS_UART_PORT_1, 115200u }
```

## 函数

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

| 函数 | 说明 |
| --- | --- |
| `ecos_esp01s_init()` | 初始化 UART、完成 AT 握手并关闭回显 |
| `ecos_esp01s_get_version()` | 发 `AT+GMR`，第一行应答拷入 `version`（最多 `size - 1` 字节） |
| `ecos_esp01s_set_mode()` | 设置 Station/AP/混合模式 |
| `ecos_esp01s_set_connection_mode()` | 设置单连接/多连接 |
| `ecos_esp01s_wifi_join()` | 加入 WPA/WPA2 热点，空中握手需要数秒 |
| `ecos_esp01s_tcp_connect()` | 建立 TCP 连接，要求先选单连接模式 |
| `ecos_esp01s_enter_passthrough()` | 进入透传模式（CIPMODE=1 + CIPSEND） |
| `ecos_esp01s_send()` | 透传模式下写原始字节 |

## 使用示例

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

## 注意事项

- `ecos_esp01s_init()` 完成 UART 初始化、AT 握手并关闭回显。
- `ecos_esp01s_get_version()` 把第一行应答以 NUL 结尾拷入 `version`（最多
  `size - 1` 字节）。
- `ecos_esp01s_wifi_join()` 加入 WPA/WPA2 热点，空中握手需要数秒。
- `ecos_esp01s_tcp_connect()` 要求先选单连接模式（CIPMUX=0）。
- `ecos_esp01s_enter_passthrough()` 进入透传（CIPMODE=1 + CIPSEND，等待 `>`），
  之后用 `ecos_esp01s_send()` 写原始字节。
- 模组驱动会初始化 config 指定的 UART；应用不要再对同一串口重复 `init`。
- 底层接口见 [UART 驱动](../driver/uart.md)。
