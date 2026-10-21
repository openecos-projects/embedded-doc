# ECOS Embedded SDK

ECOS Embedded SDK 是面向 StarrySky 板卡和兼容 RISC-V 平台的裸机开发 SDK。文档按
SDK 版本组织：每个版本有独立的首页、快速上手和 API 参考，通用环境文档在各版本间
共用。

## 选择版本

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **SDK 3.0（开发中）**

    ---

    Target/Board 分离，Python `ecos` CLI + CMake + Ninja，统一错误码与日志接口。

    [:octicons-arrow-right-24: 进入 SDK 3.0](v3.0/index.md)

-   :material-check-decagram:{ .lg .middle } **SDK 2.0（推荐）**

    ---

    当前推荐稳定版本，Makefile + `ecos` 脚本工作流，外设 API 完整。

    [:octicons-arrow-right-24: 进入 SDK 2.0](v2.0/index.md)

-   :material-history:{ .lg .middle } **SDK 1.0（历史版本）**

    ---

    维护状态，仅保留 API 参考和 Hello World 示例，供旧工程查阅。

    [:octicons-arrow-right-24: 进入 SDK 1.0](v1.0/index.md)

</div>

## 版本对比

| 版本 | 状态 | 适用场景 | 构建方式 | 工具链 |
| --- | --- | --- | --- | --- |
| SDK 3.0 | 开发中（`3.0.0.dev0`） | 新项目、需要使用 Target/Board 分离和新 CLI | CMake + Ninja，`ecos` CLI | xPack `riscv-none-elf-gcc` 15.2.0-1 |
| SDK 2.0 | 推荐稳定版 | 产品开发、课程实验、现有 2.x 工程 | Makefile，`ecos` 脚本 | `riscv64-unknown-elf-` |
| SDK 1.0 | 历史版本 | 旧工程维护 | 旧 Makefile | 旧版工具链 |

## 通用文档

- [环境准备（WSL）](common/env.md)：Windows 下启用 WSL、安装串口和编译环境。
- [快速上手（2.0 示例）](common/quickstart.md)：使用 `ecos init_project` 创建并烧录 Hello 工程。

## 如何切换版本

- 进入任一版本后，左侧栏顶部会出现“显示版本目录”下拉框；选择版本会进入该版本的
  首页，再按该版本的目录浏览。
- 通用文档不区分版本内容；在通用页切换版本只改变下方目录，不会跳转页面。
- 本页正文始终列出全部版本；左侧栏会沿用上次使用的版本（首次访问默认 SDK 2.0），
  避免三套目录同时展开。
