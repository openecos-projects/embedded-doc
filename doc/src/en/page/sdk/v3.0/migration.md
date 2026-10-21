# Migrating from SDK 2.0

## Key Differences from SDK 2.0

| Area | SDK 2.0 | SDK 3.0 |
| --- | --- | --- |
| Host tools | Shell scripts + GNU Make | Python `ecos` CLI |
| Build system | Make | CMake + Ninja |
| Toolchain | `riscv64-unknown-elf-` self-built toolchain | xPack `riscv-none-elf-gcc` 15.2.0-1 |
| Hardware abstraction | Board directories + templates | Target / Board / HAL / Driver / BSP layering |
| Application APIs | `hal_*.h`, `board.h` | `ecos/driver/*.h`, `ecos/bsp/*.h`, `ecos/device/*.h` |
| Error model | Inconsistent return values | Unified `ecos_err_t` / `ECOS_ERR_*` |
| Logging | Old `log.h` | `ecos/log.h` + `ECOS_LOG*` macros |
| Example organization | One copy of application source per board | Single Example source + capability manifest |
| Project metadata | `TEMPLATE=` / Makefile | `.ecos/project.yml` |
| Multi-platform | Primarily Linux/WSL | Windows / Linux / macOS |
| Version management | Source directory | SDK registry + multiple versions + project pin |

## Migration Steps

3.0 may change directory layout, BSP schemas, project metadata, and legacy HAL APIs. The following order is recommended for migration:

1. **Create a new 3.0 project**; do not directly rewrite a 2.x Makefile project.
2. **Replace headers**: `hal_*.h` → `ecos/driver/*.h`, `board.h` → BSP or
   `ecos/board_resources.h`, old `log.h` → `ecos/log.h`.
3. **Unify error handling**: use `ecos_err_t` and `ECOS_RETURN_ON_ERROR` /
   `ECOS_PANIC_ON_ERROR`.
4. **Remove board-specific conditional compilation**: do not select pins based on
   Board names; use BSP resources or `board_resources.h` instead.
5. **Replace the build workflow**:

   | 2.x | 3.0 |
   | --- | --- |
   | `ecos init_project hello -target c2` | `ecos project create hello --board starrysky-c2` |
   | `make menuconfig` | `ecos menuconfig` |
   | `make` | `ecos configure && ecos build` |
   | Makefile / `TEMPLATE=` | `.ecos/project.yml` + manifest |
   | `riscv64-unknown-elf-*` | `riscv-none-elf-*` (resolved automatically by the SDK) |

6. **Verify capability compatibility**: `ecos validate --format json` checks Board/Target/component
   dependencies and required resources; unsupported combinations fail before compilation.
7. **Redo hardware regression**: the toolchain switches from `riscv64-unknown-elf` to xPack
   `riscv-none-elf`; L3/L3.1 should still use `rv64ifd_zifencei/lp64` and must not be
   silently changed to `lp64d`.

!!! note "2.x projects remain usable"

    `2.1-dev` and subsequent 2.x branches focus on fixes and stabilization. 3.0 provides migration documentation and capability validation,
    but does not guarantee that every 2.x project compiles without modification.

For project structure and configuration items, see [Projects and Configuration](project.md); for the new application APIs, see [Application Development](api/index.md).
