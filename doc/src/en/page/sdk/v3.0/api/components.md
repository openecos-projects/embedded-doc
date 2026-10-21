# Components

Components available to applications in SDK 3.0: a subset of the C runtime library, heap, coroutines, serial Flash, file system, command line, file system commands, software SPI, text editor, and C compiler.

- Headers: each component's `include/` directory (see each page)
- Examples: `examples/storage/*`, `examples/concurrency/*`
- Component IDs: enter the build graph only after being declared in the Example manifest

!!! note "Component Scope in the First Release"

    The `release.exclude` in the current `tools/sdk-manifest.json` excludes FatFs, FCC, Letter-Shell, letter-shell-fs, and text-editor from the first release package; these components currently need to be used in a development checkout. Refer to the manifest of subsequent versions.

    Real Flash mounting, file read/write, terminal interaction, and power-loss recovery must complete the manual acceptance checklist before the release exclusion is lifted.

## Component Index

### Basic Runtime

| Component | Header | Description |
| --- | --- | --- |
| [libc subset](components/libc.md) | `stdio.h`, `string.h`, `assert.h` | Memory, string, and formatted output |
| [heap](components/heap.md) | `ecos/heap.h` | Dual-region heap memory allocation |
| [LightCoroutine](components/light-coroutine.md) | `coroutine.h`, `yield.h` | Stackless cooperative coroutines |

### Storage

| Component | Header | Description |
| --- | --- | --- |
| [sfud](components/sfud.md) | `sfud.h` | Universal serial Flash driver |
| [fatfs](components/fatfs.md) | `ff.h`, `ffinit.h` | FAT file system |

### Shell and Tools

| Component | Header | Description |
| --- | --- | --- |
| [letter-shell](components/letter-shell.md) | `shell.h` | Command-line interaction |
| [letter-shell-fs](components/letter-shell-fs.md) | `ecos/shell/fs.h` | File system commands |
| [text-editor](components/text-editor.md) | `text_editor.h` | Terminal text editor |
| [fcc](components/fcc.md) | `fcc.h` | Small C compiler |

### Bus

| Component | Header | Description |
| --- | --- | --- |
| [soft-spi](components/soft-spi.md) | `ecos/soft_spi.h` | GPIO bit-bang SPI |

## Notes

- Components enter the build graph only after their component IDs are declared in the Example manifest; components that are not declared cannot be used by directly including their headers.
- Component IDs and menuconfig options are subject to the current `tools/sdk-manifest.json` and `ecos menuconfig`.
- Single-threaded bare-metal model: heap, Shell, and the file system do not guarantee interrupt-context safety.
- `soc` (the SDK-internal SoC layer) and `libgcc` (compiler internal routines) are not application-facing components.
- For low-level peripheral interfaces, see [Driver Layer](driver.md); for external devices, see [Device Drivers](device.md).
