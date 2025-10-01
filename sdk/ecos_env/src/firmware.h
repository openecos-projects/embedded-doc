/*
 * retroSoC 固件头文件
 * 定义了系统配置参数、内存映射和外设寄存器地址
 * 
 * 作者: MrAMS, maksyuki
 * 版本: v1.0
 * 许可证: MulanPSL-2.0
 */

#ifndef _RETROSOC_DEF_H_
#define _RETROSOC_DEF_H_

#include <stdint.h>
#include <stdbool.h>

/* ========== 系统配置参数 ========== */
#define CPU_FREQ             72     // CPU工作频率，单位: MHz
#define UART_BPS             115200 // UART波特率，单位: bps
#define PSRAM_NUM            1      // PSRAM芯片数量
#define PSRAM_SCLK_MIN_FREQ  12     // PSRAM最小时钟频率，单位: MHz
#define PSRAM_SCLK_MAX_FREQ  133    // PSRAM最大时钟频率，单位: MHz
#define PSRAM_SCLK_FREQ      (CPU_FREQ / 2)  // PSRAM实际工作频率

/* ========== 内存映射定义 ========== */
// SPI Flash 存储器映射 (16MB)
#define SPFS_MEM_START        0x30000000  // SPI Flash起始地址
#define SPFS_MEM_OFFST        0x1000000   // SPI Flash大小偏移量

// 片上SRAM映射 (128KB)
#define SRAM_MEM_START        0x00000000  // 片上SRAM起始地址
#define SRAM_MEM_OFFST        0x20000     // 片上SRAM大小偏移量

// 外部PSRAM映射 (8MB)
#define PSRAM_MEM_START       0x04000000  // 外部PSRAM起始地址
#define PSRAM_MEM_OFFST       0x800000    // 外部PSRAM大小偏移量

/* ========== SPI Flash 控制寄存器 ========== */
#define reg_spictrl           (*(volatile uint32_t*)0x02000000)  // SPI Flash控制寄存器

/* ========== GPIO 寄存器组 ========== */
#define reg_gpio_data         (*(volatile uint32_t*)0x03000000)  // GPIO数据寄存器
#define reg_gpio_enb          (*(volatile uint32_t*)0x03000004)  // GPIO使能寄存器
#define reg_gpio_pub          (*(volatile uint32_t*)0x03000008)  // GPIO上拉使能寄存器
#define reg_gpio_pdb          (*(volatile uint32_t*)0x0300000c)  // GPIO下拉使能寄存器

/* ========== UART 寄存器组 ========== */
#define reg_uart_clkdiv       (*(volatile uint32_t*)0x03000010)  // UART时钟分频寄存器
#define reg_uart_data         (*(volatile uint32_t*)0x03000014)  // UART数据寄存器

/* ========== SPI 寄存器组 ========== */
#define reg_spi_commconfig    (*(volatile uint32_t*)0x03000018)  // SPI通信配置寄存器
#define reg_spi_enables       (*(volatile uint32_t*)0x0300001c)  // SPI使能寄存器
#define reg_spi_pll_config    (*(volatile uint32_t*)0x03000020)  // SPI PLL配置寄存器
#define reg_spi_mfgr_id       (*(volatile uint32_t*)0x03000024)  // SPI制造商ID寄存器
#define reg_spi_prod_id       (*(volatile uint32_t*)0x03000028)  // SPI产品ID寄存器
#define reg_spi_mask_rev      (*(volatile uint32_t*)0x0300002c)  // SPI掩码版本寄存器
#define reg_spi_pll_bypass    (*(volatile uint32_t*)0x03000030)  // SPI PLL旁路寄存器

/* ========== 系统控制寄存器 ========== */
#define reg_xtal_out_dest     (*(volatile uint32_t*)0x03000034)  // 晶振输出目标寄存器
#define reg_pll_out_dest      (*(volatile uint32_t*)0x03000038)  // PLL输出目标寄存器
#define reg_trap_out_dest     (*(volatile uint32_t*)0x0300003c)  // 陷阱输出目标寄存器
#define reg_irq7_source       (*(volatile uint32_t*)0x03000040)  // IRQ7中断源寄存器
#define reg_irq8_source       (*(volatile uint32_t*)0x03000044)  // IRQ8中断源寄存器

/* ========== 定时器0 寄存器组 ========== */
#define reg_tim0_config       (*(volatile uint32_t*)0x0300005c)  // 定时器0配置寄存器
#define reg_tim0_value        (*(volatile uint32_t*)0x03000060)  // 定时器0计数值寄存器
#define reg_tim0_data         (*(volatile uint32_t*)0x03000064)  // 定时器0数据寄存器

/* ========== 定时器1 寄存器组 ========== */
#define reg_tim1_config       (*(volatile uint32_t*)0x03000068)  // 定时器1配置寄存器
#define reg_tim1_value        (*(volatile uint32_t*)0x0300006c)  // 定时器1计数值寄存器
#define reg_tim1_data         (*(volatile uint32_t*)0x03000070)  // 定时器1数据寄存器

/* ========== PSRAM 控制寄存器 ========== */
#define reg_psram_waitcycl    (*(volatile uint32_t*)0x03000080)  // PSRAM等待周期寄存器
#define reg_psram_chd         (*(volatile uint32_t*)0x03000084)  // PSRAM芯片选择延迟寄存器

/* ========== 自定义架构信息寄存器 ========== */
#define reg_cust_archinfo_sys (*(volatile uint32_t*)0x03001000)  // 系统架构信息寄存器
#define reg_cust_archinfo_idl (*(volatile uint32_t*)0x03001004)  // 架构ID低位寄存器
#define reg_cust_archinfo_idh (*(volatile uint32_t*)0x03001008)  // 架构ID高位寄存器

/* ========== 随机数生成器寄存器 ========== */
#define reg_cust_rng_ctrl     (*(volatile uint32_t*)0x03002000)  // RNG控制寄存器
#define reg_cust_rng_seed     (*(volatile uint32_t*)0x03002004)  // RNG种子寄存器
#define reg_cust_rng_val      (*(volatile uint32_t*)0x03002008)  // RNG输出值寄存器

/* ========== 高性能UART寄存器 ========== */
#define reg_cust_uart_lcr     (*(volatile uint32_t*)0x03003000)  // UART线路控制寄存器
#define reg_cust_uart_div     (*(volatile uint32_t*)0x03003004)  // UART分频寄存器
#define reg_cust_uart_trx     (*(volatile uint32_t*)0x03003008)  // UART收发寄存器
#define reg_cust_uart_fcr     (*(volatile uint32_t*)0x0300300c)  // UART FIFO控制寄存器
#define reg_cust_uart_lsr     (*(volatile uint32_t*)0x03003010)  // UART线路状态寄存器

/* ========== PWM 寄存器组 ========== */
#define reg_cust_pwm_ctrl     (*(volatile uint32_t*)0x03004000)  // PWM控制寄存器
#define reg_cust_pwm_pscr     (*(volatile uint32_t*)0x03004004)  // PWM预分频寄存器
#define reg_cust_pwm_cnt      (*(volatile uint32_t*)0x03004008)  // PWM计数寄存器
#define reg_cust_pwm_cmp      (*(volatile uint32_t*)0x0300400c)  // PWM比较寄存器
#define reg_cust_pwm_cr0      (*(volatile uint32_t*)0x03004010)  // PWM通道0控制寄存器
#define reg_cust_pwm_cr1      (*(volatile uint32_t*)0x03004014)  // PWM通道1控制寄存器
#define reg_cust_pwm_cr2      (*(volatile uint32_t*)0x03004018)  // PWM通道2控制寄存器
#define reg_cust_pwm_cr3      (*(volatile uint32_t*)0x0300401c)  // PWM通道3控制寄存器
#define reg_cust_pwm_stat     (*(volatile uint32_t*)0x03004020)  // PWM状态寄存器

/* ========== PS2 接口寄存器 ========== */
#define reg_cust_ps2_ctrl     (*(volatile uint32_t*)0x03005000)  // PS2控制寄存器
#define reg_cust_ps2_data     (*(volatile uint32_t*)0x03005004)  // PS2数据寄存器
#define reg_cust_ps2_stat     (*(volatile uint32_t*)0x03005008)  // PS2状态寄存器

/* ========== I2C 接口寄存器 ========== */
#define reg_cust_i2c_ctrl     (*(volatile uint32_t*)0x03006000)  // I2C控制寄存器
#define reg_cust_i2c_pscr     (*(volatile uint32_t*)0x03006004)  // I2C预分频寄存器
#define reg_cust_i2c_txr      (*(volatile uint32_t*)0x03006008)  // I2C发送寄存器
#define reg_cust_i2c_rxr      (*(volatile uint32_t*)0x0300600c)  // I2C接收寄存器
#define reg_cust_i2c_cmd      (*(volatile uint32_t*)0x03006010)  // I2C命令寄存器
#define reg_cust_i2c_sr       (*(volatile uint32_t*)0x03006014)  // I2C状态寄存器

/* ========== QSPI 接口寄存器 ========== */
#define reg_cust_qspi_status  (*(volatile uint32_t*)0x03007000)  // QSPI状态寄存器
#define reg_cust_qspi_clkdiv  (*(volatile uint32_t*)0x03007004)  // QSPI时钟分频寄存器
#define reg_cust_qspi_cmd     (*(volatile uint32_t*)0x03007008)  // QSPI命令寄存器
#define reg_cust_qspi_adr     (*(volatile uint32_t*)0x0300700c)  // QSPI地址寄存器
#define reg_cust_qspi_len     (*(volatile uint32_t*)0x03007010)  // QSPI长度寄存器
#define reg_cust_qspi_dum     (*(volatile uint32_t*)0x03007014)  // QSPI虚拟周期寄存器
#define reg_cust_qspi_txfifo  (*(volatile uint32_t*)0x03007018)  // QSPI发送FIFO寄存器
#define reg_cust_qspi_rxfifo  (*(volatile uint32_t*)0x03007020)  // QSPI接收FIFO寄存器
#define reg_cust_qspi_intcfg  (*(volatile uint32_t*)0x03007024)  // QSPI中断配置寄存器
#define reg_cust_qspi_intsta  (*(volatile uint32_t*)0x03007028)  // QSPI中断状态寄存器

#endif