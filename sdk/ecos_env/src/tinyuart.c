/*
 * UART 驱动模块
 * 提供基础的串口字符输出功能
 * 
 * 功能：
 * - 字符输出到UART
 * - 支持标准UART和高性能UART两种模式
 */

#include <firmware.h>
#include <tinyuart.h>

/**
 * @brief 向UART发送单个字符
 * @param ch 要发送的字符
 * 
 * 当前使用标准UART模式，直接写入数据寄存器
 * 注释掉的代码为高性能UART模式，包含发送缓冲区状态检查
 */
void putch(char ch)
{
  // 高性能UART模式（已注释）：
  // while (((reg_cust_uart_lsr & 0x100) >> 8) == 1)  // 等待发送缓冲区空闲
  //   ;
  // reg_cust_uart_trx = (uint32_t)ch;               // 写入高性能UART收发寄存器

  // 标准UART模式：直接写入UART数据寄存器
  reg_uart_data = ch;
}
