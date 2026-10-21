# ECOS SDK 2.0

!!! info "当前推荐稳定版本"

    SDK 2.0 是当前推荐用于产品开发和课程实验的稳定版本，使用 Makefile + `ecos`
    脚本工作流。SDK 3.0 仍在开发通道中，适合希望使用 Target/Board 分离和新
    `ecos` CLI 的项目。

## 开始使用

1. [快速上手](start/introduction.md)：安装 SDK、新建工程、编译和烧录的完整流程。
2. [环境准备（WSL）](../common/env.md)：在 Windows 上启用 WSL、安装串口工具。
3. [示例工程（Hello）](../common/quickstart.md)：使用 `ecos init_project` 创建并烧录 Hello 工程。

## API 参考

### 系统与基础

- [ARCHINFO](api/archinfo.md)：芯片标识与架构信息
- [CRC](api/crc.md)：CRC 计算
- [RCU](api/rcu.md)：复位与时钟控制
- [RNG](api/rng.md)：随机数
- [TIMER](api/timer.md)：延时与时基
- [WDG](api/wdg.md)：看门狗

### 通信与总线

- [HP_UART](api/hp_uart.md)：高速串口
- [SYS_UART](api/sys_uart.md)：系统串口
- [I2C](api/i2c.md)：I2C 主机
- [QSPI](api/qspi.md)：QSPI 主机
- [SPI_SOFTWARE](api/spi_software.md)：软件 SPI
- [PS2](api/ps2.md)：PS/2 设备输入

### 存储与文件系统

- [FATFS](api/fatfs.md)：FAT 文件系统
- [SFUD](api/sfud.md)：串行 Flash 通用驱动

### 外设与组件

- [GPIO](api/gpio.md)：输入、输出与中断
- [PWM](api/pwm.md)：占空比与通道控制
- [RTC](api/rtc.md)：实时时钟与闹钟
- [LETTER_SHELL](api/letter-shell.md)：命令行交互

## 模板与板卡支持

[模板模块与板卡支持情况](../templates/explanation.md) 说明 `templates` 目录下各模板
的用途，以及不同板卡当前支持的模板范围。

## 升级到 3.0

3.0 使用 CMake + Ninja 和新的 Python `ecos` CLI，并统一了错误码、日志和驱动接口。
迁移前请阅读[从 SDK 2.0 迁移](../v3.0/migration.md)。
