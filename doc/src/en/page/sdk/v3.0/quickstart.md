# Quick Start: Create Your First Project

The following uses `starrysky-l4-c1` as an example. Projects should be created outside the SDK directory.

## Create a Project

```bash
mkdir -p ~/ecos-workspace
cd ~/ecos-workspace

# List available Examples and their compatible Boards
ecos project list

# Create a project from hello
ecos project create hello --name myhello --board starrysky-l4-c1
cd myhello
```

`--board` and `--target` are mutually exclusive:

- `--board` selects full board support; the Target is derived from the Board manifest.
- `--target` selects only the SoC and suits projects not yet tied to a specific board; in which case Board is empty.

For the directory structure after project creation and details about `.ecos/project.yml`, see [Projects and Configuration](project.md).

## Validate and Configure

```bash
ecos validate --project .
ecos configure --project .
```

`ecos configure` writes only to `.ecos/generated/` and atomically maintains the following files:

- `resolved-project.json`: the single resolved project model;
- `resolved-project.cmake`, `sdkconfig.cmake`: CMake inputs;
- `Kconfig`, `.config`, `sdkconfig.h`: Kconfig input and output;
- `configuration.fingerprint`: the resolution and configuration fingerprint.

To change board-level or driver options:

```bash
ecos menuconfig
```

`menuconfig` uses the Kconfiglib terminal interface; selections are persisted to `.ecos/project.config`, and on exit it automatically performs the same derived configuration generation as `ecos configure`. This command must be run in an interactive terminal.

## Build

```bash
ecos build --project .
```

The build uses CMake + Ninja and, on success, writes `build/artifacts.json`. For L4C1, the following are generated in `build/`:

| Artifact | Description |
| --- | --- |
| `retrosoc_fw.elf` | ELF with symbols |
| `retrosoc_fw.bin` | Binary for flashing |
| `retrosoc_fw.hex` | Intel HEX |
| `retrosoc_fw.txt` | Disassembly/auxiliary text |
| `retrosoc_fw.map` | Link map |
| `retrosoc_fw.size` | Section size report |
| `compile_commands.json` | Compilation database for editors and tools |
| `artifacts.json` | Artifact paths, sizes, SHA-256, SDK/Board/Target/toolchain, and fingerprints |

`artifacts.json` also records the configuration fingerprint. After changing the Board, profile, or configuration, you must rerun `ecos configure` and `ecos build`; `ecos flash` accepts only artifacts with complete digests and an up-to-date configuration.

## Flash and Serial Monitor

```bash
ecos flash --project .
ecos monitor --project . --port /dev/ttyUSB0
```

- `ecos flash` selects the flashing method based on the Board manifest and reads the firmware path from `artifacts.json`; it does not guess filenames. L4C1 uses the mass-storage method: the CLI looks for the corresponding volume label on Linux/macOS/Windows, and you can also specify it explicitly with `--device <mount-directory>`.
- `ecos monitor` uses PySerial to discover or open a serial port; the baud rate is determined by the Board manifest configuration and can be overridden with `--baudrate`.
- In JSON mode, monitor commands must be guaranteed to terminate via `--timeout` or `--expect`.

## Switch Boards

The same application source can be built for other compatible boards by changing the project metadata:

```bash
ecos project set-board starrysky-l4-c2
ecos configure
ecos build
```

`set-board` overwrites the Target with the mapping from the Board manifest; `set-target` writes the specified Target and clears the Board. Both commands support `--dry-run` to preview changes without writing files.

## Next Steps

- To change the profile or learn about build boundaries: [Projects and Configuration](project.md)
- To start writing an application: [Application Development](api/index.md)
- To browse ready-made Examples: [Example Projects](examples.md)
