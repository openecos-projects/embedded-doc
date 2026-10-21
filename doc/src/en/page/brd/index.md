---
hide:
  - navigation
  - toc
---

# Board Wiki

<style>
/* Center display at 80% */
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
   Inspired by the ESP32 product selection page design
   -------------------------- */

:root {
  --ecos-card-bg: #ffffff;
  --ecos-accent-color: var(--md-primary-fg-color); /* Use theme color */
  --ecos-border-color: rgba(0,0,0,0.1);
  --ecos-text-main: var(--md-typeset-color);
  --ecos-text-muted: var(--md-typeset-color--light);
}

/* Container for the entire series card */
.ecos-series-card {
  background: var(--ecos-card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  margin-bottom: 40px;
  overflow: hidden;
  border: 1px solid var(--ecos-border-color);
}

/* 1. Top header area */
.ecos-series-header {
  padding: 32px 32px 24px 32px;
  position: relative;
}

/* Series title row */
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

/* Top-right button group */
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

/* Subtitle / tagline */
.ecos-series-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ecos-text-main);
  margin-bottom: 16px !important;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0,0,0,0.05);
}

/* Feature list */
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

/* 2. Table area decorative bar */
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

/* 3. Table container */
.ecos-table-container {
  background: #fff;
  margin: -12px 20px 20px 20px; /* Overlap the decorative bar upward */
  border: 2px solid var(--ecos-accent-color); /* Border in the same color as the decorative bar */
  border-radius: 0 0 12px 12px;
  border-top-left-radius: 12px; /* Inner rounded corners */
  border-top-right-radius: 12px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

/* Table style reset */
table.ecos-product-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 !important;
  display: table !important; /* Force table display */
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

/* Element styles within the table */
.ecos-td-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  text-align: center;
}

/* Image link styles */
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

/* Mobile adaptation */
@media screen and (max-width: 768px) {
  .ecos-series-header {
    padding: 20px;
  }

  .ecos-table-decorator, .ecos-table-container {
    margin-left: 10px;
    margin-right: 10px;
  }

  /* Convert the table into a card list on mobile */
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

<!-- StarrySky L Series Card -->
<div class="ecos-series-card">
  <div class="ecos-series-header">
    <div class="ecos-series-title-row">
      <h2 class="ecos-series-title">StarrySky L Series (Starry Sky L)</h2>
      <div class="ecos-series-actions">
        <a href="../sdk/common/env/" class="ecos-btn ecos-btn-primary">Environment Setup</a>
        <a href="../sdk/common/quickstart/" class="ecos-btn ecos-btn-outline">Quick Start</a>
      </div>
    </div>
    <p class="ecos-series-subtitle">A high-performance RISC-V verification and education platform for the One Student One Chip (YSYX) program</p>
    <ul class="ecos-series-features">
      <li>Supports SoC designs from the third to the fifth iteration of YSYX</li>
      <li>Rich on-board peripherals: VGA/HDMI, USB, Ethernet, SD card slot, etc.</li>
      <li>Compatible with the Chiplink high-speed interconnect standard (select models)</li>
      <li>Provides a complete SDK and FPGA verification environment</li>
    </ul>
  </div>

  <!-- Decorative bar -->
  <div class="ecos-table-decorator"></div>

  <!-- Table content -->
  <div class="ecos-table-container">
    <table class="ecos-product-table">
      <thead>
        <tr>
          <th style="width: 18%;">Board Model</th>
          <th style="width: 18%;">Storage</th>
          <th style="width: 18%;">Package/Architecture</th>
          <th style="width: 20%;">Main Peripherals</th>
          <th style="width: 26%;">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v1.2" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v1.2/core/board_func.webp" class="ecos-td-img" alt="L v1.2">
              </a>
              <a href="starry-sky-l/v1.2" class="ecos-td-name">StarrySky L v1.2</a>
            </div>
          </td>
          <td>Flash: 16MB</td>
          <td>SoC baseboard + <br>ZYNQ 7010 SoM</td>
          <td>VGA, PS/2, Audio, PMOD, UART, TF Card</td>
          <td class="ecos-td-desc">The official YSYX board carrying the first batch of 4 SoCs from the third iteration. An entry-level development board suitable for learning the RISC-V architecture.</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v1.3" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v1.3/core/package_cont.webp" class="ecos-td-img" alt="L v1.3">
              </a>
              <a href="starry-sky-l/v1.3" class="ecos-td-name">StarrySky L v1.3</a>
            </div>
          </td>
          <td>Flash: 16MB</td>
          <td>SoC baseboard + <br>ZYNQ 7010 SoM</td>
          <td>VGA, PS/2, Audio, PMOD, UART, TF Card</td>
          <td class="ecos-td-desc">Fixes some known issues compared with v1.2, continues to support YSYX SoC evaluation, and offers more stable performance.</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v2.1" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v2.1/core/package_cont.webp" class="ecos-td-img" alt="L v2.1">
              </a>
              <a href="starry-sky-l/v2.1" class="ecos-td-name">StarrySky L v2.1</a>
            </div>
          </td>
          <td>Flash: 16MB<br></td>
          <td>SoC baseboard + <br>ZYNQ 7020 SoM</td>
          <td>1.14" LCD, VGA, PS/2, Audio, UART, TF</td>
          <td class="ecos-td-desc">Equipped with a TFT-LCD screen for an enhanced interactive experience. Rich on-board peripherals support more complex experiments.</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v3.0" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v3.0/brd_func_top.webp" class="ecos-td-img" alt="L v3.0">
              </a>
              <a href="starry-sky-l/v3.0" class="ecos-td-name">StarrySky L v3.0</a>
            </div>
          </td>
          <td>Flash: 16MB</td>
          <td>SoC mainboard + <br>ZYNQ 7020 SoM</td>
          <td>1.44" LCD, UART, I2C, Type-C, Chiplink</td>
          <td class="ecos-td-desc">Development board for the tape-out chips of the first batch of students in the fifth iteration of YSYX</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-l/v3.1" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-l/v3.1/brd_pcb_top.webp" class="ecos-td-img" alt="L v3.1">
              </a>
              <a href="starry-sky-l/v3.1" class="ecos-td-name">StarrySky L v3.1</a>
            </div>
          </td>
          <td>Flash: 16MB</td>
          <td>SoC mainboard + <br>ZYNQ 7020 SoM</td>
          <td>1.44" LCD, UART, I2C, Type-C, Chiplink, WiFi</td>
          <td class="ecos-td-desc">Development board for the tape-out chips of the second batch of students in the fifth iteration of YSYX</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- StarrySky C Series Card -->
<div class="ecos-series-card">
  <div class="ecos-series-header">
    <div class="ecos-series-title-row">
      <h2 class="ecos-series-title">StarrySky C Series (Starry Sky C)</h2>
      <div class="ecos-series-actions">
        <a href="https://github.com/openecos-projects" target="_blank" class="ecos-btn ecos-btn-primary">GitHub</a>
      </div>
    </div>
    <p class="ecos-series-subtitle">An SoC design and tape-out verification platform based on open-source PDKs</p>
    <ul class="ecos-series-features">
      <li>Based on 110nm/180nm open-source process nodes</li>
      <li>Integrates classic RISC-V cores such as PicoRV32 / E203</li>
      <li>Supports the RetroSoC agile development framework</li>
      <li>Provides full-flow reference designs from ASIC front-end to back-end</li>
    </ul>
  </div>

  <!-- Decorative bar -->
  <div class="ecos-table-decorator" style="background-color: #6c757d;"></div>

  <!-- Table content -->
  <div class="ecos-table-container" style="border-color: #6c757d;">
    <table class="ecos-product-table">
      <thead>
        <tr>
          <th style="width: 18%;">Board Model</th>
          <th style="width: 18%;">Storage</th>
          <th style="width: 18%;">Package/Architecture</th>
          <th style="width: 20%;">Main Peripherals</th>
          <th style="width: 26%;">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-c/v1.0" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-c/v1.0/brd_func_top.webp" class="ecos-td-img" alt="C v1.0">
              </a>
              <a href="starry-sky-c/v1.0" class="ecos-td-name">StarrySky C v1.0</a>
            </div>
          </td>
          <td>SRAM: 128KB<br>PSRAM: 8MB<br>Flash: 16MB</td>
          <td>N/A</td>
          <td>UART, SPI, I2C, GPIO, PWM, LCD</td>
          <td class="ecos-td-desc">A board based on the 110nm open-source retroSoC chip, integrating the PicoRV32 core. Demonstrates the complete open-source chip flow from design to tape-out.</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-c/v2.0_pi" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-c/v2.0/board1.webp" class="ecos-td-img" alt="C v2.0 Pi">
              </a>
              <a href="starry-sky-c/v2.0_pi" class="ecos-td-name">StarrySky C v2.0 Pi</a>
            </div>
          </td>
          <td>SRAM: 128KB<br>PSRAM: 8MB<br>Flash: 16MB</td>
          <td>N/A</td>
          <td>UART, SPI, I2C, GPIO, PWM, PS2, LCD</td>
          <td class="ecos-td-desc">Based on open-source retroSoC, with all pins broken out directly. The compact board is suitable for integrated development.</td>
        </tr>
        <tr>
          <td>
            <div class="ecos-td-product">
              <a href="starry-sky-c/v2.0_pico" class="ecos-td-img-link">
                <img src="../../res/img/brd/starry-sky-c/v2.0/board.webp" class="ecos-td-img" alt="C v2.0 Pico">
              </a>
              <a href="starry-sky-c/v2.0_pico" class="ecos-td-name">StarrySky C v2.0 Pico</a>
            </div>
          </td>
          <td>SRAM: 128KB<br>PSRAM: 8MB<br>Flash: 16MB</td>
          <td>N/A</td>
          <td>UART, SPI, I2C, GPIO, PWM</td>
          <td class="ecos-td-desc">Based on open-source retroSoC, with a rich set of integrated on-board peripherals, suitable for learning and development.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
