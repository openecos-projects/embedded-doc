/*
 * GPIO 驱动模块
 * 提供GPIO输入输出控制和测试功能
 * 
 * 功能：
 * - GPIO方向控制（输入/输出）
 * - GPIO数据读写
 * - LED控制测试
 * - 按键输入检测测试
 */

#include <firmware.h>
#include <tinyprintf.h>
#include <tinytim.h>
#include <tinygpio.h>

/**
 * @brief GPIO功能测试函数
 * 
 * 测试内容：
 * 1. GPIO使能寄存器读写测试
 * 2. GPIO数据寄存器读写测试  
 * 3. LED闪烁输出测试
 * 4. 按键输入检测测试（需要扩展板）
 */
void ip_gpio_test()
{
    printf("[IP] gpio test\n");

    // GPIO使能寄存器测试
    printf("[GPIO ENB] %x\n", reg_gpio_enb);
    reg_gpio_enb = (uint32_t)0b0000;  // 设置所有GPIO为输出模式
    printf("[GPIO ENB] %x\n", reg_gpio_enb);

    // GPIO数据寄存器测试
    printf("[GPIO DATA] %x\n", reg_gpio_data);
    reg_gpio_data = (uint32_t)0xffff;  // 设置所有GPIO输出高电平
    printf("[GPIO DATA] %x\n", reg_gpio_data);

    reg_gpio_data = (uint32_t)0x0000;  // 设置所有GPIO输出低电平
    printf("[GPIO DATA] %x\n", reg_gpio_data);

    // LED闪烁输出测试
    printf("led output test\n");
    for (int i = 0; i < 50; ++i)
    {
        delay_ms(300);  // 延时300ms
        if (reg_gpio_data == 0b00)
            reg_gpio_data = (uint32_t)0b01;  // 点亮LED
        else
            reg_gpio_data = (uint32_t)0b00;  // 熄灭LED
    }

    // 按键输入检测测试（需要外部扩展板）
    reg_gpio_data = (uint32_t)0b00;
    printf("key input test\n"); // need extn board
    reg_gpio_enb = (uint32_t)0b0010;  // 设置GPIO1为输入，GPIO0为输出
    printf("[GPIO ENB] %x\n", reg_gpio_enb);
    printf("[GPIO DATA] %x\n", reg_gpio_data);
    
    for (int i = 0; i < 60; ++i)
    {
        uint32_t led_val = 0b00;
        // 检测按键状态（GPIO1，低电平有效）
        if (((reg_gpio_data & 0b10) >> 1) == 0b0)
        {
            delay_ms(100); // 按键消抖处理
            if (((reg_gpio_data & 0b10) >> 1) == 0b0)
            {
                printf("key detect\n");
                // 切换LED状态
                if (led_val == 0b00)
                {
                    led_val = 0b01;
                    reg_gpio_data = led_val;  // 点亮LED
                }
                else
                {
                    led_val = 0b00;
                    reg_gpio_data = led_val;  // 熄灭LED
                }
            }
        }
    }
}