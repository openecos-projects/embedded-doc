# Installing SDK 3.0

## Prerequisites

- Python 3.9+, with `python3 -m pip` available.
- The installer automatically installs pinned versions of host dependencies such as CMake, Ninja, PyYAML, JSON Schema, Kconfiglib, and PySerial.
- Installing the Python wheel for the first time requires PyPI or a local pip cache; the toolchain can be downloaded by the installer or imported offline from a local archive.
- On Windows, `windows-curses` is additionally installed for `ecos menuconfig`.

## Install from a Source Checkout

```bash
git clone https://github.com/openecos-projects/embedded-sdk.git
cd embedded-sdk
git checkout 3.0-dev

# Preview the installation plan without writing files or accessing the network
python3 tools/install.py --dry-run --format json

# Perform the actual installation
python3 tools/install.py
```

The installer performs the following steps:

1. Detect the current checkout and register it as an SDK in `development` mode, **without copying the SDK source**.
2. Install the Python `ecos` launcher, CLI dependencies, CMake, Ninja, and shell completion into user-level directories.
3. Download and verify the xPack `15.2.0-1` toolchain if it is missing.
4. Maintain an ECOS-marked configuration block in Bash, Zsh, Fish, or PowerShell startup files.

After installation, reload the shell or open a new terminal:

```bash
source ~/.bashrc        # Use ~/.zshrc for Zsh
ecos sdk current
ecos toolchain status
```

!!! tip "Install host tools only"

    To configure the SDK first and install the cross-compiler later:

    ```bash
    python3 tools/install.py --skip-toolchain
    ecos toolchain install
    ```

## Install from an Official Release

Download the artifact from the Releases page that matches `tools/sdk-manifest.json`, extract it, and run the following from the root directory:

```bash
python3 tools/install.py --dry-run
python3 tools/install.py
ecos sdk current
ecos toolchain status
```

In release mode, the files declared by the manifest are first copied to a staging directory, verified by digest, and then atomically activated into a versioned directory. Default paths:

| Platform | SDK version directory |
| --- | --- |
| GNU/Linux | `${XDG_DATA_HOME:-~/.local/share}/ecos/sdk/<sdk_version>/` |
| macOS | `~/Library/Application Support/ECOS/SDKs/<sdk_version>/` |
| Windows | `%LOCALAPPDATA%\ECOS\SDKs\<sdk_version>\` |

`--prefix PATH` specifies the parent directory of the versioned directory; the installer still appends the version number from the manifest. Installed directories are treated as read-only; projects, user BSPs, toolchains, and download caches live in separate directories.

## Install the Toolchain Offline

```bash
python3 tools/install.py --archive /path/to/xpack-archive.tar.gz
ecos toolchain detect
ecos toolchain status --format json
```

`--archive` affects only the cross toolchain and does not provide Python wheels. The installer still verifies the archive's SHA-256, host platform, and compiler identity.

## Verify the Installation

```bash
ecos --version                 # CLI version
ecos sdk current --format json # Currently resolved SDK
ecos sdk doctor --format json  # Paths and manifests of all registered entries
ecos toolchain status          # Toolchain installation status
```

## Next Steps

After installation, continue with [Quick Start](quickstart.md); for command and argument details, see the [`ecos` command-line tool](cli.md).
