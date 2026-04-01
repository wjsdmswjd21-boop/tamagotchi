// 스프라이트 시스템
// baseChar가 산리오면 고정 픽셀, 'custom'이면 파츠 조합 렌더링
import { Phenotype } from './genetics';

export type SpriteFrame = number[][];
export type AnimState = 'idle' | 'walk_right' | 'walk_left' | 'eat' | 'happy' | 'sleep' | 'sad';
type Layer = (string | 0)[][];

export const COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#5c5c5c', 2: '#1a1a1a', 3: '#ff9999', 4: '#ff6666', 5: '#ffffff',
  6: '#888888', 7: '#f0e6d3', 8: '#d4c5a9', 9: '#8B4513', 10: '#fff8dc',
  11: '#8B6914', 12: '#6B4F12', 13: '#aaddaa',
};

const _ = null;
const KK = '#1A1A1A', W = '#FFFFFF';

// =============================================
// 산리오 고정 픽셀 데이터 (1세대)
// =============================================
const KPK='#FFCCDD', KR='#EE0022', Ksk='#FFE8EE', Kky='#FFDD00';
const KITTY_PX: (string|null)[][] = [
  [_,_,W,W,_,_,_,_,_,_,_,_,W,W,_,_],
  [_,W,W,W,W,_,_,_,_,_,_,W,W,W,W,_],
  [_,W,W,KPK,W,_,_,_,_,_,W,KPK,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,KR,KR,W,KR,W,KR,KR,W,W,W,_,_],
  [_,_,W,W,KR,W,KR,KR,KR,W,KR,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,KK,KK,W,W,W,W,W,KK,KK,W,W,_,_],
  [_,_,W,KK,W,W,W,W,W,W,KK,W,W,W,_,_],
  [_,_,W,W,W,W,W,Kky,W,W,W,W,W,W,_,_],
  [KK,KK,W,W,W,W,W,KK,W,W,W,W,W,KK,KK,KK],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [KK,KK,W,W,W,W,W,_,W,W,W,W,W,KK,KK,KK],
  [_,_,W,W,Ksk,W,W,W,W,W,W,Ksk,W,W,_,_],
  [_,_,_,_,W,W,_,_,_,_,W,W,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const MP='#FFB3D4', mP='#FF99CC', mR='#EE0022', mB='#66AAFF', mb='#AACCFF', mG='#FFAACC';
const MELODY_PX: (string|null)[][] = [
  [_,_,MP,MP,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,MP,mP,MP,_,_,_,_,_,MP,MP,_,_,_,_,_],
  [_,MP,mP,MP,_,_,_,_,MP,mP,_,_,_,_,_,_],
  [_,_,MP,MP,_,_,_,_,_,MP,MP,_,_,_,_,_],
  [_,mB,mb,mB,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,MP,MP,MP,MP,MP,MP,MP,MP,MP,MP,_,_,_,_],
  [_,MP,MP,MP,MP,MP,MP,MP,MP,MP,MP,MP,MP,_,_,_],
  [_,MP,MP,KK,KK,MP,MP,MP,MP,KK,KK,MP,MP,_,_,_],
  [_,MP,MP,KK,W,MP,MP,MP,MP,KK,W,MP,MP,_,_,_],
  [_,mG,MP,MP,MP,MP,KK,MP,MP,MP,MP,MP,mG,_,_,_],
  [_,_,MP,MP,MP,KK,MP,MP,KK,MP,MP,MP,MP,_,_,_],
  [_,mR,mR,mR,mR,mR,mR,mR,mR,mR,mR,mR,mR,mR,_,_],
  [_,_,MP,MP,MP,MP,MP,MP,MP,MP,MP,MP,MP,_,_,_],
  [_,_,MP,mG,MP,MP,MP,MP,MP,MP,MP,mG,MP,_,_,_],
  [_,_,_,_,MP,MP,_,_,_,_,MP,MP,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const BK='#111122', kV='#9933CC', SK='#CC44FF';
const KUROMI_PX: (string|null)[][] = [
  [_,_,_,_,_,BK,BK,_,_,BK,BK,_,_,_,_,_],
  [_,_,_,_,_,BK,BK,_,_,BK,BK,_,_,_,_,_],
  [_,_,_,_,BK,BK,BK,_,BK,BK,BK,_,_,_,_,_],
  [_,_,_,_,BK,BK,BK,_,BK,BK,BK,_,_,_,_,_],
  [_,_,_,BK,BK,BK,BK,_,BK,BK,BK,BK,_,_,_,_],
  [_,_,BK,BK,BK,BK,BK,SK,SK,SK,BK,BK,BK,_,_,_],
  [_,BK,BK,W,W,W,W,SK,W,SK,W,W,BK,BK,_,_],
  [_,BK,BK,W,W,W,W,SK,SK,SK,W,W,BK,BK,_,_],
  [_,BK,BK,W,KK,KK,W,W,W,KK,KK,W,BK,BK,_,_],
  [_,BK,BK,W,KK,W,W,W,W,KK,W,W,BK,BK,_,_],
  [_,BK,BK,W,W,KK,W,W,W,W,KK,W,BK,BK,_,_],
  [_,BK,BK,W,W,W,KK,KK,KK,W,W,W,BK,BK,_,_],
  [_,_,BK,BK,BK,BK,BK,BK,BK,BK,BK,BK,BK,_,_,_],
  [_,_,BK,kV,BK,BK,BK,BK,BK,BK,BK,kV,BK,_,_,_],
  [_,_,_,_,BK,BK,_,_,_,BK,BK,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const pY='#FFE044', py='#FFF4AA', pO='#FF9922', pG='#33AA55', pg='#77CC88', pC='#FFAA88';
const PURIN_PX: (string|null)[][] = [
  [_,pY,pC,pY,_,_,_,_,_,_,_,pY,pC,pY,_,_],
  [pY,pC,pY,pY,_,_,_,_,_,_,pY,pY,pC,pY,_,_],
  [_,_,pG,pG,pG,pG,pG,pG,pG,pG,pG,pG,_,_,_,_],
  [_,pG,pg,pg,pg,pg,pG,pg,pg,pg,pg,pg,pG,_,_,_],
  [_,_,pG,pG,pG,pg,pg,pg,pg,pG,pG,pG,_,_,_,_],
  [pY,pC,_,pY,pY,pY,pY,pY,pY,pY,pY,pY,_,pC,pY,_],
  [pY,pC,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pC,pY,_],
  [_,pY,pY,KK,KK,pY,pY,pY,pY,KK,KK,pY,pY,pY,_,_],
  [_,pY,pY,pY,KK,pY,pY,pY,pY,KK,pY,pY,pY,pY,_,_],
  [_,pC,pY,pY,pY,pO,pY,pY,pO,pY,pY,pY,pC,pY,_,_],
  [_,_,pY,pY,KK,pY,pY,pY,pY,KK,pY,pY,pY,_,_,_],
  [_,pY,pC,pY,pY,pY,pY,pY,pY,pY,pY,pY,pC,pY,_,_],
  [_,_,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,_,_,_],
  [_,_,pY,py,pY,pY,pY,pY,pY,pY,pY,py,pY,_,_,_],
  [_,_,_,_,pY,pY,_,_,_,_,pY,pY,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const TB='#C45A00', tl='#E07020', td='#8B3A00';
const SC='#5C2A00', sc='#6B3300', sl='#7A3D00';
const MO='#88CC00', KT='#FF6644', PK2='#FF99BB', MPx='#FF88AA';
const TAKO_PX: (string|null)[][] = [
  [_,_,_,_,_,SC,_,SC,SC,_,SC,_,_,_,_,_],
  [_,_,_,_,sc,sc,_,sc,sc,sc,_,sl,_,_,_,_],
  [_,_,_,_,TB,tl,tl,tl,tl,tl,TB,_,_,_,_,_],
  [_,_,_,TB,tl,tl,tl,tl,tl,tl,tl,TB,_,_,_,_],
  [_,_,TB,tl,SC,tl,MO,MO,MO,tl,SC,tl,TB,_,_,_],
  [_,_,TB,tl,tl,SC,tl,tl,tl,SC,tl,tl,TB,_,_,_],
  [_,_,TB,tl,KK,KK,tl,tl,tl,KK,KK,tl,TB,_,_,_],
  [_,_,TB,tl,KK,W,tl,tl,tl,KK,W,tl,TB,_,_,_],
  [_,_,TB,PK2,tl,tl,tl,tl,tl,tl,tl,PK2,TB,_,_,_],
  [_,_,TB,tl,MPx,tl,MPx,MPx,tl,tl,MPx,tl,TB,_,_,_],
  [_,_,TB,tl,tl,tl,tl,MPx,tl,tl,tl,tl,TB,_,_,_],
  [_,_,TB,tl,tl,tl,MPx,MPx,tl,tl,tl,tl,TB,_,_,_],
  [_,_,TB,tl,KT,tl,tl,tl,tl,KT,tl,tl,TB,_,_,_],
  [_,_,_,TB,td,td,td,td,td,td,td,TB,_,_,_,_],
  [_,_,_,_,TB,TB,td,td,td,TB,TB,_,_,_,_,_],
  [_,_,_,_,TB,TB,_,_,_,TB,TB,_,_,_,_,_],
];

function pixelsToLayer(px: (string|null)[][]): Layer {
  return px.map(row => row.map(v => v ?? 0)) as Layer;
}

// ── NINJA 32x32 — 검정 닌자 복장, 눈만 보임 ──
const NJ='#111122', nw='#FFFFFF', nb='#222244', nr='#EE2222';
const NINJA_PX: (string|null)[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,NJ,NJ,NJ,NJ,NJ,NJ,_,_,_,_,_],
  [_,_,_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_,_,_],
  [_,_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_,_],
  [_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_],
  [_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_],
  // 눈만 빼꼼
  [_,_,NJ,NJ,NJ,nw,nw,NJ,NJ,nw,nw,NJ,NJ,NJ,_,_],
  [_,_,NJ,NJ,NJ,nw,KK,NJ,NJ,nw,KK,NJ,NJ,NJ,_,_],
  [_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_],
  [_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_],
  [_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_],
  [_,_,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,NJ,_,_],
  // 몸통
  [_,_,_,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,_,_,_],
  [_,_,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,_,_],
  [_,_,nb,nb,nr,nb,nb,nb,nb,nb,nb,nr,nb,nb,_,_],
  [_,_,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,_,_],
  [_,_,_,nb,nb,nb,nb,nb,nb,nb,nb,nb,nb,_,_,_],
  [_,_,_,_,nb,nb,nb,nb,nb,nb,nb,nb,_,_,_,_],
  [_,_,_,_,nb,nb,_,_,_,_,nb,nb,_,_,_,_],
  [_,_,_,_,nb,nb,_,_,_,_,nb,nb,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── SHEEP — 흰 양털 머리, 분홍 얼굴, 뿔 ──
const SW='#F0F0F0', sf='#FFD0C0', shc='#FFAACC', sh='#CCBBAA';
const SHEEP_PX: (string|null)[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  // 양털 귀
  [_,SW,SW,SW,_,_,_,_,_,_,_,_,SW,SW,SW,_],
  [SW,SW,SW,SW,SW,_,_,_,_,_,_,SW,SW,SW,SW,SW],
  // 양털 머리
  [_,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,_,_],
  [SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,SW,_],
  [SW,SW,sf,sf,sf,sf,sf,sf,sf,sf,sf,sf,SW,SW,SW,_],
  // 얼굴 (분홍)
  [_,SW,sf,sf,sf,sf,sf,sf,sf,sf,sf,sf,sf,SW,_,_],
  // 눈
  [_,SW,sf,KK,KK,sf,sf,sf,sf,KK,KK,sf,sf,SW,_,_],
  [_,SW,sf,KK,W,sf,sf,sf,sf,KK,W,sf,sf,SW,_,_],
  // 볼터치
  [_,shc,sf,sf,sf,sf,sf,sf,sf,sf,sf,sf,shc,SW,_,_],
  // 스마일
  [_,SW,sf,sf,KK,sf,sf,sf,sf,KK,sf,sf,sf,SW,_,_],
  [_,SW,sf,sf,sf,KK,KK,KK,KK,sf,sf,sf,sf,SW,_,_],
  // 몸
  [_,_,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,_,_,_],
  [_,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,_,_],
  [_,sh,sh,SW,sh,sh,sh,sh,sh,sh,sh,SW,sh,sh,_,_],
  [_,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,_,_],
  [_,_,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,sh,_,_,_],
  [_,_,_,_,sh,sh,sh,sh,sh,sh,sh,sh,_,_,_,_],
  [_,_,_,_,sh,sh,_,_,_,_,sh,sh,_,_,_,_],
  [_,_,_,_,sh,sh,_,_,_,_,sh,sh,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── CHERRY — 빨간 체리, 초록 꼭지 ──
const CR='#DD1122', cr='#FF4455', cg='#33AA44', cw=W;
const CHERRY_PX: (string|null)[][] = [
  // 꼭지 + 잎
  [_,_,_,_,_,_,cg,cg,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,cg,cg,cg,cg,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,cg,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,cg,_,_,_,_,_,_,_,_,_],
  // 체리 몸
  [_,_,_,_,_,CR,CR,CR,CR,CR,_,_,_,_,_,_],
  [_,_,_,_,CR,CR,cr,CR,CR,CR,CR,_,_,_,_,_],
  [_,_,_,CR,CR,CR,cr,cw,CR,CR,CR,CR,_,_,_,_],
  // 눈 (큰 동그란)
  [_,_,_,CR,CR,KK,KK,CR,CR,KK,KK,CR,_,_,_,_],
  [_,_,_,CR,CR,KK,cw,CR,CR,KK,cw,CR,_,_,_,_],
  // 볼 + 입
  [_,_,'#FF99AA',CR,CR,CR,CR,CR,CR,CR,CR,'#FF99AA',_,_,_,_],
  [_,_,_,CR,CR,KK,CR,CR,KK,KK,CR,CR,_,_,_,_],
  [_,_,_,CR,CR,CR,KK,KK,CR,CR,CR,CR,_,_,_,_],
  [_,_,_,_,CR,CR,CR,CR,CR,CR,CR,_,_,_,_,_],
  // 치마 (초록 잎 모양 치마)
  [_,_,_,_,cg,cg,cg,cg,cg,cg,_,_,_,_,_,_],
  [_,_,_,cg,cg,cg,cg,cg,cg,cg,cg,_,_,_,_,_],
  [_,_,cg,cg,cg,cg,cg,cg,cg,cg,cg,cg,_,_,_,_],
  [_,_,_,_,_,cg,cg,_,cg,cg,_,_,_,_,_,_],
  [_,_,_,_,_,cg,cg,_,cg,cg,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── SUSHI — 초밥 몸, 해조 머리띠, 연어 볼 ──
const SS='#F8F8F8', sr='#FF8866', sg='#228833', sy='#FFEE44', ss2='#F8F8F8';
const SUSHI_PX: (string|null)[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,sg,sg,sg,sg,sg,sg,sg,sg,_,_,_,_],
  [_,_,_,sg,sg,sg,sg,sg,sg,sg,sg,sg,sg,_,_,_],
  // 밥 머리
  [_,_,_,_,SS,SS,SS,SS,SS,SS,SS,SS,_,_,_,_],
  [_,_,_,SS,SS,SS,SS,SS,SS,SS,SS,SS,SS,_,_,_],
  [_,_,SS,SS,SS,SS,SS,SS,SS,SS,SS,SS,SS,SS,_,_],
  // 눈
  [_,_,SS,SS,KK,KK,SS,SS,SS,KK,KK,SS,SS,SS,_,_],
  [_,_,SS,SS,KK,W,SS,SS,SS,KK,W,SS,SS,SS,_,_],
  // 연어 볼터치
  [_,_,sr,SS,SS,SS,SS,SS,SS,SS,SS,SS,sr,SS,_,_],
  // 입
  [_,_,SS,SS,SS,KK,SS,SS,KK,KK,SS,SS,SS,SS,_,_],
  [_,_,SS,SS,SS,SS,KK,KK,SS,SS,SS,SS,SS,SS,_,_],
  [_,_,_,SS,SS,SS,SS,SS,SS,SS,SS,SS,SS,_,_,_],
  // 김(해조) 몸통
  [_,_,_,sg,sg,sg,sg,sg,sg,sg,sg,sg,sg,_,_,_],
  [_,_,sg,sg,ss2,ss2,ss2,ss2,ss2,ss2,ss2,ss2,sg,sg,_,_],
  [_,_,sg,sg,ss2,ss2,ss2,ss2,ss2,ss2,ss2,ss2,sg,sg,_,_],
  [_,_,sg,sg,ss2,sy,ss2,ss2,ss2,sy,ss2,ss2,sg,sg,_,_],
  [_,_,_,sg,sg,sg,sg,sg,sg,sg,sg,sg,sg,_,_,_],
  [_,_,_,_,sg,sg,sg,sg,sg,sg,sg,sg,_,_,_,_],
  [_,_,_,_,sg,sg,_,_,_,_,sg,sg,_,_,_,_],
  [_,_,_,_,sg,sg,_,_,_,_,sg,sg,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];
// ── ICECREAM — 아이스크림 콘 머리, 알록달록 ──
const IC='#FFB3D4', ic='#FF88AA', iy='#FFE066', ig='#88CC88', ib='#88BBFF';
const ICECREAM_PX: (string|null)[][] = [
  // 아이스크림 스쿱 (머리)
  [_,_,_,_,_,iy,iy,iy,iy,iy,_,_,_,_,_,_],
  [_,_,_,_,iy,iy,ig,iy,iy,iy,iy,_,_,_,_,_],
  [_,_,_,iy,iy,ig,iy,iy,ig,iy,iy,iy,_,_,_,_],
  [_,_,_,iy,iy,iy,iy,iy,iy,iy,iy,iy,_,_,_,_],
  [_,_,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,_,_,_],
  [_,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,_,_],
  // 눈
  [_,IC,IC,KK,KK,IC,IC,IC,IC,KK,KK,IC,IC,IC,_,_],
  [_,IC,IC,KK,W,IC,IC,IC,IC,KK,W,IC,IC,IC,_,_],
  // 볼 + 입
  [_,ic,IC,IC,IC,IC,IC,IC,IC,IC,IC,IC,ic,IC,_,_],
  [_,_,IC,IC,KK,IC,IC,IC,KK,KK,IC,IC,IC,_,_,_],
  [_,_,IC,IC,IC,KK,KK,KK,IC,IC,IC,IC,_,_,_,_],
  [_,_,_,IC,IC,IC,IC,IC,IC,IC,IC,IC,_,_,_,_],
  // 콘 (몸통)
  [_,_,_,_,ib,ib,ib,ib,ib,ib,ib,_,_,_,_,_],
  [_,_,_,_,_,ib,ib,ib,ib,ib,_,_,_,_,_,_],
  [_,_,_,_,_,_,ib,ib,ib,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,ib,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── ROBOT — 네모 로봇 머리, 안테나, 노란 몸 ──
const RB='#FFEE44', rb='#EEDD33', rg='#888888', rr='#EE2222', rl='#44AAFF';
const ROBOT_PX: (string|null)[][] = [
  // 안테나
  [_,_,_,_,_,_,_,rg,rg,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,rr,rg,_,_,_,_,_,_,_],
  // 네모 머리
  [_,_,_,rg,rg,rg,rg,rg,rg,rg,rg,rg,rg,_,_,_],
  [_,_,rg,RB,RB,RB,RB,RB,RB,RB,RB,RB,RB,rg,_,_],
  [_,_,rg,RB,RB,RB,RB,RB,RB,RB,RB,RB,RB,rg,_,_],
  // 눈 (LED 스타일)
  [_,_,rg,RB,rl,rl,rl,RB,RB,rl,rl,rl,RB,rg,_,_],
  [_,_,rg,RB,rl,W,rl,RB,RB,rl,W,rl,RB,rg,_,_],
  [_,_,rg,RB,rl,rl,rl,RB,RB,rl,rl,rl,RB,rg,_,_],
  // 입 (버튼식)
  [_,_,rg,RB,RB,rr,rr,rr,rr,rr,RB,RB,RB,rg,_,_],
  [_,_,rg,RB,RB,RB,RB,RB,RB,RB,RB,RB,RB,rg,_,_],
  [_,_,_,rg,rg,rg,rg,rg,rg,rg,rg,rg,rg,_,_,_],
  // 몸통
  [_,_,_,rg,RB,RB,RB,RB,RB,RB,RB,RB,rg,_,_,_],
  [_,_,rg,RB,RB,RB,RB,RB,RB,RB,RB,RB,RB,rg,_,_],
  [_,_,rg,RB,rr,RB,RB,RB,RB,RB,rr,RB,RB,rg,_,_],
  [_,_,rg,RB,RB,RB,RB,RB,RB,RB,RB,RB,RB,rg,_,_],
  [_,_,_,rg,rg,rg,rg,rg,rg,rg,rg,rg,rg,_,_,_],
  [_,_,_,_,rg,rg,_,_,_,_,rg,rg,_,_,_,_],
  [_,_,_,_,rg,rg,_,_,_,_,rg,rg,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// =============================================
// 파츠 조합 렌더링 (2세대 이후 custom)
// =============================================
const BODY_BASE: Record<string, string> = {
  white:'#F8F8F8', pink:'#FFB3D4', black:'#222244',
  yellow:'#FFE044', purple:'#C9B8E8', brown:'#C45A00',
};
const BODY_SHADOW: Record<string, string> = {
  white:'#DCDCDC', pink:'#F097B0', black:'#111122',
  yellow:'#F0C040', purple:'#A897CC', brown:'#8B3A00',
};
const BODY_HIGHLIGHT: Record<string, string> = {
  white:'#FFFFFF', pink:'#FFD6E4', black:'#333366',
  yellow:'#FFF4AA', purple:'#E2D8F5', brown:'#E07020',
};
const BODY_MASKS: Record<string, number[][]> = {
  round: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  tall: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  chubby: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

function empty16(): Layer {
  return Array.from({length:16}, () => Array(16).fill(0));
}

function drawBody(pheno: Phenotype): Layer {
  const mask = BODY_MASKS[pheno.bodyShape] || BODY_MASKS.round;
  const base = BODY_BASE[pheno.bodyColor] || BODY_BASE.white;
  const shadow = BODY_SHADOW[pheno.bodyColor] || BODY_SHADOW.white;
  const highlight = BODY_HIGHLIGHT[pheno.bodyColor] || BODY_HIGHLIGHT.white;
  const layer = empty16();
  for (let r=0;r<16;r++) for (let c=0;c<16;c++) {
    if (!mask[r][c]) continue;
    layer[r][c] = (r<=3&&c<=6) ? highlight : (r>=9||c>=11) ? shadow : base;
  }
  return layer;
}

function drawEars(pheno: Phenotype): Layer {
  const layer = empty16();
  const bc = BODY_BASE[pheno.bodyColor] || W;
  switch (pheno.earType) {
    case 'kitty':
      layer[0][2]=bc; layer[0][3]=bc; layer[1][2]=bc; layer[1][3]=bc; layer[1][4]=bc;
      layer[0][11]=bc; layer[0][12]=bc; layer[1][10]=bc; layer[1][11]=bc; layer[1][12]=bc;
      layer[1][3]='#FFB3C6'; layer[1][11]='#FFB3C6';
      break;
    case 'melody':
      layer[0][3]='#FFB3D4'; layer[0][4]='#FFB3D4';
      layer[1][2]='#FFB3D4'; layer[1][3]='#FF99CC'; layer[1][4]='#FFB3D4';
      layer[2][2]='#FFB3D4'; layer[2][3]='#FF99CC'; layer[2][4]='#FFB3D4';
      layer[1][11]='#FFB3D4'; layer[1][12]='#FFB3D4';
      layer[2][10]='#FFB3D4'; layer[2][11]='#FF99CC';
      layer[0][2]='#66AAFF'; layer[0][3]='#AACCFF'; layer[0][4]='#66AAFF';
      break;
    case 'kuromi':
      layer[0][5]=BK; layer[0][6]=BK; layer[0][9]=BK; layer[0][10]=BK;
      layer[1][5]=BK; layer[1][6]=BK; layer[1][9]=BK; layer[1][10]=BK;
      layer[2][4]=BK; layer[2][5]=BK; layer[2][6]=BK; layer[2][9]=BK; layer[2][10]=BK; layer[2][11]=BK;
      layer[3][4]=BK; layer[3][5]=BK; layer[3][6]=BK; layer[3][9]=BK; layer[3][10]=BK; layer[3][11]=BK;
      break;
    case 'purin':
      layer[1][1]='#FFAA88'; layer[1][2]=pY; layer[1][3]=pY;
      layer[2][0]='#FFAA88'; layer[2][1]=pY; layer[2][2]=pY;
      layer[3][0]='#FFAA88'; layer[3][1]=pY;
      layer[1][12]=pY; layer[1][13]=pY; layer[1][14]='#FFAA88';
      layer[2][13]=pY; layer[2][14]=pY; layer[2][15]='#FFAA88';
      layer[3][14]=pY; layer[3][15]='#FFAA88';
      break;
  }
  return layer;
}

function drawEyes(pheno: Phenotype): Layer {
  const layer = empty16();
  const er = pheno.bodyShape === 'tall' ? 4 : 5;
  switch (pheno.eyeType) {
    case 'kitty': case 'takoyaki':
    default:
      // 귀여운 동그란 눈 (3x3 + 반짝이)
      layer[er][3]=KK;   layer[er][4]=KK;   layer[er][5]=KK;
      layer[er+1][3]=KK; layer[er+1][4]=W;  layer[er+1][5]=KK;
      layer[er+2][3]=KK; layer[er+2][4]=KK; layer[er+2][5]=KK;
      layer[er][9]=KK;   layer[er][10]=KK;   layer[er][11]=KK;
      layer[er+1][9]=KK; layer[er+1][10]=W;  layer[er+1][11]=KK;
      layer[er+2][9]=KK; layer[er+2][10]=KK; layer[er+2][11]=KK;
      // 반짝이
      layer[er][4]=W; layer[er][10]=W;
      break;
    case 'kuromi':
      // 날카롭고 개성있는 눈
      layer[er][3]=KK;   layer[er][4]=KK;   layer[er][5]=KK;   layer[er][6]=KK;
      layer[er+1][3]=KK; layer[er+1][4]=W;  layer[er+1][5]=KK; layer[er+1][6]=KK;
      layer[er+2][4]=KK; layer[er+2][5]=KK;
      layer[er][8]=KK;   layer[er][9]=KK;   layer[er][10]=KK;  layer[er][11]=KK;
      layer[er+1][8]=KK; layer[er+1][9]=KK; layer[er+1][10]=W; layer[er+1][11]=KK;
      layer[er+2][9]=KK; layer[er+2][10]=KK;
      break;
    case 'purin':
      // 반달 눈 (초승달, 귀엽게)
      layer[er][3]=KK;   layer[er][4]=KK;   layer[er][5]=KK;
      layer[er+1][3]=W;  layer[er+1][4]=KK; layer[er+1][5]=KK;
      layer[er+2][4]=KK; layer[er+2][5]=KK;
      layer[er][9]=KK;   layer[er][10]=KK;  layer[er][11]=KK;
      layer[er+1][9]=W;  layer[er+1][10]=KK; layer[er+1][11]=KK;
      layer[er+2][10]=KK; layer[er+2][11]=KK;
      break;
  }
  return layer;
}

function drawMouth(pheno: Phenotype): Layer {
  const layer = empty16();
  const mr = pheno.bodyShape === 'tall' ? 7 : 8;
  const M = '#FF88AA';
  switch (pheno.mouthType) {
    case 'smile':
      layer[mr][6]=M; layer[mr][7]=M;
      layer[mr+1][5]=M; layer[mr+1][8]=M;
      break;
    case 'dot3':
      layer[mr][4]=M; layer[mr][6]=M; layer[mr][7]=M;
      layer[mr+1][7]=M;
      if (mr+2<16) { layer[mr+2][6]=M; layer[mr+2][7]=M; }
      layer[mr][10]=M;
      break;
    case 'pout':
      layer[mr][6]=M; layer[mr][7]=M; layer[mr][8]=M;
      layer[mr+1][6]='#CC5566'; layer[mr+1][7]='#CC5566'; layer[mr+1][8]='#CC5566';
      break;
    case 'kuromi':
      layer[mr][5]=KK; layer[mr][9]=KK;
      layer[mr+1][6]=KK; layer[mr+1][7]=KK; layer[mr+1][8]=KK;
      break;
  }
  return layer;
}

function drawCheeks(pheno: Phenotype): Layer {
  const layer = empty16();
  const cr = pheno.bodyShape === 'tall' ? 6 : 7;
  const c = pheno.bodyColor === 'pink' ? '#FF99BB' : '#FFBBCC';
  layer[cr][2]=c; layer[cr+1][2]=c; layer[cr][12]=c; layer[cr+1][12]=c;
  return layer;
}

function drawHeadpiece(pheno: Phenotype): Layer {
  const layer = empty16();
  switch (pheno.headpiece) {
    case 'ribbon':
      layer[0][5]='#FF3399'; layer[0][6]='#FF3399';
      layer[0][8]='#FF3399'; layer[0][9]='#FF3399';
      layer[1][7]='#FF66BB'; layer[0][7]='#FF99CC';
      break;
    case 'skullpin':
      layer[1][7]='#CC44FF'; layer[1][8]='#CC44FF'; layer[1][9]='#CC44FF';
      layer[2][7]='#CC44FF'; layer[2][8]=W; layer[2][9]='#CC44FF';
      break;
    case 'beret':
      layer[1][4]=pG; layer[1][5]=pG; layer[1][6]=pG; layer[1][7]=pG;
      layer[1][8]=pG; layer[1][9]=pG; layer[1][10]=pG;
      layer[2][3]=pg; layer[2][4]=pg; layer[2][5]=pG; layer[2][6]=pg;
      layer[2][7]=pG; layer[2][8]=pg; layer[2][9]=pG; layer[2][10]=pg; layer[2][11]=pg;
      break;
    case 'horn':
      layer[0][7]='#B3D9FF'; layer[0][8]='#B3D9FF'; layer[1][7]='#88BBFF';
      break;
  }
  return layer;
}

function drawWhiskers(pheno: Phenotype): Layer {
  const layer = empty16();
  if (pheno.whiskers !== 'yes') return layer;
  const wr = pheno.bodyShape === 'tall' ? 6 : 7;
  layer[wr][0]=KK; layer[wr][1]=KK; layer[wr+1][0]=KK; layer[wr+1][1]=KK;
  layer[wr][13]=KK; layer[wr][14]=KK; layer[wr][15]=KK;
  layer[wr+1][13]=KK; layer[wr+1][14]=KK; layer[wr+1][15]=KK;
  return layer;
}

function drawSauce(pheno: Phenotype): Layer {
  const layer = empty16();
  if (pheno.sauce !== 'yes') return layer;
  layer[0][5]='#5C2A00'; layer[0][7]='#5C2A00'; layer[0][9]='#5C2A00';
  layer[1][4]='#6B3300'; layer[1][6]='#6B3300'; layer[1][8]='#6B3300'; layer[1][10]='#6B3300';
  return layer;
}

function composeLayers(layers: Layer[]): Layer {
  const result = empty16();
  // 인덱스 0(body)부터 순서대로 그려서 나중 레이어(눈/귀/입)가 위에 덮임
  for (let i=0; i<layers.length; i++) {
    for (let r=0; r<16; r++) {
      for (let c=0; c<16; c++) {
        const v = layers[i][r][c];
        if (v !== 0 && v !== '') result[r][c] = v;
      }
    }
  }
  return result;
}

// =============================================
// 메인 빌드 함수
// =============================================
// 아기 단계: 다리 없고 얼굴만 — 부모 유전 형질(귀/눈/입/색) 반영
function buildBabyLayer(pheno: Phenotype): Layer {
  const bodyColor = BODY_BASE[pheno.bodyColor] || BODY_BASE.white;
  const shadow    = BODY_SHADOW[pheno.bodyColor] || BODY_SHADOW.white;
  const highlight = BODY_HIGHLIGHT[pheno.bodyColor] || BODY_HIGHLIGHT.white;

  // 아기 몸 마스크 (다리 없는 둥근 몸, 약간 더 통통)
  const babyMask = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  const layer = empty16();
  // 몸 채우기 (bodyColor 반영)
  for (let r=0;r<16;r++) for (let c=0;c<16;c++) {
    if (!babyMask[r][c]) continue;
    layer[r][c] = (r<=4&&c<=6) ? highlight : (r>=10||c>=12) ? shadow : bodyColor;
  }

  // ── 귀 (earType 유전자 반영) ──
  const earColor = BODY_BASE[pheno.bodyColor] || W;
  switch (pheno.earType) {
    case 'kitty':
      // 뾰족한 삼각 귀
      layer[1][2]=earColor; layer[1][3]=earColor;
      layer[2][2]=earColor; layer[2][3]=earColor; layer[2][4]=earColor;
      layer[1][11]=earColor; layer[1][12]=earColor;
      layer[2][10]=earColor; layer[2][11]=earColor; layer[2][12]=earColor;
      layer[2][3]='#FFB3C6'; layer[2][11]='#FFB3C6'; // 귀 안쪽 분홍
      break;
    case 'melody':
      // 크고 둥근 귀 (멜로디 스타일)
      layer[0][2]='#FFB3D4'; layer[0][3]='#FFB3D4'; layer[0][4]='#FFB3D4';
      layer[1][1]='#FFB3D4'; layer[1][2]='#FF99CC'; layer[1][3]='#FFB3D4'; layer[1][4]='#FFB3D4';
      layer[2][2]='#FFB3D4'; layer[2][3]='#FF99CC'; layer[2][4]='#FFB3D4';
      layer[0][11]='#FFB3D4'; layer[0][12]='#FFB3D4'; layer[0][13]='#FFB3D4';
      layer[1][11]='#FFB3D4'; layer[1][12]='#FF99CC'; layer[1][13]='#FFB3D4'; layer[1][14]='#FFB3D4';
      layer[2][11]='#FFB3D4'; layer[2][12]='#FF99CC'; layer[2][13]='#FFB3D4';
      // 블루 리본 장식
      layer[0][1]='#66AAFF'; layer[0][2]='#AACCFF';
      break;
    case 'kuromi':
      // 뾰족한 검정 귀 (쿠로미)
      layer[0][5]=BK; layer[0][6]=BK; layer[0][9]=BK; layer[0][10]=BK;
      layer[1][4]=BK; layer[1][5]=BK; layer[1][6]=BK; layer[1][9]=BK; layer[1][10]=BK; layer[1][11]=BK;
      layer[2][4]=BK; layer[2][5]=BK; layer[2][6]=BK; layer[2][9]=BK; layer[2][10]=BK; layer[2][11]=BK;
      layer[3][5]=BK; layer[3][6]=BK; layer[3][9]=BK; layer[3][10]=BK;
      break;
    case 'purin':
      // 옆으로 늘어진 귀 (푸린)
      layer[2][0]='#FFAA88'; layer[2][1]=pY; layer[2][2]=pY; layer[2][3]=pY;
      layer[3][0]='#FFAA88'; layer[3][1]=pY; layer[3][2]=pY;
      layer[4][0]='#FFAA88'; layer[4][1]=pY;
      layer[2][12]=pY; layer[2][13]=pY; layer[2][14]=pY; layer[2][15]='#FFAA88';
      layer[3][13]=pY; layer[3][14]=pY; layer[3][15]='#FFAA88';
      layer[4][14]=pY; layer[4][15]='#FFAA88';
      break;
    // 귀 없는 캐릭터들 (takoyaki, none 등): 귀 없이 그냥 둠
  }

  // ── 눈 (eyeType 유전자 반영) ──
  // 아기는 눈을 조금 더 크고 귀엽게
  switch (pheno.eyeType) {
    case 'kitty':
    case 'takoyaki':
    default:
      // 기본 동그란 눈
      layer[6][4]=KK; layer[6][5]=KK; layer[6][6]=KK;
      layer[7][4]=KK; layer[7][5]=W;  layer[7][6]=KK;
      layer[8][4]=KK; layer[8][5]=KK; layer[8][6]=KK;
      layer[6][9]=KK; layer[6][10]=KK; layer[6][11]=KK;
      layer[7][9]=KK; layer[7][10]=W;  layer[7][11]=KK;
      layer[8][9]=KK; layer[8][10]=KK; layer[8][11]=KK;
      break;
    case 'kuromi':
      // 가늘고 날카로운 눈
      layer[6][3]=KK; layer[6][4]=KK; layer[6][5]=KK; layer[6][6]=KK;
      layer[7][3]=KK; layer[7][4]=W;  layer[7][5]=KK; layer[7][6]=KK;
      layer[8][4]=KK; layer[8][5]=KK;
      layer[6][9]=KK; layer[6][10]=KK; layer[6][11]=KK; layer[6][12]=KK;
      layer[7][9]=KK; layer[7][10]=W;  layer[7][11]=KK; layer[7][12]=KK;
      layer[8][10]=KK; layer[8][11]=KK;
      break;
    case 'purin':
      // 반달 눈 (초승달 모양)
      layer[6][4]=KK; layer[6][5]=KK; layer[6][6]=KK;
      layer[7][4]=W;  layer[7][5]=KK; layer[7][6]=KK;
      layer[8][5]=KK; layer[8][6]=KK;
      layer[6][9]=KK; layer[6][10]=KK; layer[6][11]=KK;
      layer[7][9]=W;  layer[7][10]=KK; layer[7][11]=KK;
      layer[8][10]=KK; layer[8][11]=KK;
      break;
  }

  // ── 입 (mouthType 유전자 반영) + 쪽쪽이 ──
  const M = '#FF88AA';
  switch (pheno.mouthType) {
    case 'smile':
    default:
      // 웃는 입 + 쪽쪽이
      layer[10][6]=M; layer[10][7]=M; layer[10][8]=M; layer[10][9]=M;
      layer[11][5]=M; layer[11][10]=M;
      // 쪽쪽이
      layer[9][7]='#FF99AA'; layer[9][8]='#FF99AA';
      break;
    case 'dot3':
      // 다코야끼 스타일 입 — 세 점
      layer[10][5]=M; layer[10][7]=M; layer[10][8]=M;
      layer[11][8]=M;
      layer[12][7]=M; layer[12][8]=M;
      layer[10][10]=M;
      // 쪽쪽이
      layer[9][7]='#FF99AA'; layer[9][8]='#FF99AA';
      break;
    case 'pout':
      // 삐진 입
      layer[10][5]=M; layer[10][6]=M; layer[10][7]=M; layer[10][8]=M; layer[10][9]=M;
      layer[11][5]='#CC5566'; layer[11][6]='#CC5566'; layer[11][7]='#CC5566'; layer[11][8]='#CC5566'; layer[11][9]='#CC5566';
      // 쪽쪽이
      layer[9][7]='#FF99AA'; layer[9][8]='#FF99AA';
      break;
    case 'kuromi':
      // 쿠로미 스마일 (V자)
      layer[10][5]=KK; layer[10][9]=KK;
      layer[11][6]=KK; layer[11][7]=KK; layer[11][8]=KK;
      // 쪽쪽이
      layer[9][7]='#FF99AA'; layer[9][8]='#FF99AA';
      break;
  }

  // ── 수염 (kitty 계열) ──
  if (pheno.whiskers === 'yes') {
    layer[8][0]=KK; layer[8][1]=KK;
    layer[8][14]=KK; layer[8][15]=KK;
  }

  // ── 소스 (takoyaki 계열) ──
  if (pheno.sauce === 'yes') {
    layer[2][5]='#5C2A00'; layer[2][7]='#5C2A00'; layer[2][9]='#5C2A00';
    layer[3][4]='#6B3300'; layer[3][6]='#6B3300'; layer[3][8]='#6B3300'; layer[3][10]='#6B3300';
  }

  // ── 볼터치 ──
  const cheekColor = pheno.bodyColor === 'pink' ? '#FF99BB' : '#FFBBCC';
  layer[8][2]=cheekColor; layer[8][12]=cheekColor;

  return layer;
}

// ── 유아기: 몸색만, 이목구비 없음, 다리 없음 ──
function buildInfantLayer(pheno: Phenotype): Layer {
  const bodyColor = BODY_BASE[pheno.bodyColor] || BODY_BASE.white;
  const shadow    = BODY_SHADOW[pheno.bodyColor] || BODY_SHADOW.white;
  const highlight = BODY_HIGHLIGHT[pheno.bodyColor] || BODY_HIGHLIGHT.white;

  const mask = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  const layer = empty16();
  for (let r=0;r<16;r++) for (let c=0;c<16;c++) {
    if (!mask[r][c]) continue;
    layer[r][c] = (r<=4&&c<=7) ? highlight : (r>=9||c>=11) ? shadow : bodyColor;
  }
  // 눈 자리만 흐릿하게 (점 두 개)
  layer[7][5]=shadow; layer[7][9]=shadow;
  // 볼터치
  layer[8][2]='#FFBBCC'; layer[8][12]='#FFBBCC';
  return layer;
}

// ── 반항기: 몸색 + 귀 + 머리장식 + 앳된 눈(동그란 점), 다리 생김 ──
function buildTeenLayer(pheno: Phenotype): Layer {
  const bodyColor = BODY_BASE[pheno.bodyColor] || BODY_BASE.white;
  const shadow    = BODY_SHADOW[pheno.bodyColor] || BODY_SHADOW.white;
  const highlight = BODY_HIGHLIGHT[pheno.bodyColor] || BODY_HIGHLIGHT.white;

  // 몸 (다리 있음, 조금 작은 비율)
  const mask = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  const layer = empty16();
  for (let r=0;r<16;r++) for (let c=0;c<16;c++) {
    if (!mask[r][c]) continue;
    layer[r][c] = (r<=3&&c<=7) ? highlight : (r>=9||c>=11) ? shadow : bodyColor;
  }

  // 귀 (earType 반영)
  const earColor = BODY_BASE[pheno.bodyColor] || W;
  switch (pheno.earType) {
    case 'kitty':
      layer[0][3]=earColor; layer[0][4]=earColor;
      layer[1][3]=earColor; layer[1][4]=earColor;
      layer[0][11]=earColor; layer[0][12]=earColor;
      layer[1][11]=earColor; layer[1][12]=earColor;
      layer[1][4]='#FFB3C6'; layer[1][11]='#FFB3C6';
      break;
    case 'melody':
      layer[0][2]='#FFB3D4'; layer[0][3]='#FFB3D4'; layer[0][4]='#FFB3D4';
      layer[1][2]='#FF99CC'; layer[1][3]='#FFB3D4';
      layer[0][11]='#FFB3D4'; layer[0][12]='#FFB3D4'; layer[0][13]='#FFB3D4';
      layer[1][12]='#FF99CC'; layer[1][13]='#FFB3D4';
      break;
    case 'kuromi':
      layer[0][5]=BK; layer[0][6]=BK; layer[0][9]=BK; layer[0][10]=BK;
      layer[1][4]=BK; layer[1][5]=BK; layer[1][6]=BK;
      layer[1][9]=BK; layer[1][10]=BK; layer[1][11]=BK;
      break;
    case 'purin':
      layer[2][0]='#FFAA88'; layer[2][1]=pY; layer[2][2]=pY;
      layer[3][0]='#FFAA88'; layer[3][1]=pY;
      layer[2][13]=pY; layer[2][14]=pY; layer[2][15]='#FFAA88';
      layer[3][14]=pY; layer[3][15]='#FFAA88';
      break;
  }

  // 머리장식 (headpiece 반영)
  switch (pheno.headpiece) {
    case 'ribbon':
      layer[0][5]='#FF3399'; layer[0][6]='#FF3399';
      layer[0][8]='#FF3399'; layer[0][9]='#FF3399';
      layer[0][7]='#FF99CC';
      break;
    case 'skullpin':
      layer[0][7]='#CC44FF'; layer[0][8]='#CC44FF';
      layer[1][7]='#CC44FF'; layer[1][8]=W;
      break;
    case 'beret':
      layer[0][4]=pG; layer[0][5]=pG; layer[0][6]=pG; layer[0][7]=pG; layer[0][8]=pG; layer[0][9]=pG; layer[0][10]=pG;
      break;
    case 'horn':
      layer[0][7]='#B3D9FF'; layer[0][8]='#B3D9FF';
      break;
  }

  // 앳된 눈 (동그란 점, 아직 작음)
  layer[5][4]=KK; layer[5][5]=KK;
  layer[6][4]=KK; layer[6][5]=W;
  layer[5][9]=KK; layer[5][10]=KK;
  layer[6][9]=KK; layer[6][10]=W;

  // 볼터치
  const cheekColor = pheno.bodyColor === 'pink' ? '#FF99BB' : '#FFBBCC';
  layer[7][2]=cheekColor; layer[7][12]=cheekColor;

  // 소스 (있으면)
  if (pheno.sauce === 'yes') {
    layer[1][5]='#5C2A00'; layer[1][7]='#5C2A00'; layer[1][9]='#5C2A00';
  }

  return layer;
}

export function buildCharacterLayers(pheno: Phenotype, growthStage: string = 'adult'): Layer {
  if (growthStage === 'infant') return buildInfantLayer(pheno);
  if (growthStage === 'teen')   return buildTeenLayer(pheno);
  // 레거시 호환
  if (growthStage === 'baby') return buildInfantLayer(pheno);

  const base = pheno.baseChar;
  // 1세대 산리오 캐릭터
  if (base === 'kitty')    return pixelsToLayer(KITTY_PX);
  if (base === 'melody')   return pixelsToLayer(MELODY_PX);
  if (base === 'kuromi')   return pixelsToLayer(KUROMI_PX);
  if (base === 'purin')    return pixelsToLayer(PURIN_PX);
  if (base === 'takoyaki') return pixelsToLayer(TAKO_PX);
  if (base === 'ninja')    return pixelsToLayer(NINJA_PX);
  if (base === 'sheep')    return pixelsToLayer(SHEEP_PX);
  if (base === 'cherry')   return pixelsToLayer(CHERRY_PX);
  if (base === 'sushi')    return pixelsToLayer(SUSHI_PX);
  if (base === 'icecream') return pixelsToLayer(ICECREAM_PX);
  if (base === 'robot')    return pixelsToLayer(ROBOT_PX);

  // 2세대 이후 파츠 조합 — body(index 0)가 맨 아래, headpiece(마지막)가 맨 위
  return composeLayers([
    drawBody(pheno),
    drawEars(pheno),
    drawSauce(pheno),
    drawCheeks(pheno),
    drawEyes(pheno),
    drawMouth(pheno),
    drawWhiskers(pheno),
    drawHeadpiece(pheno),
  ]);
}

export function layerToSpriteData(layer: Layer): { frame: SpriteFrame; colorMap: Record<number, string> } {
  const colorMap: Record<number, string> = { 0: 'transparent' };
  const colorToIdx: Record<string, number> = { '': 0 };
  let nextIdx = 20;
  const frame: SpriteFrame = [];
  for (let r=0;r<16;r++) {
    const row: number[] = [];
    for (let c=0;c<16;c++) {
      const val = layer[r][c];
      if (val===0||val==='') { row.push(0); continue; }
      const color = val as string;
      if (!(color in colorToIdx)) { colorToIdx[color]=nextIdx; colorMap[nextIdx]=color; nextIdx++; }
      row.push(colorToIdx[color]);
    }
    frame.push(row);
  }
  return { frame, colorMap };
}

export function buildAnimationFrames(pheno: Phenotype, growthStage: string = 'adult'): Record<AnimState, { frames: Layer[] }> {
  const base = buildCharacterLayers(pheno, growthStage);

  // 아기는 눈이 row 6~8에 위치, 어른은 bodyShape에 따라 다름
  const isInfant = growthStage === 'infant' || growthStage === 'baby';
  const isTeen = growthStage === 'teen';
  const isBaby = isInfant; // 레거시 호환
  const er = isInfant ? 6 : (pheno.bodyShape === 'tall' ? 4 : 5);

  // 아기용 눈 blink — 눈 타입별로 맞는 픽셀 좌표
  const blink = base.map(r=>[...r]);
  if (growthStage === 'infant' || growthStage === 'baby') {
    // 유아기: 눈이 shadow 점 두 개뿐 — 그냥 그 점만 지우기
    const bc = BODY_BASE[pheno.bodyColor] || BODY_BASE.white;
    blink[7][5] = bc;
    blink[7][9] = bc;
  } else if (isTeen) {
    // 반항기: 눈 row 5~6에 작은 눈
    blink[5][4]=KK; blink[5][5]=KK; blink[5][9]=KK; blink[5][10]=KK;
    if (blink[6]) { blink[6][4]=KK; blink[6][5]=KK; blink[6][9]=KK; blink[6][10]=KK; }
  } else {
    [[er,4],[er,5],[er,9],[er,10]].forEach(([r,c])=>{ blink[r][c]=KK; });
    if (er+1<16) [[er+1,4],[er+1,5],[er+1,9],[er+1,10]].forEach(([r,c])=>{ blink[r][c]=0; });
  }

  const walk1 = base.map(r=>[...r]);
  const walk2 = base.map(r=>[...r]);
  if (!isBaby) {
    // 성체/반항기만 다리 움직임
    walk1[13]=[0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0].map((v,i)=>v?(base[13][i]||base[12][i]||0):0);
    walk2[13]=[0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0].map((v,i)=>v?(base[13][i]||base[12][i]||0):0);
  }
  // 유아기는 walk = base 그대로 (깜빡/픽셀 수정 없음)

  const happy1=empty16() as Layer;
  const happy2=empty16() as Layer;
  for (let r=1;r<16;r++) happy1[r-1]=[...base[r]];
  for (let r=2;r<16;r++) happy2[r-2]=[...base[r]];
  const sparkle = pheno.headpiece==='skullpin' ? '#CC44FF' : '#FF66BB';
  happy2[0][2]=sparkle; happy2[1][13]=sparkle;

  const eat1=base.map(r=>[...r]);
  const mr = isBaby ? 10 : (pheno.bodyShape==='tall'?7:8);
  eat1[mr][6]='#FF6688'; eat1[mr][7]='#FF6688';
  if (mr+1<16) { eat1[mr+1][6]='#FF6688'; eat1[mr+1][7]='#FF6688'; }

  const sad=base.map(r=>[...r]);
  // 아기 눈물: row 9 양쪽
  const tearRow = isBaby ? 9 : (er+3<16 ? er+3 : er+2);
  if (tearRow<16) { sad[tearRow][4]='#88CCFF'; sad[tearRow][10]='#88CCFF'; }

  const sleep=base.map(r=>[...r]);
  if (growthStage === 'infant' || growthStage === 'baby') {
    // 유아기 수면: shadow 점만 지우기 (몸 색으로 덮기)
    const bc = BODY_BASE[pheno.bodyColor] || BODY_BASE.white;
    sleep[7][5] = bc;
    sleep[7][9] = bc;
  } else {
    [[er,4],[er,5],[er,9],[er,10]].forEach(([r,c])=>{ sleep[r][c]=KK; });
    if (er+1<16) [[er+1,4],[er+1,5],[er+1,9],[er+1,10]].forEach(([r,c])=>{ sleep[r][c]=0; });
  }

  return {
    idle:       { frames:[base,blink] },
    walk_right: { frames:[walk1,walk2] },
    walk_left:  { frames:[walk1,walk2] },
    eat:        { frames:[eat1,base] },
    happy:      { frames:[happy1,happy2] },
    sleep:      { frames:[sleep,sleep] },
    sad:        { frames:[sad,sad] },
  };
}

// LEGACY
export const EGG: SpriteFrame[] = [
  [[0,0,0,0,0,0,7,7,7,7,0,0,0,0,0,0],[0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0],[0,0,0,0,7,7,7,7,7,7,7,7,0,0,0,0],[0,0,0,7,7,7,7,7,7,7,7,7,7,0,0,0],[0,0,0,7,7,7,7,7,7,7,7,7,7,0,0,0],[0,0,7,7,7,7,7,7,7,7,7,7,7,7,0,0],[0,0,7,7,7,7,7,7,7,7,7,7,7,7,0,0],[0,0,7,7,7,7,7,7,7,7,7,7,7,7,0,0],[0,0,7,8,7,7,7,7,7,7,7,7,8,7,0,0],[0,0,7,8,8,7,7,7,7,7,7,8,8,7,0,0],[0,0,0,8,8,8,7,7,7,7,8,8,8,0,0,0],[0,0,0,8,8,8,8,7,7,8,8,8,8,0,0,0],[0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0],[0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  [[0,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0],[0,0,0,0,7,7,7,7,7,7,0,0,0,0,0,0],[0,0,0,7,7,7,7,7,7,7,7,0,0,0,0,0],[0,0,7,7,7,7,7,7,7,7,7,7,0,0,0,0],[0,0,7,7,7,7,7,7,7,7,7,7,0,0,0,0],[0,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0],[0,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0],[0,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0],[0,7,8,7,7,7,7,7,7,7,7,8,7,0,0,0],[0,7,8,8,7,7,7,7,7,7,8,8,7,0,0,0],[0,0,8,8,8,7,7,7,7,8,8,8,0,0,0,0],[0,0,8,8,8,8,7,7,8,8,8,8,0,0,0,0],[0,0,0,8,8,8,8,8,8,8,8,0,0,0,0,0],[0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
];
export const EGG_CRACKED: SpriteFrame = [[0,0,0,0,0,0,7,7,7,7,0,0,0,0,0,0],[0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0],[0,0,0,0,7,7,7,6,7,7,7,7,0,0,0,0],[0,0,0,7,7,7,6,7,7,6,7,7,7,0,0,0],[0,0,0,7,7,6,7,7,6,7,7,7,7,0,0,0],[0,0,7,7,7,7,7,6,7,7,7,7,7,7,0,0],[0,0,7,7,7,7,6,7,7,6,7,7,7,7,0,0],[0,0,7,7,7,6,7,7,6,7,7,7,7,7,0,0],[0,0,7,8,7,7,6,6,7,7,7,7,8,7,0,0],[0,0,7,8,8,7,7,7,7,7,7,8,8,7,0,0],[0,0,0,8,8,8,7,7,7,7,8,8,8,0,0,0],[0,0,0,8,8,8,8,7,7,8,8,8,8,0,0,0],[0,0,0,0,8,8,8,8,8,8,8,8,0,0,0,0],[0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
export const POOP: SpriteFrame = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,11,11,11,0,0,0,0,0,0,0],[0,0,0,0,0,11,12,11,12,11,0,0,0,0,0,0],[0,0,0,0,0,11,11,11,11,11,0,0,0,0,0,0],[0,0,0,0,11,12,11,11,11,12,11,0,0,0,0,0],[0,0,0,0,11,11,2,11,2,11,11,0,0,0,0,0],[0,0,0,0,11,11,11,11,11,11,11,0,0,0,0,0],[0,0,0,0,0,11,11,11,11,11,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
export const FOOD: SpriteFrame = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0],[0,0,0,0,0,9,9,9,9,9,9,0,0,0,0,0],[0,0,0,0,9,9,9,9,9,9,9,9,0,0,0,0],[0,0,0,0,0,9,9,9,9,9,9,0,0,0,0,0],[0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0],[0,0,0,10,10,0,0,0,0,0,0,10,10,0,0,0],[0,0,0,0,10,10,10,10,10,10,10,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
const _i: SpriteFrame = Array.from({length:16},()=>Array(16).fill(0));
export const SPRITES = { idle:[_i,_i],walk_right:[_i,_i],walk_left:[_i,_i],eat:[_i,_i],happy:[_i,_i],sleep:[_i,_i],sad:[_i,_i] } as const;
export type CharType = string;
export function getCharType(_p: Phenotype): CharType { return _p.baseChar||'custom'; }
export function getCharPixels(_ct: CharType): (string|null)[][] { return []; }
