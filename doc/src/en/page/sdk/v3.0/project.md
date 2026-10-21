# Projects and Configuration

This page describes the project directory structure, `.ecos/project.yml`, profile selection, and build boundaries.

## Project Structure

A created project contains only application source, the CMake entry point, and project metadata:

```text
myhello/
├── .ecos/
│   ├── project.yml        # Project metadata: Example, Board, Target, profile, SDK pin
│   └── sdk.json           # Local SDK resolution information (must not be committed)
├── CMakeLists.txt         # Project entry point; does not store Board/Target/component dependencies
├── ecos-example.yml       # Copy of the Example manifest
├── main.c                 # Application source
└── README.md
```

Typical contents of `.ecos/project.yml`:

```yaml
schema: 2
name: "myhello"
example: "hello"
board: "starrysky-l4-c1"
target: "ysyx-2512-1"
profile: null
sdk:
  id: "ecos-embedded-sdk"
  version: "3.0.0"
  registration: "3.0.0"
```

`profile: null` means the default profile of the selected Board is used (for example, `memory` for L4C1); `ecos validate` and `ecos project info` show the final resolved profile.

!!! warning "Do not copy SDK content manually"

    Project metadata does not record absolute SDK paths. When switching Boards, the CLI updates only project metadata and generated files; it does not replace user-maintained files such as `main.c` and `CMakeLists.txt`.

## profile

A profile is a predefined configuration combination for a Board, used to select boot and memory layout, among other things:

| Board | profile | Typical use |
| --- | --- | --- |
| `starrysky-l4-c1` / `l4-c2` / `l4-c3` | `memory` | Run from memory layout (link configuration determined by the Board) |
| `starrysky-t1-pico` | `flash_xip` | Flash XIP + DSRAM |
| `starrysky-l3` / `starrysky-l3-1` | `flash-xip` | Flash XIP |
| `starrysky-l3` / `starrysky-l3-1` | `mem` | Run from memory |
| `starrysky-c1` | `flash-xip` | Flash XIP |
| `starrysky-c2` | `flash-xip` | Flash XIP + SRAM data region |
| `starrysky-c2` | `psram-data` | Data region placed in PSRAM |

```bash
ecos project set-profile mem
ecos project info --format json
```

## Build Boundaries

- `.ecos/project.yml`, the Board/Target/Component/Example manifests, and Kconfig are the sources of truth for inputs.
- Generated files are placed only in `build/` or `.ecos/generated/` and should not be edited manually.
- Startup files and linker scripts are resolved from the Target/Board manifests and bound to the firmware target; they are not copied into the project.
- `CMakeLists.txt` declares only the project and application components and does not duplicate Board, Target, or toolchain information.
- Unsupported Board/Target/Example combinations fail before compilation and indicate the missing capability.

Application APIs start at [Application Development](api/index.md); for the creation and flashing workflow, see [Quick Start](quickstart.md).
