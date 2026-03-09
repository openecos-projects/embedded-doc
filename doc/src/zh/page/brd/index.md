---
hide:
  - navigation
  - toc
---

# 板卡百科

<style>
/* 居中 80% 显示 */
.md-grid {
  max-width: 70% !important;
  margin: 0 auto !important;
  padding: 0 !important;
}
.md-content__inner {
  margin: 0 !important;
  padding: 0 !important;
}
.md-content {
  max-width: none !important;
}
@media screen and (max-width: 768px) {
  .md-grid {
    max-width: 95% !important;
  }
}

/* --------------------------
   ECOS Series Card Layout
   仿 ESP32 产品选型页面的设计
   -------------------------- */

:root {
  --ecos-card-bg: #ffffff;
  --ecos-accent-color: var(--md-primary-fg-color); /* 使用主题色 */
  --ecos-border-color: rgba(0,0,0,0.1);
  --ecos-text-main: var(--md-typeset-color);
  --ecos-text-muted: var(--md-typeset-color--light);
}

/* 整个系列卡片容器 */
.ecos-series-card {
  background: var(--ecos-card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  margin-bottom: 40px;
  overflow: hidden;
  border: 1px solid var(--ecos-border-color);
}

/* 1. 顶部头部区域 */
.ecos-series-header {
  padding: 32px 32px 24px 32px;
  position: relative;
}

/* 系列标题行 */
.ecos-series-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.ecos-series-title {
  margin: 0 !important;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ecos-text-main);
  line-height: 1.2;
}

/* 右上角按钮组 */
.ecos-series-actions {
  display: flex;
  gap: 12px;
}

.ecos-btn {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.2s;
}

.ecos-btn-primary {
  background-color: var(--ecos-accent-color);
  color: white !important;
}

.ecos-btn-outline {
  background-color: transparent;
  border: 1px solid var(--ecos-accent-color);
  color: var(--ecos-accent-color) !important;
}

.ecos-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 副标题/标语 */
.ecos-series-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ecos-text-main);
  margin-bottom: 16px !important;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0,0,0,0.05);
}

/* 特性列表 */
.ecos-series-features {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 8px 24px;
}

.ecos-series-features li {
  position: relative;
  padding-left: 16px;
  font-size: 0.95rem;
  color: var(--ecos-text-muted);
  line-height: 1.6;
}

.ecos-series-features li::before {
  content: "•";
  color: var(--ecos-accent-color);
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0;
}

/* 2. 表格区域装饰条 */
.ecos-table-decorator {
  height: 24px;
  background-color: var(--ecos-accent-color);
  margin-top: 24px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  margin-left: 20px;
  margin-right: 20px;
  position: relative;
  z-index: 1;
}

/* 3. 表格容器 */
.ecos-table-container {
  background: #fff;
  margin: -12px 20px 20px 20px; /* 向上重叠装饰条 */
  border: 2px solid var(--ecos-accent-color); /* 与装饰条同色边框 */
  border-radius: 0 0 12px 12px;
  border-top-left-radius: 12px; /* 内部圆角 */
  border-top-right-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

/* 表格样式重置 */
table.ecos-product-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 !important;
  display: table !important; /* 强制表格显示 */
}

table.ecos-product-table th,
table.ecos-product-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  vertical-align: middle;
}

table.ecos-product-table th {
  background-color: rgba(0,0,0,0.02);
  font-weight: 700;
  color: var(--ecos-text-main);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

table.ecos-product-table tr:last-child td {
  border-bottom: none;
}

table.ecos-product-table tr:hover {
  background-color: rgba(0,0,0,0.01);
}

/* 表格内元素样式 */
.ecos-td-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  text-align: center;
}

/* 图片链接样式 */
.ecos-td-img-link {
  display: block;
  flex-shrink: 0;
}

.ecos-td-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 4px;
  transition: transform 0.2s;
}

.ecos-td-img-link:hover .ecos-td-img {
  transform: scale(1.1);
}

.ecos-td-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--md-typeset-a-color);
  text-decoration: none;
}

.ecos-td-desc {
  font-size: 0.9rem;
  color: var(--ecos-text-muted);
  line-height: 1.5;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ecos-series-header {
    padding: 20px;
  }
  
  .ecos-table-decorator, .ecos-table-container {
    margin-left: 10px;
    margin-right: 10px;
  }
  
  /* 移动端将表格转为卡片列表 */
  table.ecos-product-table, 
  table.ecos-product-table thead, 
  table.ecos-product-table tbody, 
  table.ecos-product-table th, 
  table.ecos-product-table td, 
  table.ecos-product-table tr { 
    display: block !important; 
  }
  
  table.ecos-product-table thead tr { 
    position: absolute;
    top: -9999px;
    left: -9999px;
  }
  
  table.ecos-product-table tr { 
    border-bottom: 1px solid var(--ecos-border-color);
    padding: 16px 0;
  }
  
  table.ecos-product-table td { 
    border: none;
    padding: 8px 16px;
    position: relative;
  }
  
  .ecos-td-product {
    margin-bottom: 8px;
  }
}
</style>

<!-- 星空L系列 Card -->
<div class="ecos-series-card">
  <div class="ecos-series-header">
    <div class="ecos-series-title-row">
      <h2 class="ecos-series-title">星空L系列 (Starry Sky L)</h2>
      <div class="ecos-series-actions">
        <a href="../sdk/env" class="ecos-btn ecos-btn-primary">环境配置</a>
        <a href="../sdk/quickstart" class="ecos-btn ecos-btn-outline">快速上手</a>
      </div>
    </div>
    <p class="ecos-series-subtitle">面向“一生一芯”计划的高性能 RISC-V 验证与教育平台</p>
    <ul class="ecos-series-features">
      <li>支持一生一芯第三期至第五期 SoC 设计</li>
      <li>板载丰富外设：VGA/HDMI、USB、以太网、SD卡槽等</li>
      <li>兼容 Chiplink 高速互联标准 (部分型号)</li>
      <li>提供完整的 SDK 与 FPGA 验证环境</li>
    </ul>
  </div>
  
  <!-- 装饰条 -->
  <div class="ecos-table-decorator"></div>
  
  <!-- 表格内容 -->
  <div class="ecos-table-container">
    <table class="ecos-product-table">
      <thead>
        <tr>
          <th style="width: 18%;">板卡型号</th>
          <th style="width: 18%;">存储</th>
          <th style="width: 18%;">封装/架构</th>
          <th style="width: 20%;">主要外设</th>
          <th style="width: 26%;">描述</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v1.2" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v1.2/core/board_func.png" class="ecos-td-img" alt="L v1.2">
              </a>
              <a href="starry-sky-l/v1.2" class="ecos-td-name">星空L v1.2</a>
            </div>
          </td>
          <td>Flash: 16MB x2<br><span style="color:var(--ecos-text-muted);font-size:0.85em;">(SoC+FPGA)</span></td>
          <td>SoC底板 + <br>ZYNQ 7010核心板</td>
          <td>VGA, PS/2, Audio, PMOD, UART, TF Card</td>
          <td class="ecos-td-desc">搭载三期第一批4个SoC的一生一芯官方板卡。入门级开发板，适合RISC-V架构学习。</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v1.3" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v1.3/core/package_cont.png" class="ecos-td-img" alt="L v1.3">
              </a>
              <a href="starry-sky-l/v1.3" class="ecos-td-name">星空L v1.3</a>
            </div>
          </td>
          <td>Flash: 16MB<br><span style="color:var(--ecos-text-muted);font-size:0.85em;">(SoC/FPGA共享?)</span></td>
          <td>SoC底板 + <br>ZYNQ 7010核心板</td>
          <td>VGA, PS/2, Audio, PMOD, UART, TF Card</td>
          <td class="ecos-td-desc">相比v1.2修正了部分已知问题，继续支持一生一芯SoC评估，性能更加稳定。</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v2.1" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v2.1/core/package_cont.png" class="ecos-td-img" alt="L v2.1">
              </a>
              <a href="starry-sky-l/v2.1" class="ecos-td-name">星空L v2.1</a>
            </div>
          </td>
          <td>RAM: 32MB<br>Flash: 16MB<br><span style="color:var(--ecos-text-muted);font-size:0.85em;">(LPSDRAM)</span></td>
          <td>SoC底板 + <br>ZYNQ 7020核心板</td>
          <td>1.14" LCD, VGA, PS/2, Audio, UART, TF</td>
          <td class="ecos-td-desc">配备TFT-LCD屏幕，增强交互体验。板载外设丰富，支持更多复杂实验。</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v3.0" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v3.0/brd_func_top.png" class="ecos-td-img" alt="L v3.0">
              </a>
              <a href="starry-sky-l/v3.0" class="ecos-td-name">星空L v3.0</a>
            </div>
          </td>
          <td>Flash: 16MB<br>SD Card Slot</td>
          <td>SoC主板 + <br>MZ7X484核心板</td>
          <td>1.44" LCD, UART, I2C, Type-C, Chiplink</td>
          <td class="ecos-td-desc">采用SoC主板+FPGA核心板贴装设计，支持Chiplink高速互联。高性能计算理想平台。</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- 星空C系列 Card -->
<div class="ecos-series-card">
  <div class="ecos-series-header">
    <div class="ecos-series-title-row">
      <h2 class="ecos-series-title">星空C系列 (Starry Sky C)</h2>
      <div class="ecos-series-actions">
        <a href="https://github.com/openecos-projects" target="_blank" class="ecos-btn ecos-btn-primary">GitHub</a>
      </div>
    </div>
    <p class="ecos-series-subtitle">基于开源 PDK 的 SoC 设计与流片验证平台</p>
    <ul class="ecos-series-features">
      <li>基于 110nm/180nm 开源工艺节点</li>
      <li>集成 PicoRV32 / E203 等经典 RISC-V 核心</li>
      <li>支持 RetroSoC 敏捷开发框架</li>
      <li>提供 ASIC 前端到后端的全流程参考设计</li>
    </ul>
  </div>
  
  <!-- 装饰条 -->
  <div class="ecos-table-decorator" style="background-color: #6c757d;"></div>
  
  <!-- 表格内容 -->
  <div class="ecos-table-container" style="border-color: #6c757d;">
    <table class="ecos-product-table">
      <thead>
        <tr>
          <th style="width: 18%;">板卡型号</th>
          <th style="width: 18%;">存储</th>
          <th style="width: 18%;">封装/架构</th>
          <th style="width: 20%;">主要外设</th>
          <th style="width: 26%;">描述</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-c/v1.0" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-c/v1.0/brd_func_top.png" class="ecos-td-img" alt="C v1.0">
              </a>
              <a href="starry-sky-c/v1.0" class="ecos-td-name">星空C v1.0</a>
            </div>
          </td>
          <td>SRAM: 128KB<br>PSRAM: 8MB<br>Flash: 16MB</td>
          <td>N/A</td>
          <td>UART, SPI, I2C, GPIO, PWM, LCD</td>
          <td class="ecos-td-desc">基于110nm开源SoC芯片板卡，集成PicoRV32核。展示了开源芯片从设计到流片的完整流程。</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-c/v2.0_pi" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-c/v2.0/board.png" class="ecos-td-img" alt="C v2.0 Pi">
              </a>
              <a href="starry-sky-c/v2.0_pi" class="ecos-td-name">星空C v2.0 Pi</a>
            </div>
          </td>
          <td>SRAM: 128KB<br>PSRAM: 8MB<br>Flash: 16MB</td>
          <td>N/A</td>
          <td>UART, SPI, I2C, GPIO, PWM, PS2, LCD</td>
          <td class="ecos-td-desc">基于开源ASIC定制框架retroSoC，采用树莓派外形因子。兼容树莓派扩展板，生态资源丰富。</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-c/v2.0_pico" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-c/v2.0/board1.png" class="ecos-td-img" alt="C v2.0 Pico">
              </a>
              <a href="starry-sky-c/v2.0_pico" class="ecos-td-name">星空C v2.0 Pico</a>
            </div>
          </td>
          <td>SRAM: 128KB<br>PSRAM: 8MB<br>Flash: 16MB</td>
          <td>N/A</td>
          <td>UART, SPI, I2C, GPIO, PWM</td>
          <td class="ecos-td-desc">基于开源ASIC定制框架retroSoC，采用Pico外形因子。小巧精致，适合嵌入式控制和便携设备开发。</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
