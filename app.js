/**
 * MÉO TIN SHOW - POSTER ARTIST STUDIO
 * 5-Layer Canvas Composition Engine
 */

// Global State
const state = {
  // Layer 1: Background
  bgType: 'clean', // 'clean', 'original', 'custom'
  bgBrightness: 100,
  showDate: true,
  customDateText: '19.12',
  customBgImg: null,

  // Layer 2: Back Glow
  enableBackGlow: true,
  glowColor: '#00d2ff',
  glowBlur: 25,
  glowIntensity: 85,
  glowSpread: 106,
  glowBlend: 'screen',

  // Layer 3: Artist Cutout
  artistImg: null,
  artistRawImg: null, // before bg removal
  isArtistCutout: true,
  artistScale: 100,
  artistX: 0,
  artistY: -15,
  isFlipped: false,
  artistContrast: 115,
  artistCoolTint: 22,
  artistBrightness: 95,
  enableGradientMask: true,
  fadeStart: 62,
  fadeSoftness: 38,

  // Layer 4: Text & Crown
  enableText: true,
  artistName: 'DAM ON',
  fontFamily: "'CF Jack Story', sans-serif",
  textTilt: -8,
  fontSize: 82,
  textX: 0,
  textY: 145,
  iceTextureSrc: 'assets/ice_texture.jpg',
  textureBrightness: 120,
  textGlow: 22,
  textStroke: 5,
  enableCrown: true,
  crownFollowTilt: true,
  crownScale: 100,
  crownOffsetX: 0,
  crownOffsetY: -55,

  // Layer 5: Foreground (Sparkles, Mist, Snow)
  sparkles: [
    { id: 1, x: -145, y: 130, scale: 1.0, type: 'text-left' },
    { id: 2, x: 145, y: 115, scale: 1.0, type: 'text-right' },
    { id: 3, x: 0, y: 70, scale: 0.85, type: 'crown-top' }
  ],
  sparkleScale: 100,
  sparkleBrightness: 100,
  enableFog: true,
  fogOpacity: 35,
  fogHeight: 40,
  enableSnow: true,
  snowDensity: 40,
  snowParticles: [],

  // Canvas Viewport & UI
  zoom: 1.0,
  panX: 0,
  panY: 0,
  exportScale: 2,
  showGuide: false,
  activeDragTarget: null,
  dragStartMouse: { x: 0, y: 0 },
  dragStartObj: { x: 0, y: 0 }
};

// Cached Assets
const assets = {
  bgClean: new Image(),
  bgOriginal: new Image(),
  iceTexture: new Image(),
  iceTexture2: new Image(),
  crownIcon: new Image(),
  crownSvg: new Image(),
  sparkleSvg: new Image()
};

// Canvas references
const canvas = document.getElementById('posterCanvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.getElementById('canvasWrapper');

// Base Logical Resolution (512 x 382 * 2 = 1024 x 764 for crisp rendering)
const BASE_W = 1024;
const BASE_H = 764;
const S = 2; // scale multiplier relative to original 512x382

// Pre-generate snow particles
function initSnowParticles() {
  state.snowParticles = [];
  for (let i = 0; i < 120; i++) {
    state.snowParticles.push({
      x: Math.random() * BASE_W,
      y: Math.random() * BASE_H,
      size: Math.random() * 2.5 + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: Math.random() * 0.5 + 0.2
    });
  }
}
initSnowParticles();

/**
 * Initialize and preload assets
 */
async function initApp() {
  setupEventListeners();
  setupTabs();
  setupCanvasInteractions();

  showToast('Đang nạp dữ liệu và font chữ...', 'info');

  // Load Images with onload handlers
  const imgList = [assets.bgClean, assets.bgOriginal, assets.iceTexture, assets.iceTexture2, assets.crownIcon];
  imgList.forEach(img => {
    img.onload = () => renderPoster();
  });

  assets.bgClean.src = 'assets/template_clean.png';
  assets.bgOriginal.src = 'assets/template_original.png';
  assets.iceTexture.src = 'assets/ice_texture.jpg';
  assets.iceTexture2.src = 'assets/ice_texture_2.jpg';
  assets.crownIcon.src = 'assets/crown_icon.png';
  assets.crownSvg.src = 'assets/crown.svg';
  assets.sparkleSvg.src = 'assets/sparkle.svg';

  // Wait for font loading
  try {
    await document.fonts.load("80px 'CF Jack Story'");
    await document.fonts.load("80px 'Ice Cold'");
    await document.fonts.ready;
    console.log('Fonts loaded successfully');
  } catch (e) {
    console.warn('Font loading check error', e);
  }

  // Load default artist (DAM ON cutout)
  loadArtistPreset('dam_on');
}

/**
 * Load predefined artist presets
 */
function loadArtistPreset(presetKey) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  if (presetKey === 'dam_on') {
    img.src = 'assets/artist_sample_dam_on.png';
    state.isArtistCutout = true;
    state.artistScale = 105;
    state.artistX = 0;
    state.artistY = -15;
    state.fadeStart = 62;
    state.fadeSoftness = 38;
  } else if (presetKey === 'sample_1') {
    img.src = 'assets/sample_artist.jpg';
    state.isArtistCutout = false;
    state.artistScale = 90;
    state.artistX = 0;
    state.artistY = 10;
  } else if (presetKey === 'sample_2') {
    img.src = 'assets/sample_artist_2.jpg';
    state.isArtistCutout = false;
    state.artistScale = 95;
    state.artistX = 0;
    state.artistY = 15;
  }

  img.onload = () => {
    state.artistImg = img;
    state.artistRawImg = img;
    updateUIInputs();
    renderPoster();
    showToast(`Đã nạp mẫu: ${presetKey.toUpperCase()}`, 'success');

    // If it's a raw photo, prompt to run AI background removal
    if (!state.isArtistCutout) {
      showToast('Ảnh mẫu có nền, bạn có thể bấm "Chạy AI Xóa Nền" để tách người!', 'info');
    }
  };
}

/**
 * Main Render Pipeline: 5-Layer Composition
 */
function renderPoster() {
  if (!canvas || !ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, BASE_W, BASE_H);

  // -------------------------------------------------------------
  // LAYER 1: Background (Hang Băng, Khung Băng, Tiêu Đề Gốc)
  // -------------------------------------------------------------
  renderLayer1_Background();

  // Coordinates of Artist
  const artistBox = calculateArtistBox();

  // -------------------------------------------------------------
  // LAYER 2: Back Glow & Mảnh Băng Sau Lưng (Hào Quang Xanh #00d2ff)
  // -------------------------------------------------------------
  if (state.artistImg && state.enableBackGlow) {
    renderLayer2_BackGlow(artistBox);
  }

  // -------------------------------------------------------------
  // LAYER 3: Nhân Vật Đã Xóa Nền (Graded + Gradient Mask Bottom)
  // -------------------------------------------------------------
  if (state.artistImg) {
    renderLayer3_Artist(artistBox);
  }

  // -------------------------------------------------------------
  // LAYER 4: Chữ Tên Nghệ Sĩ ("DAM ON") & Icon Vương Miện
  // -------------------------------------------------------------
  renderLayer4_TextAndCrown();

  // -------------------------------------------------------------
  // LAYER 5: Foreground Overlay (Sparkles, Ice Fog Mist, Snow)
  // -------------------------------------------------------------
  renderLayer5_Foreground();

  // Optional: Draw bounding guide for dragging
  if (state.showGuide) {
    renderGuides(artistBox);
  }
}

/**
 * Layer 1: Background rendering
 */
function renderLayer1_Background() {
  ctx.save();

  if (state.bgBrightness !== 100) {
    ctx.filter = `brightness(${state.bgBrightness}%)`;
  }

  let bgImg = assets.bgClean;
  if (state.bgType === 'original') {
    bgImg = assets.bgOriginal;
  } else if (state.bgType === 'custom' && state.customBgImg) {
    bgImg = state.customBgImg;
  }

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, BASE_W, BASE_H);
  } else {
    // Fallback dark ice cave background
    ctx.fillStyle = '#050c18';
    ctx.fillRect(0, 0, BASE_W, BASE_H);
  }

  ctx.restore();

  // Date overlay (if user customized the date text e.g. "25.12")
  if (state.showDate && state.customDateText !== '19.12') {
    ctx.save();
    // Cover the original "19.12" with dark blue ice patch
    ctx.fillStyle = '#061324';
    ctx.fillRect(BASE_W / 2 - 80 * S, BASE_H - 45 * S, 160 * S, 30 * S);
    
    // Draw customized date text in glowing ice typography
    ctx.font = `800 ${22 * S}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 10 * S;
    ctx.fillStyle = '#e0f8ff';
    ctx.fillText(`✦  ${state.customDateText}  ✦`, BASE_W / 2, BASE_H - 32 * S);
    ctx.restore();
  }
}

/**
 * Calculate artist position and dimensions on canvas
 */
function calculateArtistBox() {
  if (!state.artistImg) return { x: 0, y: 0, w: 0, h: 0 };

  const imgW = state.artistImg.naturalWidth || state.artistImg.width;
  const imgH = state.artistImg.naturalHeight || state.artistImg.height;

  // Normalized base fit: height ~ 500px in logical coords
  const targetBaseH = 490 * (BASE_H / 764);
  const aspect = imgW / imgH;
  const baseH = targetBaseH;
  const baseW = baseH * aspect;

  const scale = state.artistScale / 100;
  const w = baseW * scale;
  const h = baseH * scale;

  // Center horizontally + offset
  const x = (BASE_W - w) / 2 + state.artistX * S;
  const y = (BASE_H - h) / 2 + state.artistY * S - 20;

  return { x, y, w, h, origW: imgW, origH: imgH };
}

/**
 * Layer 2: Back Glow (#00d2ff, blur 25px, scaled silhouette)
 */
function renderLayer2_BackGlow(box) {
  if (!box.w || !box.h) return;

  // Create an offscreen silhouette canvas
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = box.origW;
  glowCanvas.height = box.origH;
  const gctx = glowCanvas.getContext('2d');

  // Draw artist
  gctx.drawImage(state.artistImg, 0, 0);

  // Fill with glowing ice cyan using source-in
  gctx.globalCompositeOperation = 'source-in';
  gctx.fillStyle = state.glowColor || '#00d2ff';
  gctx.fillRect(0, 0, glowCanvas.width, glowCanvas.height);

  ctx.save();

  // Spread scale factor (e.g. 1.06x)
  const spread = state.glowSpread / 100;
  const gw = box.w * spread;
  const gh = box.h * spread;
  const gx = box.x - (gw - box.w) / 2;
  const gy = box.y - (gh - box.h) / 2;

  // Apply Gaussian blur (scaled to canvas resolution)
  const blurPx = Math.round(state.glowBlur * S);
  ctx.filter = `blur(${blurPx}px)`;
  ctx.globalAlpha = Math.min(1.0, (state.glowIntensity / 100) * 0.85);
  ctx.globalCompositeOperation = state.glowBlend || 'screen';

  // Draw the glow silhouette
  if (state.isFlipped) {
    ctx.save();
    ctx.translate(gx + gw, gy);
    ctx.scale(-1, 1);
    ctx.drawImage(glowCanvas, 0, 0, gw, gh);
    // Double pass with smaller blur for ultra-vibrant neon core
    ctx.filter = `blur(${Math.round(blurPx * 0.45)}px)`;
    ctx.globalAlpha = Math.min(1.0, (state.glowIntensity / 100) * 0.6);
    ctx.drawImage(glowCanvas, 0, 0, gw, gh);
    ctx.restore();
  } else {
    ctx.drawImage(glowCanvas, gx, gy, gw, gh);
    ctx.filter = `blur(${Math.round(blurPx * 0.45)}px)`;
    ctx.globalAlpha = Math.min(1.0, (state.glowIntensity / 100) * 0.6);
    ctx.drawImage(glowCanvas, gx, gy, gw, gh);
  }

  ctx.restore();
}

/**
 * Layer 3: Artist with Gradient Mask & Ice Color Grading
 */
function renderLayer3_Artist(box) {
  if (!box.w || !box.h) return;

  // Offscreen canvas for color grading and fade mask
  const offCanvas = document.createElement('canvas');
  offCanvas.width = box.origW;
  offCanvas.height = box.origH;
  const octx = offCanvas.getContext('2d');

  // Step A: Apply Color Grading (Contrast, Brightness)
  octx.save();
  octx.filter = `contrast(${state.artistContrast}%) brightness(${state.artistBrightness}%)`;
  octx.drawImage(state.artistImg, 0, 0);
  octx.restore();

  // Step B: Ice blue tint in shadows/midtones (tiệp màu hang băng)
  if (state.artistCoolTint > 0) {
    octx.save();
    octx.globalCompositeOperation = 'overlay';
    octx.globalAlpha = state.artistCoolTint / 100;
    
    // Gradient from cold ice blue to dark deep cyan
    const tintGrad = octx.createLinearGradient(0, 0, 0, box.origH);
    tintGrad.addColorStop(0, '#00d2ff');
    tintGrad.addColorStop(1, '#003d5c');
    octx.fillStyle = tintGrad;
    octx.fillRect(0, 0, box.origW, box.origH);
    octx.restore();
  }

  // Step C: Gradient Mask (Mờ dần từ bụng/đùi xuống)
  if (state.enableGradientMask) {
    octx.save();
    octx.globalCompositeOperation = 'destination-out';

    const startY = box.origH * (state.fadeStart / 100);
    const fadeLen = box.origH * (state.fadeSoftness / 100);
    const endY = Math.min(box.origH, startY + fadeLen);

    const maskGrad = octx.createLinearGradient(0, startY, 0, endY);
    maskGrad.addColorStop(0, 'rgba(0, 0, 0, 0)'); // fully preserved
    maskGrad.addColorStop(1, 'rgba(0, 0, 0, 1)'); // completely erased
    
    octx.fillStyle = maskGrad;
    octx.fillRect(0, startY, box.origW, box.origH - startY);
    octx.restore();
  }

  // Step D: Draw onto main canvas
  ctx.save();
  if (state.isFlipped) {
    ctx.translate(box.x + box.w, box.y);
    ctx.scale(-1, 1);
    ctx.drawImage(offCanvas, 0, 0, box.w, box.h);
  } else {
    ctx.drawImage(offCanvas, box.x, box.y, box.w, box.h);
  }
  ctx.restore();
}

/**
 * Layer 4: Ice Dripping Typography & Crown
 */
/**
 * Layer 4: Render Ice Text Layer with procedural icicles, texture & crown
 * (Thuật toán chính xác do người dùng cung cấp kèm gai băng nhũ đá tự động)
 */
function renderIceTextLayer(mainCtx, text, x, y, fontSize, rotationDeg, iceTextureImg) {
    if (!text || !state.enableText) return;

    // 1. Tạo Offscreen Canvas riêng để không làm hỏng nền chính
    const offCanvas = document.createElement('canvas');
    offCanvas.width = mainCtx.canvas.width;
    offCanvas.height = mainCtx.canvas.height;
    const ctx = offCanvas.getContext('2d');

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotationDeg * Math.PI) / 180);
    ctx.font = `900 ${fontSize}px ${state.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 2. Vẽ khuôn chữ gốc + Gai băng nhọn (Icicles) rủ xuống dưới chân chữ
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 0, 0);

    const textWidth = ctx.measureText(text).width;
    const startX = -textWidth / 2;
    const bottomY = fontSize * 0.32;

    // Tạo gai băng tự động dọc theo đáy chữ
    for (let i = 0; i < textWidth; i += 9) {
        const spikeLength = (Math.sin(i * 0.45) * 0.5 + 0.5) * (fontSize * 0.38) + 6;
        const spikeWidth = 3 + (i % 5);
        ctx.beginPath();
        ctx.moveTo(startX + i, bottomY - 5);
        ctx.lineTo(startX + i + spikeWidth / 2, bottomY + spikeLength);
        ctx.lineTo(startX + i + spikeWidth, bottomY - 5);
        ctx.closePath();
        ctx.fill();
    }

    // 3. Khóa kênh Alpha (source-in): Chỉ tô màu và lồng ảnh băng VÀO TRONG RUỘT CHỮ
    ctx.globalCompositeOperation = 'source-in';

    // Tô Gradient băng (Trắng sáng ở đỉnh -> Xanh cyan -> Xanh đậm ở mũi gai)
    const grad = ctx.createLinearGradient(0, -fontSize * 0.5, 0, fontSize * 0.7);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#b8f5ff');
    grad.addColorStop(0.75, '#00c8ff');
    grad.addColorStop(1, '#005187');
    ctx.fillStyle = grad;
    ctx.fillRect(-textWidth, -fontSize, textWidth * 2, fontSize * 2.2);

    // Lồng thêm ảnh bề mặt băng nứt (nếu đã tải)
    if (iceTextureImg && iceTextureImg.complete && iceTextureImg.naturalWidth > 0) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(iceTextureImg, -textWidth * 0.6, -fontSize * 0.6, textWidth * 1.2, fontSize * 1.4);
        ctx.globalAlpha = 1.0;
    }

    // 3b. Viền sáng nhẹ và gắn vương miện trên đầu chữ
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = Math.max(1, 1.5 * S);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.strokeText(text, 0, 0);

    // Gắn vương miện trên đầu chữ (Layer 4)
    if (state.enableCrown) {
      renderCrownAboveText(ctx, 0, 0, textWidth, fontSize);
    }

    ctx.restore();

    // 4. Đưa chữ băng từ Offscreen Canvas sang Canvas chính kèm Hào quang Neon
    mainCtx.save();
    mainCtx.shadowColor = '#00e5ff';
    mainCtx.shadowBlur = state.textGlow > 0 ? state.textGlow * S : 25;
    mainCtx.drawImage(offCanvas, 0, 0);
    
    // Đánh thêm 1 lớp glow tâm trắng cho rực giống ảnh mẫu DAM ON
    mainCtx.shadowColor = '#ffffff';
    mainCtx.shadowBlur = 6;
    mainCtx.drawImage(offCanvas, 0, 0);
    mainCtx.restore();
}

function renderLayer4_TextAndCrown() {
  if (!state.enableText || !state.artistName) return;

  const text = state.artistName;
  const tilt = state.textTilt;
  const cx = BASE_W / 2 + state.textX * S;
  const cy = BASE_H * 0.72 + state.textY * S;
  const curFontSize = state.fontSize * S;

  let activeTexture = assets.iceTexture;
  if (state.iceTextureSrc.includes('ice_texture_2')) {
    activeTexture = assets.iceTexture2;
  } else if (state.iceTextureSrc.includes('template_clean')) {
    activeTexture = assets.bgClean;
  }

  renderIceTextLayer(ctx, text, cx, cy, curFontSize, tilt, activeTexture);
}

/**
 * Render the vector Crown above the text
 */
function renderCrownAboveText(targetCtx, tX, tY, textW, fontH) {
  const crownW = 56 * S * (state.crownScale / 100);
  const crownH = 38 * S * (state.crownScale / 100);
  const cX = tX + state.crownOffsetX * S;
  const cY = tY - fontH * 0.65 + state.crownOffsetY * S;

  targetCtx.save();
  targetCtx.translate(cX, cY);

  // If user disabled crown tilt, counter-rotate
  if (!state.crownFollowTilt) {
    targetCtx.rotate(-(state.textTilt * Math.PI) / 180);
  }

  // Draw Crown Vector Outline with Neon Glow
  targetCtx.shadowColor = '#00d2ff';
  targetCtx.shadowBlur = 14 * S;

  targetCtx.beginPath();
  // 5-point crown polygon matching the official design
  const pts = [
    [-crownW * 0.38, crownH * 0.38],  // Bottom left
    [crownW * 0.38, crownH * 0.38],   // Bottom right
    [crownW * 0.48, -crownH * 0.22],  // Right peak
    [crownW * 0.22, crownH * 0.12],   // Right valley
    [0, -crownH * 0.48],              // Center peak (tallest)
    [-crownW * 0.22, crownH * 0.12],  // Left valley
    [-crownW * 0.48, -crownH * 0.22]  // Left peak
  ];

  targetCtx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    targetCtx.lineTo(pts[i][0], pts[i][1]);
  }
  targetCtx.closePath();

  // Stroke crown
  targetCtx.lineWidth = 3.5 * S;
  targetCtx.strokeStyle = '#f0faff';
  targetCtx.stroke();

  // Subtle translucent fill
  targetCtx.fillStyle = 'rgba(0, 210, 255, 0.15)';
  targetCtx.fill();

  targetCtx.restore();
}

/**
 * Layer 5: Foreground Overlay (Sparkles, Ice Fog Mist, Floating Ice Crystals)
 */
function renderLayer5_Foreground() {
  // 1. Ice Fog Mist at the bottom
  if (state.enableFog && state.fogOpacity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const fogH = BASE_H * (state.fogHeight / 100);
    const fogY = BASE_H - fogH;

    // Linear gradient fog
    const fogGrad = ctx.createLinearGradient(0, fogY, 0, BASE_H);
    const alpha = (state.fogOpacity / 100) * 0.45;
    fogGrad.addColorStop(0, 'rgba(0, 210, 255, 0)');
    fogGrad.addColorStop(0.5, `rgba(128, 230, 255, ${alpha * 0.5})`);
    fogGrad.addColorStop(1, `rgba(0, 160, 240, ${alpha})`);

    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, fogY, BASE_W, fogH);

    // Multi-radial soft cloudy puffs for organic fog
    const puffs = [
      { x: BASE_W * 0.2, y: BASE_H * 0.88, r: 160 * S },
      { x: BASE_W * 0.5, y: BASE_H * 0.92, r: 220 * S },
      { x: BASE_W * 0.8, y: BASE_H * 0.86, r: 180 * S }
    ];

    puffs.forEach(p => {
      const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      radGrad.addColorStop(0, `rgba(180, 245, 255, ${alpha * 0.6})`);
      radGrad.addColorStop(0.5, `rgba(0, 210, 255, ${alpha * 0.25})`);
      radGrad.addColorStop(1, 'rgba(0, 210, 255, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // 2. Floating Ice Crystals / Snow Particles
  if (state.enableSnow && state.snowDensity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const count = Math.min(state.snowParticles.length, state.snowDensity);
    
    for (let i = 0; i < count; i++) {
      const p = state.snowParticles[i];
      ctx.fillStyle = `rgba(220, 250, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (S / 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. 4-pointed Star Sparkles (Tia sáng lấp lánh 4 cánh)
  renderSparkles();
}

/**
 * Render 4-pointed Star Sparkles with dynamic placement
 */
function renderSparkles() {
  const tiltRad = (state.textTilt * Math.PI) / 180;
  const textCx = BASE_W / 2 + state.textX * S;
  const textCy = BASE_H * 0.72 + state.textY * S;

  state.sparkles.forEach(sparkle => {
    let sx = sparkle.x * S;
    let sy = sparkle.y * S;

    // If attached to text relative coordinates, transform with text rotation
    if (sparkle.type === 'text-left' || sparkle.type === 'text-right' || sparkle.type === 'crown-top') {
      const cos = Math.cos(tiltRad);
      const sin = Math.sin(tiltRad);
      const rx = sparkle.x * S * cos - sparkle.y * S * sin;
      const ry = sparkle.x * S * sin + sparkle.y * S * cos;
      sx = textCx + rx;
      sy = textCy + ry;
    }

    const scale = (sparkle.scale || 1.0) * (state.sparkleScale / 100);
    const brightness = state.sparkleBrightness / 100;

    draw4PointSparkle(sx, sy, 34 * S * scale, brightness);
  });
}

/**
 * Draw a single 4-pointed star flare
 */
function draw4PointSparkle(x, y, radius, brightness = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = 'screen';

  // 1. Soft radial cyan glow
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.3);
  glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * brightness})`);
  glowGrad.addColorStop(0.3, `rgba(0, 210, 255, ${0.75 * brightness})`);
  glowGrad.addColorStop(0.7, `rgba(0, 140, 220, ${0.3 * brightness})`);
  glowGrad.addColorStop(1, 'rgba(0, 210, 255, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // 2. 4 Long Curved Diamond Spikes
  ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * brightness})`;
  ctx.beginPath();
  const r = radius;
  const t = radius * 0.12; // thickness at neck

  // Top spike
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, -t, t, 0);
  // Right spike
  ctx.quadraticCurveTo(t, 0, r, 0);
  ctx.quadraticCurveTo(0, t, 0, r);
  // Bottom spike
  ctx.quadraticCurveTo(0, t, -t, 0);
  // Left spike
  ctx.quadraticCurveTo(-t, 0, -r, 0);
  ctx.quadraticCurveTo(0, -t, 0, -r);
  ctx.closePath();
  ctx.fill();

  // 3. Diagonal smaller spikes (45 deg)
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = `rgba(180, 245, 255, ${0.7 * brightness})`;
  ctx.beginPath();
  const subR = radius * 0.45;
  const subT = subR * 0.15;
  ctx.moveTo(0, -subR);
  ctx.quadraticCurveTo(0, -subT, subT, 0);
  ctx.quadraticCurveTo(subT, 0, subR, 0);
  ctx.quadraticCurveTo(0, subT, 0, subR);
  ctx.quadraticCurveTo(0, subT, -subT, 0);
  ctx.quadraticCurveTo(-subT, 0, -subR, 0);
  ctx.quadraticCurveTo(0, -subT, 0, -subR);
  ctx.closePath();
  ctx.fill();

  // 4. White central diamond flare
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1, 2.5 * S), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Optional guide box for positioning
 */
function renderGuides(artistBox) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
  ctx.setLineDash([6 * S, 4 * S]);
  ctx.lineWidth = 1.5 * S;

  // Artist box
  if (artistBox && artistBox.w) {
    ctx.strokeRect(artistBox.x, artistBox.y, artistBox.w, artistBox.h);
  }

  ctx.restore();
}

/**
 * Automatic AI Background Removal via @imgly/background-removal (or fallback)
 */
async function runAIBackgroundRemoval() {
  if (!state.artistRawImg) {
    showToast('Vui lòng chọn hoặc tải ảnh chân dung trước!', 'warning');
    return;
  }

  const aiStatusCard = document.getElementById('aiStatusCard');
  const aiStatusText = document.getElementById('aiStatusText');
  const aiProgressBar = document.getElementById('aiProgressBar');

  aiStatusCard.classList.add('active');
  aiStatusText.textContent = 'Đang khởi động AI mô hình Wasm/WebGL...';
  aiProgressBar.style.width = '15%';

  try {
    showToast('Đang tải thư viện AI tách nền...', 'info');

    // Dynamic ESM import of @imgly/background-removal
    const imgly = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.7/+esm');
    
    aiStatusText.textContent = 'AI đang quét và tách đối tượng (2-3s)...';
    aiProgressBar.style.width = '45%';

    const blob = await imgly.removeBackground(state.artistRawImg, {
      progress: (key, current, total) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100);
          aiProgressBar.style.width = `${pct}%`;
          aiStatusText.textContent = `Đang xử lý ${key}: ${pct}%`;
        }
      }
    });

    aiProgressBar.style.width = '100%';
    aiStatusText.textContent = 'Hoàn tất tách nền!';

    const url = URL.createObjectURL(blob);
    const newCutout = new Image();
    newCutout.onload = () => {
      state.artistImg = newCutout;
      state.isArtistCutout = true;
      renderPoster();
      setTimeout(() => aiStatusCard.classList.remove('active'), 1200);
      showToast('🎉 Đã tách nền AI thành công!', 'success');
    };
    newCutout.src = url;

  } catch (err) {
    console.error('AI removal error:', err);
    aiStatusCard.classList.remove('active');
    showToast('Không tải được AI online hoặc đang offline. Đang chuyển sang Chế độ Xóa Phông Màu (Color Key)!', 'warning');
    runSmartColorKeyRemoval();
  }
}

/**
 * Smart Color Keying fallback (xóa phông nền đơn sắc)
 */
function runSmartColorKeyRemoval() {
  if (!state.artistRawImg) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = state.artistRawImg.naturalWidth;
  tempCanvas.height = state.artistRawImg.naturalHeight;
  const tctx = tempCanvas.getContext('2d');
  tctx.drawImage(state.artistRawImg, 0, 0);

  const imgData = tctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imgData.data;

  // Sample top-left corner color as background candidate
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const threshold = 45;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    if (dist < threshold) {
      data[i + 3] = 0; // Transparent
    } else if (dist < threshold + 20) {
      // Smooth edge feathering
      data[i + 3] = Math.round(((dist - threshold) / 20) * 255);
    }
  }

  tctx.putImageData(imgData, 0, 0);
  const newImg = new Image();
  newImg.onload = () => {
    state.artistImg = newImg;
    state.isArtistCutout = true;
    renderPoster();
    showToast('Đã xóa phông với thuật toán Smart Keying!', 'success');
  };
  newImg.src = tempCanvas.toDataURL('image/png');
}

/**
 * Canvas Drag and Drop interaction for artist, text, and sparkles
 */
function setupCanvasInteractions() {
  let isDragging = false;
  let dragType = null; // 'artist', 'text', 'sparkle'
  let dragSparkleIndex = -1;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * BASE_W;
    const mouseY = ((e.clientY - rect.top) / rect.height) * BASE_H;

    // Check if clicked on a sparkle
    const tiltRad = (state.textTilt * Math.PI) / 180;
    const textCx = BASE_W / 2 + state.textX * S;
    const textCy = BASE_H * 0.72 + state.textY * S;

    for (let i = 0; i < state.sparkles.length; i++) {
      const sp = state.sparkles[i];
      let sx = sp.x * S;
      let sy = sp.y * S;
      if (sp.type === 'text-left' || sp.type === 'text-right' || sp.type === 'crown-top') {
        const cos = Math.cos(tiltRad);
        const sin = Math.sin(tiltRad);
        const rx = sp.x * S * cos - sp.y * S * sin;
        const ry = sp.x * S * sin + sp.y * S * cos;
        sx = textCx + rx;
        sy = textCy + ry;
      }

      const dist = Math.hypot(mouseX - sx, mouseY - sy);
      if (dist < 40 * S) {
        isDragging = true;
        dragType = 'sparkle';
        dragSparkleIndex = i;
        startX = mouseX;
        startY = mouseY;
        return;
      }
    }

    // Check if clicked near text area
    const distToText = Math.hypot(mouseX - textCx, mouseY - textCy);
    if (distToText < 110 * S) {
      isDragging = true;
      dragType = 'text';
      startX = mouseX;
      startY = mouseY;
      state.dragStartObj = { x: state.textX, y: state.textY };
      return;
    }

    // Otherwise, drag artist
    isDragging = true;
    dragType = 'artist';
    startX = mouseX;
    startY = mouseY;
    state.dragStartObj = { x: state.artistX, y: state.artistY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * BASE_W;
    const mouseY = ((e.clientY - rect.top) / rect.height) * BASE_H;
    const dx = (mouseX - startX) / S;
    const dy = (mouseY - startY) / S;

    if (dragType === 'artist') {
      state.artistX = Math.round(state.dragStartObj.x + dx);
      state.artistY = Math.round(state.dragStartObj.y + dy);
      updateUIInputs();
      renderPoster();
    } else if (dragType === 'text') {
      state.textX = Math.round(state.dragStartObj.x + dx);
      state.textY = Math.round(state.dragStartObj.y + dy);
      updateUIInputs();
      renderPoster();
    } else if (dragType === 'sparkle' && dragSparkleIndex >= 0) {
      // Detach sparkle from text and make it free absolute
      const sp = state.sparkles[dragSparkleIndex];
      sp.type = 'free';
      sp.x = Math.round(mouseX / S);
      sp.y = Math.round(mouseY / S);
      renderPoster();
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dragType = null;
      dragSparkleIndex = -1;
    }
  });

  // Double click on canvas to add a new sparkle at click location!
  canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * BASE_W;
    const mouseY = ((e.clientY - rect.top) / rect.height) * BASE_H;

    state.sparkles.push({
      id: Date.now(),
      x: Math.round(mouseX / S),
      y: Math.round(mouseY / S),
      scale: 1.0,
      type: 'free'
    });
    renderPoster();
    showToast('✨ Đã gắn thêm 1 tia sáng lấp lánh tại vị trí bấm!', 'info');
  });
}

/**
 * Setup Event Listeners for UI Controls
 */
function setupEventListeners() {
  // Tabs Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // File Upload
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  // AI Background Removal Button
  document.getElementById('btnRunAI').addEventListener('click', runAIBackgroundRemoval);
  document.getElementById('btnColorKey').addEventListener('click', runSmartColorKeyRemoval);

  // Preset Cards
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      loadArtistPreset(card.dataset.preset);
    });
  });

  // Artist Controls
  bindRange('artistScale', 'valArtistScale', '%', (v) => { state.artistScale = v; renderPoster(); });
  bindRange('artistX', 'valArtistX', '', (v) => { state.artistX = v; renderPoster(); });
  bindRange('artistY', 'valArtistY', '', (v) => { state.artistY = v; renderPoster(); });
  document.getElementById('btnFlipArtist').addEventListener('click', () => {
    state.isFlipped = !state.isFlipped;
    renderPoster();
  });
  document.getElementById('btnResetArtistPos').addEventListener('click', () => {
    state.artistX = 0;
    state.artistY = -15;
    state.artistScale = 100;
    updateUIInputs();
    renderPoster();
  });

  // Xóa / Thêm lại nhân vật
  document.getElementById('btnClearArtist').addEventListener('click', () => {
    state.artistImg = null;
    state.artistRawImg = null;
    document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
    renderPoster();
    showToast('🗑️ Đã xóa nhân vật khỏi poster! Bạn có thể tải ảnh mới hoặc chọn mẫu có sẵn.', 'info');
  });

  const btnRestore = document.getElementById('btnRestoreArtist');
  if (btnRestore) {
    btnRestore.addEventListener('click', () => {
      loadArtistPreset('dam_on');
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      const card = document.querySelector('[data-preset="dam_on"]');
      if (card) card.classList.add('active');
    });
  }

  // Gradient Mask & Color Grading
  document.getElementById('enableGradientMask').addEventListener('change', (e) => {
    state.enableGradientMask = e.target.checked;
    renderPoster();
  });
  bindRange('fadeStart', 'valFadeStart', '%', (v) => { state.fadeStart = v; renderPoster(); });
  bindRange('fadeSoftness', 'valFadeSoftness', '%', (v) => { state.fadeSoftness = v; renderPoster(); });
  bindRange('artistContrast', 'valContrast', '%', (v) => { state.artistContrast = v; renderPoster(); });
  bindRange('artistCoolTint', 'valCoolTint', '%', (v) => { state.artistCoolTint = v; renderPoster(); });
  bindRange('artistBrightness', 'valBrightness', '%', (v) => { state.artistBrightness = v; renderPoster(); });

  // Back Glow Controls
  document.getElementById('enableBackGlow').addEventListener('change', (e) => {
    state.enableBackGlow = e.target.checked;
    renderPoster();
  });
  document.getElementById('glowColor').addEventListener('input', (e) => {
    state.glowColor = e.target.value;
    document.getElementById('valGlowColor').textContent = e.target.value;
    renderPoster();
  });
  bindRange('glowBlur', 'valGlowBlur', 'px', (v) => { state.glowBlur = v; renderPoster(); });
  bindRange('glowIntensity', 'valGlowIntensity', '%', (v) => { state.glowIntensity = v; renderPoster(); });
  bindRange('glowSpread', 'valGlowSpread', 'x', (v) => { state.glowSpread = v; renderPoster(); }, 0.01);
  document.getElementById('glowBlend').addEventListener('change', (e) => {
    state.glowBlend = e.target.value;
    renderPoster();
  });

  // Typography Controls
  document.getElementById('enableText').addEventListener('change', (e) => {
    state.enableText = e.target.checked;
    renderPoster();
  });

  document.getElementById('btnClearText').addEventListener('click', () => {
    state.artistName = '';
    document.getElementById('artistNameInput').value = '';
    renderPoster();
    showToast('🗑️ Đã xóa chữ nghệ sĩ! Bạn có thể nhập tên mới bất kỳ lúc nào.', 'info');
  });

  document.getElementById('btnRestoreText').addEventListener('click', () => {
    state.enableText = true;
    document.getElementById('enableText').checked = true;
    state.artistName = 'DAM ON';
    document.getElementById('artistNameInput').value = 'DAM ON';
    renderPoster();
    showToast('✨ Đã thêm lại chữ DAM ON với hiệu ứng gai băng nhũ đá!', 'success');
  });

  document.getElementById('artistNameInput').addEventListener('input', (e) => {
    state.artistName = e.target.value.toUpperCase();
    renderPoster();
  });
  document.getElementById('fontSelect').addEventListener('change', async (e) => {
    state.fontFamily = e.target.value;
    try {
      await document.fonts.load(`80px ${state.fontFamily}`);
      await document.fonts.ready;
    } catch (err) {}
    renderPoster();
  });
  bindRange('textTilt', 'valTextTilt', '°', (v) => { state.textTilt = v; renderPoster(); });
  bindRange('fontSize', 'valFontSize', 'px', (v) => { state.fontSize = v; renderPoster(); });
  bindRange('textX', 'valTextX', '', (v) => { state.textX = v; renderPoster(); });
  bindRange('textY', 'valTextY', '', (v) => { state.textY = v; renderPoster(); });

  // Ice Texture
  document.getElementById('iceTextureSelect').addEventListener('change', (e) => {
    state.iceTextureSrc = e.target.value;
    renderPoster();
  });
  bindRange('textureBrightness', 'valTextureBrightness', '%', (v) => { state.textureBrightness = v; renderPoster(); });
  bindRange('textGlow', 'valTextGlow', 'px', (v) => { state.textGlow = v; renderPoster(); });
  bindRange('textStroke', 'valTextStroke', 'px', (v) => { state.textStroke = v; renderPoster(); });

  // Crown Controls
  document.getElementById('enableCrown').addEventListener('change', (e) => {
    state.enableCrown = e.target.checked;
    renderPoster();
  });
  document.getElementById('crownFollowTilt').addEventListener('change', (e) => {
    state.crownFollowTilt = e.target.checked;
    renderPoster();
  });
  bindRange('crownScale', 'valCrownScale', '%', (v) => { state.crownScale = v; renderPoster(); });
  bindRange('crownOffsetY', 'valCrownY', 'px', (v) => { state.crownOffsetY = v; renderPoster(); });
  bindRange('crownOffsetX', 'valCrownX', 'px', (v) => { state.crownOffsetX = v; renderPoster(); });

  // Sparkles & FX
  document.getElementById('btnSparklePreset').addEventListener('click', () => {
    state.sparkles = [
      { id: 1, x: -145, y: 130, scale: 1.0, type: 'text-left' },
      { id: 2, x: 145, y: 115, scale: 1.0, type: 'text-right' },
      { id: 3, x: 0, y: 70, scale: 0.85, type: 'crown-top' }
    ];
    renderPoster();
    showToast('Đã khôi phục 3 tia sáng chuẩn!', 'info');
  });

  document.getElementById('btnAddSparkle').addEventListener('click', () => {
    state.sparkles.push({
      id: Date.now(),
      x: 0,
      y: 0,
      scale: 1.0,
      type: 'free'
    });
    renderPoster();
    showToast('Đã thêm 1 tia sáng ở giữa! Bạn có thể kéo chuột để di chuyển nó.', 'info');
  });

  document.getElementById('btnClearSparkles').addEventListener('click', () => {
    state.sparkles = [];
    renderPoster();
    showToast('Đã xóa tất cả tia sáng!', 'info');
  });

  bindRange('sparkleScale', 'valSparkleScale', '%', (v) => { state.sparkleScale = v; renderPoster(); });
  bindRange('sparkleBrightness', 'valSparkleBrightness', '%', (v) => { state.sparkleBrightness = v; renderPoster(); });

  // Fog & Snow
  document.getElementById('enableFog').addEventListener('change', (e) => { state.enableFog = e.target.checked; renderPoster(); });
  bindRange('fogOpacity', 'valFogOpacity', '%', (v) => { state.fogOpacity = v; renderPoster(); });
  bindRange('fogHeight', 'valFogHeight', '%', (v) => { state.fogHeight = v; renderPoster(); });
  document.getElementById('enableSnow').addEventListener('change', (e) => { state.enableSnow = e.target.checked; renderPoster(); });
  bindRange('snowDensity', 'valSnowDensity', ' hạt', (v) => { state.snowDensity = v; renderPoster(); });

  // Background
  document.getElementById('bgSelect').addEventListener('change', (e) => {
    state.bgType = e.target.value;
    if (e.target.value === 'custom') {
      document.getElementById('customBgInput').click();
    }
    renderPoster();
  });
  document.getElementById('customBgInput').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          state.customBgImg = img;
          state.bgType = 'custom';
          renderPoster();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  document.getElementById('showDate').addEventListener('change', (e) => { state.showDate = e.target.checked; renderPoster(); });
  document.getElementById('customDateText').addEventListener('input', (e) => { state.customDateText = e.target.value; renderPoster(); });
  bindRange('bgBrightness', 'valBgBrightness', '%', (v) => { state.bgBrightness = v; renderPoster(); });

  // Stage Toolbar Controls
  document.getElementById('btnZoomIn').addEventListener('click', () => zoomCanvas(1.15));
  document.getElementById('btnZoomOut').addEventListener('click', () => zoomCanvas(0.85));
  document.getElementById('btnResetView').addEventListener('click', () => {
    state.zoom = 1.0;
    canvasWrapper.style.transform = `scale(1.0)`;
  });
  document.getElementById('btnToggleGuide').addEventListener('click', () => {
    state.showGuide = !state.showGuide;
    renderPoster();
  });

  // Export Button
  document.getElementById('btnExport').addEventListener('click', exportHighResPNG);

  // Compare Modal
  const compareModal = document.getElementById('compareModal');
  document.getElementById('btnCompare').addEventListener('click', () => {
    document.getElementById('compareCurrentImg').src = canvas.toDataURL('image/png');
    compareModal.classList.add('active');
  });
  document.getElementById('btnCloseCompare').addEventListener('click', () => {
    compareModal.classList.remove('active');
  });
}

/**
 * Handle image file upload
 */
function handleUploadedFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.artistRawImg = img;
      state.artistImg = img;
      state.isArtistCutout = false;
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      updateUIInputs();
      renderPoster();

      showToast('Đã tải ảnh lên! Bấm "Chạy AI Xóa Nền" để tự động tách nền.', 'info');
      // Prompt user or automatically trigger AI
      setTimeout(() => {
        if (confirm('Bạn có muốn hệ thống tự động chạy AI tách nền cho bức ảnh này ngay bây giờ không?')) {
          runAIBackgroundRemoval();
        }
      }, 300);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Helper to bind range slider with label
 */
function bindRange(id, valId, unit, callback, multiplier = 1) {
  const input = document.getElementById(id);
  const label = document.getElementById(valId);
  if (!input || !label) return;

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    const displayVal = (val * multiplier).toFixed(multiplier < 1 ? 2 : 0);
    label.textContent = `${displayVal}${unit}`;
    callback(val);
  });
}

/**
 * Update UI values from state
 */
function updateUIInputs() {
  setRange('artistScale', 'valArtistScale', state.artistScale, '%');
  setRange('artistX', 'valArtistX', state.artistX, '');
  setRange('artistY', 'valArtistY', state.artistY, '');
  setRange('textX', 'valTextX', state.textX, '');
  setRange('textY', 'valTextY', state.textY, '');
}

function setRange(id, valId, value, unit) {
  const input = document.getElementById(id);
  const label = document.getElementById(valId);
  if (input) input.value = value;
  if (label) label.textContent = `${value}${unit}`;
}

function zoomCanvas(factor) {
  state.zoom = Math.min(2.5, Math.max(0.4, state.zoom * factor));
  canvasWrapper.style.transform = `scale(${state.zoom})`;
}

/**
 * High-Resolution PNG Export
 */
function exportHighResPNG() {
  showToast('Đang kết xuất ảnh chất lượng cao...', 'info');

  const exportScaleSelect = document.getElementById('exportScale');
  const scaleMult = parseInt(exportScaleSelect.value, 10) || 2;

  // Temporary offscreen canvas for crisp export
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 512 * scaleMult;
  exportCanvas.height = 382 * scaleMult;
  const ectx = exportCanvas.getContext('2d');

  // Draw current canvas scaled smoothly
  ectx.imageSmoothingEnabled = true;
  ectx.imageSmoothingQuality = 'high';
  ectx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

  const cleanName = (state.artistName || 'ARTIST').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `MEO-TIN-SHOW_${cleanName}_${exportCanvas.width}x${exportCanvas.height}.png`;

  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đã xuất file thành công: ${filename}`, 'success');
  }, 'image/png');
}

/**
 * Toast Notification system
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast`;
  
  let icon = '❄️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function setupTabs() {
  // Handled in setupEventListeners
}

// Start application
window.addEventListener('DOMContentLoaded', initApp);
