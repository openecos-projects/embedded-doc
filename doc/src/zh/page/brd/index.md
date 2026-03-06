# 板卡百科

<style>
/* --------------------------
   ECOS 板卡列表 - 现代卡片设计 v2.0
   -------------------------- */

/* 容器：整体卡片样式 */
.ecos-row-card {
  display: flex;
  flex-direction: row;
  background: var(--md-default-bg-color);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px; /* 更圆润的边角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); /* 柔和的基础阴影 */
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* 平滑过渡 */
  position: relative;
}

/* 悬停效果：上浮 + 加深阴影 */
.ecos-row-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--md-accent-fg-color); /* 边框高亮 */
}

/* 左侧：图片展示区 */
.ecos-row-card-left {
  width: 280px; /* 稍微加宽 */
  flex-shrink: 0;
  /* 渐变背景，增加质感 */
  background: linear-gradient(135deg, #f9fafb 0%, #ebedef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 图片本身 */
.ecos-row-card-left img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  /* 图片投影，增加立体感 */
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transition: transform 0.4s ease;
  display: block;
}

/* 悬停时图片微动 */
.ecos-row-card:hover .ecos-row-card-left img {
  transform: scale(1.08) rotate(-1deg);
}

/* 右侧：内容区 */
.ecos-row-card-right {
  flex-grow: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 标题样式 */
.ecos-row-card-title {
  margin: 0 0 12px 0 !important;
  font-size: 1.35rem; /* 增大字号 */
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

/* 标题链接 */
.ecos-row-card-title a {
  color: var(--md-typeset-color);
  text-decoration: none;
  border-bottom: none;
  transition: color 0.2s;
}

.ecos-row-card:hover .ecos-row-card-title a {
  color: var(--md-accent-fg-color);
}

/* 描述文字 */
.ecos-row-card-desc {
  font-size: 1rem;
  color: var(--md-typeset-color--light); /* 使用次级文本颜色 */
  line-height: 1.6;
  margin: 0 0 20px 0 !important;
  flex-grow: 1;
}

/* 底部交互链接 "了解详情" */
.ecos-card-action {
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-accent-fg-color);
  text-decoration: none;
  opacity: 0.85;
  transition: all 0.2s;
  align-self: flex-start; /* 左对齐 */
}

.ecos-card-action:hover {
  opacity: 1;
  text-decoration: none; /* 去除下划线 */
}

/* 箭头动画 */
.ecos-card-action::after {
  content: "→";
  margin-left: 6px;
  transition: transform 0.2s;
  display: inline-block;
}

.ecos-card-action:hover::after {
  transform: translateX(4px);
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ecos-row-card {
    flex-direction: column;
    border-radius: 8px;
  }
  
  .ecos-row-card-left {
    width: 100%;
    height: 220px;
    background: #f8f9fa; /* 简化背景 */
    padding: 20px;
  }
  
  .ecos-row-card-right {
    padding: 20px;
  }
  
  .ecos-row-card-title {
    font-size: 1.2rem;
  }
}
</style>

## 星空L系列

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-l/v1.2">
      <img src="../../res/img/brd/starry-sky-l/v1.2/core/board_func.png" alt="星空L v1.2">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-l/v1.2">星空L v1.2</a>
    </h3>
    <p class="ecos-row-card-desc">
      搭载三期第一批4个SoC的一生一芯官方板卡。作为入门级开发板，适合初学者进行RISC-V架构的学习与验证。
    </p>
    <a href="starry-sky-l/v1.2" class="ecos-card-action">了解详情</a>
  </div>
</div>

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-l/v1.3">
      <img src="../../res/img/brd/starry-sky-l/v1.3/core/package_cont.png" alt="星空L v1.3">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-l/v1.3">星空L v1.3</a>
    </h3>
    <p class="ecos-row-card-desc">
      相比v1.2进行了优化，修正了部分已知问题，继续支持一生一芯SoC评估，性能更加稳定。
    </p>
    <a href="starry-sky-l/v1.3" class="ecos-card-action">了解详情</a>
  </div>
</div>

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-l/v2.1">
      <img src="../../res/img/brd/starry-sky-l/v2.1/core/package_cont.png" alt="星空L v2.1">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-l/v2.1">星空L v2.1</a>
    </h3>
    <p class="ecos-row-card-desc">
      配备1.14寸TFT-LCD屏幕，增强交互体验。板载外设更加丰富，支持更多复杂的实验项目。
    </p>
    <a href="starry-sky-l/v2.1" class="ecos-card-action">了解详情</a>
  </div>
</div>

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-l/v3.0">
      <img src="../../res/img/brd/starry-sky-l/v3.0/brd_func_top.png" alt="星空L v3.0">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-l/v3.0">星空L v3.0 (星空派)</a>
    </h3>
    <p class="ecos-row-card-desc">
      采用SoC主板+FPGA核心板贴装设计，支持Chiplink高速互联。为高性能计算和FPGA加速应用提供了理想的开发平台。
    </p>
    <a href="starry-sky-l/v3.0" class="ecos-card-action">了解详情</a>
  </div>
</div>

## 星空C系列

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-c/v1.0">
      <img src="../../res/img/brd/starry-sky-c/v1.0/brd_func_top.png" alt="星空C v1.0">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-c/v1.0">星空C v1.0</a>
    </h3>
    <p class="ecos-row-card-desc">
      基于110nm开源SoC芯片板卡，集成PicoRV32核。展示了开源芯片从设计到流片的完整流程。
    </p>
    <a href="starry-sky-c/v1.0" class="ecos-card-action">了解详情</a>
  </div>
</div>

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-c/v2.0_pi">
      <img src="../../res/img/brd/starry-sky-c/v2.0/board.png" alt="星空C v2.0 Pi">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-c/v2.0_pi">星空C v2.0 Pi</a>
    </h3>
    <p class="ecos-row-card-desc">
      基于开源ASIC定制框架retroSoC，采用树莓派外形因子。兼容树莓派扩展板，生态资源丰富。
    </p>
    <a href="starry-sky-c/v2.0_pi" class="ecos-card-action">了解详情</a>
  </div>
</div>

<div class="ecos-row-card">
  <div class="ecos-row-card-left">
    <a href="starry-sky-c/v2.0_pico">
      <img src="../../res/img/brd/starry-sky-c/v2.0/board1.png" alt="星空C v2.0 Pico">
    </a>
  </div>
  <div class="ecos-row-card-right">
    <h3 class="ecos-row-card-title">
      <a href="starry-sky-c/v2.0_pico">星空C v2.0 Pico</a>
    </h3>
    <p class="ecos-row-card-desc">
      基于开源ASIC定制框架retroSoC，采用Pico外形因子。小巧精致，适合嵌入式控制和便携设备开发。
    </p>
    <a href="starry-sky-c/v2.0_pico" class="ecos-card-action">了解详情</a>
  </div>
</div>
