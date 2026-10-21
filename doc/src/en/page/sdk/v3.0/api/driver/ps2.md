# PS/2 Driver

PS/2 keyboard input: read raw scan codes.

- Header: `ecos/driver/ps2.h`
- Example: `examples/peripherals/ps2/keycodes`
- Currently only StarrySky L3.1 declares PS2 capability

## Types and Constants

```c
typedef enum {
    ECOS_PS2_ID_0 = 0,   /* The only instance */
    ECOS_PS2_ID_COUNT
} ecos_ps2_id_t;

#define ECOS_PS2_DEFAULT ((ecos_ps2_id_t)ECOS_PS2_ID_0)
```

## Functions

```c
ecos_err_t ecos_ps2_init(ecos_ps2_id_t id);
ecos_err_t ecos_ps2_deinit(ecos_ps2_id_t id);
ecos_err_t ecos_ps2_read(ecos_ps2_id_t id, uint32_t *scan_code);
```

| Function | Description |
| --- | --- |
| `ecos_ps2_init()` | Switch GPIO1[12:13] on L3.1 to the PS2 alternate function and enable the controller |
| `ecos_ps2_read()` | Read the raw register value; 0 means there is currently no key code |
| `ecos_ps2_deinit()` | Disable the controller |

## Usage

```c
#include "ecos/driver/ps2.h"
#include "ecos/log.h"

#define LOG_TAG "ps2"

uint32_t code;

ecos_ps2_init(ECOS_PS2_DEFAULT);
for (;;) {
    if (ecos_ps2_read(ECOS_PS2_DEFAULT, &code) == ECOS_OK && code != 0u)
        (void)ECOS_LOGI(LOG_TAG, "scan code: 0x%02X", code);
}
```

`ecos_ps2_read()` returns the raw scan code and does not decode keyboard layout or key state; legacy routines use
`0x76` as the Escape key code.

## Notes

- Callers should read by polling and call `ecos_ps2_deinit()` when done.
- The driver is responsible only for the hardware layer; the mapping from key codes to characters and the
  pressed/released state are maintained by the application.
