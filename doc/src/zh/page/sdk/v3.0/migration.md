# 从 SDK 2.0 迁移

## 与 SDK 2.0 的主要差异

| 维度 | SDK 2.0 | SDK 3.0 |
| --- | --- | --- |
| 主机工具 | Shell 脚本 + GNU Make | Python `ecos` CLI |
| 构建系统 | Make | CMake + Ninja |
| 工具链 | `riscv64-unknown-elf-` 自编译工具链 | xPack `riscv-none-elf-gcc` 15.2.0-1 |
| 硬件抽象 | 板卡目录 + 模板 | Target / Board / HAL / Driver / BSP 分层 |
| 应用接口 | `hal_*.h`、`board.h` | `ecos/driver/*.h`、`ecos/bsp/*.h`、`ecos/device/*.h` |
| 错误模型 | 返回值不统一 | 统一 `ecos_err_t` / `ECOS_ERR_*` |
| 日志 | 旧 `log.h` | `ecos/log.h` + `ECOS_LOG*` 宏 |
| 示例组织 | 每个板卡一份应用源码 | 单一 Example 源码 + 能力清单 |
| 工程元数据 | `TEMPLATE=` / Makefile | `.ecos/project.yml` |
| 多平台 | 主要面向 Linux/WSL | Windows / Linux / macOS |
| 版本管理 | 源码目录 | SDK 注册表 + 多版本 + 工程 pin |

## 迁移步骤

3.0 允许调整目录、BSP schema、工程元数据和旧 HAL API。迁移时建议按以下顺序进行：

1. **新建 3.0 工程**，不要直接改写 2.x 的 Makefile 工程。
2. **替换头文件**：`hal_*.h` → `ecos/driver/*.h`，`board.h` → BSP 或
   `ecos/board_resources.h`，旧 `log.h` → `ecos/log.h`。
3. **统一错误处理**：使用 `ecos_err_t` 和 `ECOS_RETURN_ON_ERROR` /
   `ECOS_PANIC_ON_ERROR`。
4. **移除板卡条件编译**：不要根据 Board 名称选择引脚；改用 BSP 资源或
   `board_resources.h`。
5. **替换构建流程**：

   | 2.x | 3.0 |
   | --- | --- |
   | `ecos init_project hello -target c2` | `ecos project create hello --board starrysky-c2` |
   | `make menuconfig` | `ecos menuconfig` |
   | `make` | `ecos configure && ecos build` |
   | Makefile / `TEMPLATE=` | `.ecos/project.yml` + 清单 |
   | `riscv64-unknown-elf-*` | `riscv-none-elf-*`（由 SDK 自动解析） |

6. **验证能力兼容性**：`ecos validate --format json` 会检查 Board/Target/组件
   依赖和所需资源；不支持的组合会在编译前失败。
7. **重新做硬件回归**：工具链从 `riscv64-unknown-elf` 切换到 xPack
   `riscv-none-elf`，L3/L3.1 仍应保持 `rv64ifd_zifencei/lp64`，不得静默改为
   `lp64d`。

!!! note "2.x 工程仍可使用"

    `2.1-dev` 及后续 2.x 分支以修复和稳定为主。3.0 提供迁移文档和能力校验，
    但不保证所有 2.x 工程无修改编译。

工程结构和配置项见[工程与配置](project.md)，新的应用接口见[应用开发](api/index.md)。
