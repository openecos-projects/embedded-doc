# letter-shell Command Line

The Letter-Shell 3.2.4 command-line interaction component; sends and receives characters through the BSP console.

- Component ID: `letter-shell`
- Header: `shell.h`; one-step startup: `shell_init.h`; porting hooks: `shell_port.h`
- Dependencies: the Board provides the `console` capability
- Example: `examples/concurrency/letter-shell-smoke`

!!! note "First Release Scope"

    Letter-Shell is currently excluded from the first release package by `release.exclude` in
    `tools/sdk-manifest.json`. Serial interaction, long input, backspace/history/arrow keys, and boundary input still require real-board acceptance.

## Core API (shell.h)

```c
void shellInit(Shell *shell, char *buffer, unsigned short size);
void shellTask(void *param);
void shellHandler(Shell *shell, char data);
void shellPrint(Shell *shell, const char *fmt, ...);
int shellRun(Shell *shell, const char *cmd);
```

| Function | Description |
| --- | --- |
| `shellInit()` | Bind the RX/TX buffers and initialize the Shell object |
| `shellTask()` | Polling task body |
| `shellHandler()` | Feed input byte by byte |
| `shellPrint()` | Formatted output to the terminal |
| `shellRun()` | Execute one command from a string |

The `Shell` object should be zeroed first, then the `read`/`write` hooks set, and finally `shellInit()` called. When a file
system path is used, `ecos_shell_fs_init()` can be called before initialization to set the path.

## One-Step Startup (shell_init.h)

```c
void load_shell(void);
```

Initializes the shell object and buffers and enters the main loop; does not return. Applications that need file system commands should first mount
a FatFs volume and initialize [letter-shell-fs](letter-shell-fs.md), then register their own command table as in the text-editor example.

## Porting Hooks (shell_port.h)

```c
short shellRead(char *str, unsigned short len);
short shellWrite(char *str, unsigned short len);
```

The shell's byte RX/TX hooks; the SDK already connects them to the system serial port.

## Command Registration

The command export macro `SHELL_EXPORT_CMD` (and the `_SIGN` / `_AGENCY` variants) is used to register functions as
shell commands.

!!! warning "CMD_EXPORT Is Not Currently Enabled"

    In the current `shell_cfg.h`, `SHELL_USING_CMD_EXPORT = 0`, so the export macros expand to nothing and the available
    command set is the one built into the compilation. To define custom commands, register them in your own command table; refer to
    the text-editor example.

- The default user is `StarrySky`, with an empty password.
- Flags such as command permissions and argument count are combined with the `SHELL_CMD_*` macros; see `shell.h` for details.

## Usage Example

```c
#include "shell.h"
#include "shell_port.h"

static Shell shell;
static char shell_buffer[256];

void start_shell(void)
{
    memset(&shell, 0, sizeof(shell));
    shell.read = shellRead;
    shell.write = shellWrite;
    shellInit(&shell, shell_buffer, sizeof(shell_buffer));

    for (;;)
        shellTask(&shell);
}
```

## Notes

- The Shell uses the BSP console's text semantics (CRLF, CR→LF normalization) and does not directly access UART registers.
- `shellTask()` must be called periodically; the blocking `load_shell()` already contains the main loop internally.
- Single-instance design: only one active Shell should exist at a time.
- For file system commands, see [letter-shell-fs](letter-shell-fs.md); for the editor, see
  [text-editor](text-editor.md).
