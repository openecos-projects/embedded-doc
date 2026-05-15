# ECOS SDK 快速上手
## 概述

本文档旨在指导用户搭建星空板卡的开发环境。通过一个简单的示例展示如何使用ECOS SDK 进行开发、编译、下载固件到板卡等步骤。

!!! info "注意"
    这是 SDK 2.0 版本的 API 文档。其他版本的 SDK 可能会有不同的 API 接口定义，请根据实际情况参考对应的 API 文档。

## 介绍

星空板卡是基于ECOS团队开发的RISC-V架构的板卡，用于学习和开发嵌入式系统。目前主要包含“一生一芯”版本——L系列；社区版本——C系列。主要特点如下：

- 开源处理器核：来源于ECOS团队及一生一芯学员
- 开源SoC：外设IP均开源

ECOS团队为用户提供完整的软硬件开发环境，包括处理器核、SoC、外设IP、编译工具等。

## 环境准备

推荐使用Windows + WSL2环境进行开发，也可以使用Linux进行开发。文档重点介绍从Linux环境开始搭建开发环境（WSL及Linux一致）。

## 第一步：安装Linux系统
略。

!!! info "注意"
    建议使用Ubuntu 24.04 LTS以上版本，以确保编译器兼容性。

## 第二步：安装ECOS SDK

ECOS SDK托管在github仓库中，用户可以从仓库中下载最新版本[ECOS SDK](https://github.com/openecos-projects/embedded-sdk/releases/latest)

### 克隆仓库并选择版本分支

```bash
git clone https://github.com/openecos-projects/embedded-sdk.git
cd embedded-sdk
git checkout v{version}.{minor}.{patch}
# 例如：git checkout v2.0.0
```
### 运行安装脚本

```bash
./install.sh 

[ECOS] ECOS Embedded SDK 一键安装程序
[ECOS] 安装路径: /home/user/.local/ecos-sdk
[ECOS] 使用预编译工具链
[ECOS] 开始一键安装 ECOS Embedded SDK...

[ECOS] 安装SDK核心文件...
[ECOS] 安装RISC-V预编译工具链...
[ECOS] 检测到系统已安装RISC-V工具链：
[ECOS]   路径: /home/user/.local/ecos-sdk/toolchain/riscv_unknown/bin/riscv64-unknown-elf-gcc
[ECOS]   版本: riscv64-unknown-elf-gcc (g1b306039a) 15.1.0
[ECOS] 已创建符号链接到SDK工具链目录
[ECOS] 使用系统已安装的RISC-V工具链
[ECOS] 正在配置 /home/user/.bashrc ...
[ECOS]   ecos PATH 环境变量已存在于 /home/user/.bashrc，跳过添加
[ECOS]   工具链 PATH 环境变量已存在于 /home/user/.bashrc，跳过添加
[ECOS]   ECOS_SDK_HOME 环境变量已存在于 /home/user/.bashrc，跳过添加
[ECOS] 环境变量配置完成: /home/user/.bashrc

是否需要为 ecos 指令安装自动补全功能 (Tab补全)？这将在您的 shell 配置文件末尾追加加载脚本。[Y/n]: 
[ECOS] 自动补全已配置在 /home/user/.bashrc 中，跳过。
[ECOS] 自动补全功能安装完成！请在新终端中体验。

[ECOS] 安装完成！
检查toolchain版本 'riscv64-unknown-elf-gcc --version'

[ECOS] 后续步骤：
1. 重新加载环境: source ~/.bashrc
2. 检测SDK是否安装成功: ecos help
3. 检测工具链是否安装成功: riscv64-unknown-elf-gcc --version
4. 创建示例工程（在当前目录生成）: ecos init_project hello
5. 配置示例工程: cd hello && make menuconfig
6. 编译示例工程: make
```

### 加载环境变量

```bash
source ~/.bashrc
```

!!! info "注意"
    SDK默认安装到`~/.local/ecos-sdk`目录下。所以安装完成之后可以删除克隆下来的仓库，对sdk的使用不产生影响，但是目前建议保留仓库，方便后续升级。

### 验证安装

```bash
ecos help


ECOS Embedded SDK Command-Line Tool

Usage: ecos <command> [options]

Available commands:
  set_board <board_name>              Set the board configuration
  init_project <project_name>|list    Initialize a project or list available projects
  flash                               Flash the compiled firmware to the device
  monitor                             Open serial monitor using minicom
  help                                Show this help message

Board list:
  c1                                  StarrySky C1 board
  c2                                  StarrySky C2 board
  l3                                  StarrySky L3 board

Isolated:
  Isolated project gathers all the resource so that you can compile your project without SDK
  But the riscv-toolchain is still indispensable

Examples:
  ecos set_board c1                   Set the board to StarrySky C1
  ecos init_project hello             Initialize a new project named 'hello'
  ecos init_project list              List all available project templates
  ecos init_project hello -isolated   Initialize a new isolated project named 'hello'
  ecos flash                          Flash the compiled firmware to the device
  ecos monitor                        Open the default serial port at 115200 baud
```

## 第三步：构建第一个工程

### 新建工程

新建工程时建议不要在sdk的安装及克隆目录下进行，否则可能会导致编译错误。
```bash
mkdir -p ~/ecos-workspace
cd ~/ecos-workspace
ecos init_project hello -target l3_1 -name myhello
```
### 创建默认配置文件
sdk给默认的模板工程目前还没有配备默认的配置文件，用户需要自己配置。可以通过`make menuconfig`命令进行配置。默认情况下，只需要执行退出即可。

```bash
cd myhello
make menuconfig
```

### 编译
在工程目录下执行`make`命令进行编译。编译完成之后会显示内存占用等信息。

```bash
make

Building retrosoc_fw...
Linking retrosoc_fw...
Post-processing retrosoc_fw.hex...
Generating retrosoc_fw.bin...
Generating retrosoc_fw.txt...
------------------------------------------------------------------------------
Memory Usage:
--------------------------------------------------------------------------
Memory Region   Used Size       Total Size      Usage %    Free           
--------------------------------------------------------------------------
FLASH           15.94 KB        16.00 MB        0.10%      15.98 MB       
PSRAM           16 B            8.00 MB         0.00%      8.00 MB        
--------------------------------------------------------------------------
RAM Details:
  .data: 4 B
  .bss:  12 B
------------------------------------------------------------------------------
Done.
```

### 烧录固件
星空板卡烧录采用HFP-LINK烧录器进行拖拽式烧录，具体的烧录步骤参考对应的板卡说明文档。大致步骤如下：
- 连接烧录器或板卡到电脑
- 将编译好的固件复制到YSYX-HFPLnk目录下（默认是`retrosoc_fw.bin`）

linux环境建议使用`ecos flash`命令进行烧录。
```bash
ecos flash
```

### 程序运行
将板卡连接到电脑，监视对应的串口，按下板卡复位按钮，即可看到程序的运行信息。
linux环境可以使用`ecos monitor`命令进行串口监视，需要安装minicom工具。

```bash
ecos monitor
```
