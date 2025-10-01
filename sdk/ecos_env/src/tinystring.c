/*
 * 轻量级字符串处理库
 * 提供标准C库字符串和内存操作函数的精简实现
 * 
 * 功能：
 * - 字符串操作：strlen, strcpy, strncpy, strcat, strcmp, strncmp
 * - 内存操作：memset, memcpy, memmove, memcmp
 * - 针对嵌入式系统优化，代码简洁高效
 */

#include <tinystring.h>

/**
 * @brief 计算字符串长度
 * @param s 输入字符串
 * @return 字符串长度（不包括结尾的'\0'）
 */
size_t strlen(const char *s)
{
  const char *p = s;
  while (*p)
  {
    p++;
  }

  return p - s;
}

/**
 * @brief 复制字符串
 * @param dst 目标缓冲区
 * @param src 源字符串
 * @return 目标缓冲区指针
 */
char *strcpy(char *dst, const char *src)
{
  char *d = dst;
  while ((*d++ = *src++))
  {
  }

  return dst;
}

/**
 * @brief 复制指定长度的字符串
 * @param dst 目标缓冲区
 * @param src 源字符串
 * @param n 最大复制字符数
 * @return 目标缓冲区指针
 */
char *strncpy(char *dst, const char *src, size_t n)
{
  char *d = dst;
  while ((n--) > 0 && (*d++ = *src++))
  {
  }
  while ((n--) > 0)  // 用0填充剩余空间
  {
    *d++ = 0;
  }

  return dst;
}

/**
 * @brief 连接字符串
 * @param dst 目标字符串（会被修改）
 * @param src 要追加的源字符串
 * @return 目标字符串指针
 */
char *strcat(char *dst, const char *src)
{
  char *d = dst;

  while (*d++)  // 找到dst的结尾
  {
  }
  d--;
  while ((*d++ = *src++))  // 追加src到dst末尾
  {
  }

  return dst;
}

int strcmp(const char *s1, const char *s2)
{
  // unsigned char type is very important
  unsigned char c1, c2;

  do
  {
    c1 = *s1++;
    c2 = *s2++;
  } while (c1 != 0 && c1 == c2);

  return c1 - c2;
}

int strncmp(const char *s1, const char *s2, size_t n)
{
  unsigned char c1, c2;

  do
  {
    c1 = *s1++;
    c2 = *s2++;
  } while ((n--) > 0 && c1 != 0 && c1 == c2);

  if (!n)
    return 0;
  return c1 - c2;
}

void *memset(void *dst, int c, size_t n)
{
  char *cdst = (char *)dst;

  for (int i = 0; i < n; i++)
  {
    cdst[i] = c;
  }

  return dst;
}

void *memmove(void *dst, const void *src, size_t n)
{
  const char *s = src;
  char *d = dst;

  if (s < d && s + n > d)
  {
    s += n;
    d += n;
    while (n-- > 0)
    {
      *--d = *--s;
    }
  }
  else
  {
    while (n-- > 0)
    {
      *d++ = *s++;
    }
  }

  return dst;
}

void *memcpy(void *out, const void *in, size_t n)
{
  return memmove(out, in, n);
}

int memcmp(const void *s1, const void *s2, size_t n)
{
  const unsigned char *v1 = s1;
  const unsigned char *v2 = s2;

  while ((n--) > 0)
  {
    if (*v1 != *v2)
    {
      return *v1 - *v2;
    }
    v1++, v2++;
  }

  return 0;
}
