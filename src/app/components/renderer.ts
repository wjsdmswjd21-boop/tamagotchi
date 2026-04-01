import { SpriteFrame, COLORS } from './sprites';

const PIXEL_SIZE = 6;   // 16×16 × 6px = 96px per character
const GRID = 16;
const SPRITE_PX = GRID * PIXEL_SIZE; // 96px

export const CANVAS_W = 256;
export const CANVAS_H = 220;

export function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#c8d8a0';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteFrame,
  x: number,
  y: number,
  flip = false,
) {
  const grid = sprite.length;
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const val = sprite[row][col];
      if (val === 0) continue;
      const color = COLORS[val] || '#000';
      ctx.fillStyle = color;
      const px = flip ? x + (grid - 1 - col) * PIXEL_SIZE : x + col * PIXEL_SIZE;
      const py = y + row * PIXEL_SIZE;
      ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
}

type Layer = (string | 0)[][];

export function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  x: number,
  y: number,
  flip = false,
  scale = PIXEL_SIZE,
) {
  const grid = layer.length;
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < layer[row].length; col++) {
      const val = layer[row][col];
      if (val === 0 || val === '') continue;
      ctx.fillStyle = val as string;
      const px = flip ? x + (grid - 1 - col) * scale : x + col * scale;
      const py = y + row * scale;
      ctx.fillRect(px, py, scale, scale);
    }
  }
}

export function drawPoopSmall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const p = [
    [0,0,11,0,0,0],
    [0,11,11,11,0,0],
    [11,12,11,12,11,0],
    [11,11,11,11,11,0],
    [11,2,11,2,11,0],
    [0,11,11,11,0,0],
  ];
  const sz = 4;
  for (let r = 0; r < p.length; r++) {
    for (let c = 0; c < p[r].length; c++) {
      if (p[r][c] === 0) continue;
      ctx.fillStyle = COLORS[p[r][c]];
      ctx.fillRect(x + c * sz, y + r * sz, sz, sz);
    }
  }
}

export function drawZzz(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.fillStyle = '#555';
  ctx.font = '14px monospace';
  const offsets = [0, -6, -12];
  const sizes = ['z', 'z', 'Z'];
  for (let i = 0; i < 3; i++) {
    const show = (frame + i) % 4 < 3;
    if (show) {
      ctx.fillText(sizes[i], x + i * 10, y + offsets[i] - i * 4);
    }
  }
}

export function drawFoodSmall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const sz = 4;
  ctx.fillStyle = COLORS[9];
  ctx.fillRect(x, y, sz * 4, sz * 3);
  ctx.fillStyle = COLORS[10];
  ctx.fillRect(x - sz, y + sz * 3, sz, sz);
  ctx.fillRect(x + sz * 4, y + sz * 3, sz, sz);
  ctx.fillRect(x, y + sz * 3, sz * 4, sz);
}

export function drawHearts(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.fillStyle = '#ff6688';
  ctx.font = '16px sans-serif';
  for (let i = 0; i < 3; i++) {
    const phase = (frame + i * 8) % 24;
    const hx = x + Math.sin(phase * 0.5) * 15 + i * 20;
    const hy = y - phase * 2;
    if (phase < 20) {
      ctx.globalAlpha = 1 - phase / 24;
      ctx.fillText('❤', hx, hy);
    }
  }
  ctx.globalAlpha = 1;
}

export function drawMiniCharacter(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  x: number,
  y: number,
  size: number,
) {
  const grid = layer.length;
  const scale = size / grid;
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < layer[row].length; col++) {
      const val = layer[row][col];
      if (val === 0 || val === '') continue;
      ctx.fillStyle = val as string;
      ctx.fillRect(x + col * scale, y + row * scale, Math.ceil(scale), Math.ceil(scale));
    }
  }
}

// ===== 배경 그리기 =====

// 산책 배경 (들판 + 나무)
export function drawWalkBackground(ctx: CanvasRenderingContext2D, tick: number) {
  // 하늘
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // 구름 (흘러가는)
  ctx.fillStyle = '#FFFFFF';
  const cloudX = (tick * 0.3) % (CANVAS_W + 60) - 60;
  ctx.beginPath(); ctx.ellipse(cloudX, 30, 30, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cloudX + 25, 24, 22, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cloudX + 150, 50, 25, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cloudX + 170, 44, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
  // 들판
  ctx.fillStyle = '#7DC95E';
  ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
  ctx.fillStyle = '#5AAA3A';
  ctx.fillRect(0, CANVAS_H - 28, CANVAS_W, 28);
  // 나무들
  const trees = [20, 80, 160, 210];
  trees.forEach(tx => {
    // 나무 기둥
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(tx + 8, CANVAS_H - 70, 8, 32);
    // 나무 잎
    ctx.fillStyle = '#2D8A2D';
    ctx.beginPath(); ctx.arc(tx + 12, CANVAS_H - 78, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3DAA3D';
    ctx.beginPath(); ctx.arc(tx + 6, CANVAS_H - 72, 14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(tx + 20, CANVAS_H - 72, 13, 0, Math.PI * 2); ctx.fill();
  });
  // 꽃
  const flowers = [40, 100, 130, 180, 230];
  flowers.forEach(fx => {
    ctx.fillStyle = '#FF88AA';
    ctx.beginPath(); ctx.arc(fx, CANVAS_H - 32, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFDD00';
    ctx.beginPath(); ctx.arc(fx, CANVAS_H - 32, 2, 0, Math.PI * 2); ctx.fill();
  });
}

// 여행 배경 (바다)
export function drawTravelBackground(ctx: CanvasRenderingContext2D, tick: number) {
  // 하늘
  ctx.fillStyle = '#4FC3F7';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // 태양
  ctx.fillStyle = '#FFD700';
  ctx.beginPath(); ctx.arc(CANVAS_W - 40, 35, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF176';
  ctx.beginPath(); ctx.arc(CANVAS_W - 40, 35, 16, 0, Math.PI * 2); ctx.fill();
  // 구름
  ctx.fillStyle = '#FFFFFF';
  const cx = (tick * 0.2) % (CANVAS_W + 60) - 30;
  ctx.beginPath(); ctx.ellipse(cx, 45, 28, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 22, 40, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
  // 바다 (파도)
  const waveY = CANVAS_H - 50;
  ctx.fillStyle = '#0288D1';
  ctx.fillRect(0, waveY, CANVAS_W, CANVAS_H - waveY);
  ctx.fillStyle = '#29B6F6';
  ctx.fillRect(0, waveY + 10, CANVAS_W, CANVAS_H - waveY - 10);
  // 파도 라인
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < CANVAS_W; x += 4) {
    const y = waveY + 4 + Math.sin((x + tick * 3) * 0.08) * 4;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  // 모래
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(0, CANVAS_H - 28, CANVAS_W, 28);
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(0, CANVAS_H - 16, CANVAS_W, 16);
  // 야자수
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(15, CANVAS_H - 80, 7, 54);
  ctx.fillStyle = '#2D8A2D';
  // 야자수 잎
  [[15, -85, -20], [22, -82, 20], [10, -88, -40], [28, -78, 40]].forEach(([lx, ly, rot]) => {
    ctx.save();
    ctx.translate(18, CANVAS_H + ly);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.fillRect(-2, 0, 4, -24);
    ctx.restore();
  });
  // 불가사리
  ctx.fillStyle = '#FF7043';
  ctx.beginPath(); ctx.arc(CANVAS_W - 30, CANVAS_H - 20, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FF8A65';
  ctx.beginPath(); ctx.arc(CANVAS_W - 30, CANVAS_H - 20, 4, 0, Math.PI * 2); ctx.fill();
}

// 목욕 배경 (욕실)
export function drawBathBackground(ctx: CanvasRenderingContext2D, tick: number) {
  // 욕실 타일 배경
  ctx.fillStyle = '#E3F2FD';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // 타일 패턴
  ctx.strokeStyle = '#B0C4DE';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
  // 욕조
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(20, CANVAS_H - 55, CANVAS_W - 40, 45, 12);
  ctx.fill();
  ctx.strokeStyle = '#90CAF9'; ctx.lineWidth = 2;
  ctx.stroke();
  // 물 (찰랑거림)
  ctx.fillStyle = `rgba(100, 181, 246, 0.5)`;
  ctx.beginPath();
  ctx.moveTo(22, CANVAS_H - 30);
  for (let x = 22; x < CANVAS_W - 22; x += 4) {
    const y = CANVAS_H - 30 + Math.sin((x + tick * 4) * 0.15) * 3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CANVAS_W - 22, CANVAS_H - 14);
  ctx.lineTo(22, CANVAS_H - 14);
  ctx.fill();
  // 샤워타월 (바닥)
  ctx.fillStyle = '#FF8A80';
  ctx.fillRect(CANVAS_W - 55, CANVAS_H - 18, 36, 12);
  ctx.fillStyle = '#FF5252';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(CANVAS_W - 54 + i * 9, CANVAS_H - 18, 6, 12);
  }
  // 거품들
  const bubbles = [[40,80],[70,60],[120,70],[160,65],[200,75],[80,50],[140,55]];
  bubbles.forEach(([bx, by], i) => {
    const alpha = 0.4 + Math.sin((tick * 0.05) + i) * 0.2;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath(); ctx.arc(bx, by, 6 + i % 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(100,181,246,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// 목욕 중 머리 거품 오버레이
export function drawBathFoam(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number) {
  const foamColors = ['#FFFFFF', '#E3F2FD', '#BBDEFB'];
  const foamPositions = [[-4,-8],[4,-10],[0,-14],[-8,-6],[8,-6],[-2,-18],[6,-16]];
  foamPositions.forEach(([fx, fy], i) => {
    ctx.fillStyle = foamColors[i % foamColors.length];
    const r = 5 + Math.sin(tick * 0.1 + i) * 2;
    ctx.beginPath();
    ctx.arc(x + SPRITE_PX/2 + fx, y + fy, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 더러움 효과 오버레이 — cleanliness가 낮을수록 얼룩 많아짐
export function drawDirtyEffect(ctx: CanvasRenderingContext2D, x: number, y: number, cleanliness: number) {
  if (cleanliness >= 70) return; // 70 이상이면 깨끗

  const dirtyLevel = (70 - cleanliness) / 70; // 0~1
  const spots = Math.floor(dirtyLevel * 8) + 1;

  // 얼룩 점들 (고정 위치, 더러울수록 많아짐)
  const spotPositions = [
    [18, 30], [48, 20], [30, 50], [60, 35], [10, 55],
    [70, 55], [40, 15], [55, 45],
  ];

  for (let i = 0; i < spots; i++) {
    const [sx, sy] = spotPositions[i];
    const alpha = 0.3 + dirtyLevel * 0.4;
    ctx.fillStyle = `rgba(100, 70, 30, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x + sx, y + sy, 3 + i % 3, 2 + i % 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 30 이하면 파리 한 마리 (tick으로 날아다님)
  if (cleanliness < 30) {
    ctx.fillStyle = 'rgba(50,50,50,0.8)';
    ctx.font = '10px sans-serif';
    ctx.fillText('🪰', x + 50, y + 8);
  }
}

export { SPRITE_PX, PIXEL_SIZE };

// 놀이터 배경 (모래밭 + 미끄럼틀 + 그네)
export function drawPlaygroundBackground(ctx: CanvasRenderingContext2D, tick: number) {
  // 하늘 (따뜻한 낮)
  ctx.fillStyle = '#FFE4B5';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // 구름
  ctx.fillStyle = '#FFFACD';
  const cx1 = ((tick * 0.2) % (CANVAS_W + 80)) - 40;
  ctx.beginPath(); ctx.ellipse(cx1, 25, 28, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx1 + 22, 20, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx1 + 160, 40, 22, 11, 0, 0, Math.PI * 2); ctx.fill();

  // 잔디
  ctx.fillStyle = '#7DC95E';
  ctx.fillRect(0, CANVAS_H - 55, CANVAS_W, 55);
  ctx.fillStyle = '#5AAA3A';
  ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);

  // 모래밭 (중앙 타원)
  ctx.fillStyle = '#F4D580';
  ctx.beginPath();
  ctx.ellipse(CANVAS_W / 2, CANVAS_H - 22, 90, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E8C055';
  ctx.beginPath();
  ctx.ellipse(CANVAS_W / 2, CANVAS_H - 18, 85, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // 모래 질감 점들
  ctx.fillStyle = '#D4A830';
  for (let i = 0; i < 18; i++) {
    const sx = CANVAS_W / 2 - 70 + (i * 8.5) + Math.sin(i * 2.3) * 6;
    const sy = CANVAS_H - 22 + Math.cos(i * 1.7) * 8;
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // 미끄럼틀 (오른쪽)
  const slideX = CANVAS_W - 75;
  const slideY = CANVAS_H - 50;
  ctx.fillStyle = '#CC4444';
  ctx.fillRect(slideX + 30, slideY - 45, 6, 45);
  ctx.fillStyle = '#DD5555';
  ctx.fillRect(slideX + 26, slideY - 44, 12, 4);
  ctx.fillRect(slideX + 26, slideY - 54, 12, 4);
  ctx.fillRect(slideX + 26, slideY - 64, 12, 4);
  ctx.fillStyle = '#FF8844';
  ctx.beginPath();
  ctx.moveTo(slideX + 33, slideY - 67);
  ctx.lineTo(slideX + 62, slideY - 8);
  ctx.lineTo(slideX + 55, slideY - 8);
  ctx.lineTo(slideX + 26, slideY - 67);
  ctx.fill();

  // 그네 (왼쪽)
  const swingX = 40;
  const swingY = CANVAS_H - 55;
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(swingX, swingY - 45, 5, 45);
  ctx.fillRect(swingX + 30, swingY - 45, 5, 45);
  ctx.fillRect(swingX - 2, swingY - 48, 39, 5);
  // 흔들리는 그네 줄
  const swingOffX = Math.sin(tick * 0.04) * 12;
  const swingOffY = Math.abs(Math.cos(tick * 0.04)) * 5;
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(swingX + 8, swingY - 43);
  ctx.lineTo(swingX + 8 + swingOffX, swingY - 22 + swingOffY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(swingX + 27, swingY - 43);
  ctx.lineTo(swingX + 27 + swingOffX, swingY - 22 + swingOffY);
  ctx.stroke();
  ctx.fillStyle = '#AA7733';
  ctx.fillRect(swingX + 6 + swingOffX, swingY - 22 + swingOffY, 23, 4);
}
