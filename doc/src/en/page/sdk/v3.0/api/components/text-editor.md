# text-editor Text Editor

A terminal text editor based on FatFs and Letter-Shell.

- Component ID: `text-editor`
- Header: `text_editor.h`
- Dependencies: `fatfs`, `letter-shell`; requires the Target to declare the `ram-64k` capability
- Example: `examples/storage/text-editor`

!!! warning "Resources and Release Scope"

    The editor state occupies about 42 KiB of static RAM; the T1-Pico on-chip RAM is insufficient, and L3 lacks the
    QSPI resources required by the example. The current example supports C1, C2, L3.1, and L4 C1/C2/C3.

    The component and example are still excluded from the official release; saving, reading after restart, terminal compatibility, and power-loss behavior require
    real-board acceptance.

## Entry

```c
int editCmd(int argc, char *argv[]);
```

Accepts `edit <filename>`. The example mounts an existing FatFs volume and registers `edit` and the file system commands
in its own Letter-Shell command table.

## Limits and Constants

```c
#define MAX_FILE_SIZE   (24 * 1024)   /* Single-file limit: 24 KiB */
#define MAX_LINES       8192          /* Maximum number of lines */
#define MAX_FILENAME    256
#define DEFAULT_ROWS    24            /* Default terminal: 24 rows */
#define DEFAULT_COLS    80            /* Default terminal: 80 columns */
```

The editor uses the BSP console to handle input and ANSI screen output and does not directly access UART registers.

## Keys

| Key | Behavior |
| --- | --- |
| Arrow keys | Move the cursor |
| Enter | New line |
| Backspace | Delete the previous character |
| Tab | Insert a tab character |
| `Ctrl+W` | Save |
| `Esc` | Exit; if there is unsaved content, press `Esc` again to discard it |

## Notes

- A single file is limited to 24 KiB and 8192 lines; loading or insertion is refused when the limit is exceeded.
- The example does not automatically format empty Flash; back up the data in the volume before formatting.
- The editor depends on the Letter-Shell command table and a FatFs volume; it cannot start if mounting fails.
- ANSI output requires the terminal to support the corresponding escape sequences; terminal compatibility still requires real-board acceptance.
- For the component and file system interfaces, see [letter-shell](letter-shell.md) and [fatfs](fatfs.md).
