
/*
 * UART 驱动头文件
 * 定义UART相关的函数接口
 */

#ifndef TINYUART_H__
#define TINYUART_H__

/**
 * @brief 向UART发送单个字符
 * @param ch 要发送的字符
 * 
 * 这是系统中最基础的字符输出函数，被printf等高级函数调用
 */
void putch(char ch);

#endif