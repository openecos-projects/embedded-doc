# 安装 SDK 3.0

## 环境要求

- Python 3.9+，且 `python3 -m pip` 可用。
- 安装器会自动安装锁定版本的 CMake、Ninja、PyYAML、JSON Schema、Kconfiglib、
  PySerial 等主机依赖。
- 首次安装 Python wheel 需要 PyPI 或本地 pip 缓存；工具链可由安装器下载，
  也可用本地归档离线导入。
- Windows 额外安装 `windows-curses`，用于 `ecos menuconfig`。

## 从源码 checkout 安装

```bash
git clone https://github.com/openecos-projects/embedded-sdk.git
cd embedded-sdk
git checkout 3.0-dev

# 先查看安装计划，不写文件、不联网
python3 tools/install.py --dry-run --format json

# 正式安装
python3 tools/install.py
```

安装器会完成以下工作：

1. 识别当前 checkout，并以 `development` 模式把它注册为 SDK，**不复制 SDK 源码**。
2. 在用户级目录安装 Python `ecos` 启动器、CLI 依赖、CMake、Ninja 和 Shell 补全。
3. 在缺失时下载并校验 xPack `15.2.0-1` 工具链。
4. 在 Bash、Zsh、Fish 或 PowerShell 启动文件中维护带 ECOS 标记的配置块。

安装完成后重新加载 Shell 或打开新终端：

```bash
source ~/.bashrc        # Zsh 使用 ~/.zshrc
ecos sdk current
ecos toolchain status
```

!!! tip "只安装主机工具"

    只想先配置 SDK、稍后安装交叉编译器时：

    ```bash
    python3 tools/install.py --skip-toolchain
    ecos toolchain install
    ```

## 正式 release 安装

从 Release 页面下载与 `tools/sdk-manifest.json` 匹配的制品，解压后在根目录执行：

```bash
python3 tools/install.py --dry-run
python3 tools/install.py
ecos sdk current
ecos toolchain status
```

release 模式会把清单声明的文件先复制到 staging 目录，校验摘要后原子激活到
版本化目录。默认路径：

| 平台 | SDK 版本目录 |
| --- | --- |
| GNU/Linux | `${XDG_DATA_HOME:-~/.local/share}/ecos/sdk/<sdk_version>/` |
| macOS | `~/Library/Application Support/ECOS/SDKs/<sdk_version>/` |
| Windows | `%LOCALAPPDATA%\ECOS\SDKs\<sdk_version>\` |

`--prefix PATH` 指定版本目录的父目录，安装器仍会追加清单中的版本号。已安装目录视为
只读；工程、用户 BSP、工具链和下载缓存都位于独立目录。

## 离线安装工具链

```bash
python3 tools/install.py --archive /path/to/xpack-archive.tar.gz
ecos toolchain detect
ecos toolchain status --format json
```

`--archive` 只影响交叉工具链，不提供 Python wheel。安装器仍会校验归档的 SHA-256、
宿主平台和编译器身份。

## 安装验证

```bash
ecos --version                 # CLI 版本
ecos sdk current --format json # 当前解析到的 SDK
ecos sdk doctor --format json  # 所有注册项的路径和清单
ecos toolchain status          # 工具链安装状态
```

## 下一步

安装完成后，继续阅读[快速上手](quickstart.md)；命令和参数细节见 [`ecos` 命令行工具](cli.md)。
