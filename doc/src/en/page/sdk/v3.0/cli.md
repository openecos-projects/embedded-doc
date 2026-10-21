# `ecos` Command-Line Tool

## Command Structure

```text
ecos [--sdk NAME|VERSION|PATH] <command> [subcommand] [arguments] [options]
```

Commands follow a model of "grouped management capabilities and flattened high-frequency project operations":

- Resource management uses groups: `ecos project create`, `ecos sdk list`, `ecos board describe`.
- High-frequency operations on the current project live directly under the root command: `ecos configure`, `ecos build`, `ecos flash`.

SDK path resolution priority is fixed as follows:

1. `--sdk` on a single command;
2. the SDK pin in project metadata;
3. the `ECOS_SDK_HOME` compatibility variable;
4. the active SDK in the user registry;
5. the checkout identified from the SDK source entry point.

If a higher-priority selection exists but is invalid, an error is raised immediately; there is no silent fallback to another SDK.

## Common Commands

| Command | Purpose |
| --- | --- |
| `ecos sdk register PATH` | Register an SDK checkout or release installation |
| `ecos sdk list / current / use / pin / doctor` | Query, switch, pin, and diagnose SDKs |
| `ecos toolchain detect / status / install` | Toolchain detection, status check, and installation |
| `ecos project list` | List Examples, capability requirements, and compatible Boards |
| `ecos project create EXAMPLE` | Create an external project from an Example |
| `ecos project set-board BOARD` | Switch Board and derive Target |
| `ecos project set-target TARGET` | Select only Target and clear Board |
| `ecos project set-profile PROFILE` | Switch configuration profile |
| `ecos project info` | View project selections, configuration, and build status |
| `ecos board / target / component / driver / device list` | Discover resources |
| `ecos board / target / component / driver / device describe ID` | View resource details |
| `ecos schema list / describe / validate` | Query and validate manifest schemas |
| `ecos validate` | Read-only validation of the project and manifests |
| `ecos configure` | Generate resolved project, CMake, and Kconfig configuration |
| `ecos menuconfig` | Enter the interactive Kconfig configuration interface |
| `ecos build` | Build firmware using CMake + Ninja |
| `ecos clean` | Delete the current project's build directory |
| `ecos doctor` | Check the project, host tools, toolchain, flasher, and serial port |
| `ecos flash` | Flash firmware from `artifacts.json` according to Board configuration |
| `ecos monitor` | Open the cross-platform serial monitor |
| `ecos completion bash\|zsh\|fish\|powershell` | Output a shell completion script |

Common examples:

```bash
ecos project list --format json
ecos board describe starrysky-l4-c1 --format json
ecos target describe ysyx-2512-1 --format json
ecos component describe driver-gpio --format json
ecos --sdk 3.0.0 project create hello --name hello-demo
```

## Machine-Readable Output and Exit Codes

All discovery, inspection, validation, and diagnostic commands support `--format json`. The JSON top level always contains:

```text
cli_version
schema_version
command
status
data
diagnostics
```

JSON is written to standard output, while logs, warnings, and progress are written to standard error; machine mode contains no color control characters. The `data.graph` field of `ecos validate --format json` directly provides application sources, Target sources, Component dependencies, and final artifacts, so automation tools do not need to parse CMake/Ninja files.

| Exit code | Meaning |
| --- | --- |
| `0` | Success |
| `2` | Usage or argument error |
| `3` | SDK, registry, manifest, or configuration error |
| `4` | Unsupported host platform or architecture |
| `5` | Toolchain verification, extraction, or external program error |
| `6` | Network download error |

## Automation and AI Usage

The 3.0 CLI targets humans, CI, and AI alike. Key conventions:

- No interactive prompts appear when arguments are complete; every interactive command has equivalent non-interactive arguments.
- Project-related commands support an explicit project directory (`--project PATH`) and do not depend on the current working directory.
- Query and validation commands have no side effects; modifying commands support `--dry-run`.
- Repeated operations such as setting the Board or profile remain idempotent.
- User source is not overwritten by default; overwriting or deleting requires an explicit `--force`.
- `--format json` provides a stable envelope, diagnostics array, and exit codes.

Recommended automation workflow:

```bash
ecos project list --format json
ecos board describe starrysky-l4-c1 --format json
ecos project create hello --name ci-hello --board starrysky-l4-c1 --format json
ecos validate --project ci-hello --format json
ecos configure --project ci-hello --format json
ecos build --project ci-hello --format json
```

The `data.graph` of `ecos validate --format json` can be used to inspect the actual sources, includes, component dependencies, and artifact list before compilation.

For installation and toolchain installation commands, see [Installing SDK 3.0](install.md).
