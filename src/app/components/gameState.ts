import { AnimState } from './sprites';
import { Genome, FamilyMember } from './genetics';

// 성장 단계: egg → baby → adult
export type GrowthStage = 'egg' | 'infant' | 'teen' | 'adult';

export interface GameState {
  phase: 'egg' | 'alive';
  growthStage: GrowthStage;   // 성장 단계
  ageInSeconds: number;        // 태어난 후 경과 초
  tapCount: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  poopCount: number;
  charX: number;
  direction: 1 | -1;
  animState: AnimState;
  animFrame: number;
  lastSaveTime: number;
  lastPoopTime: number;
  hatched: boolean;
  eggCracked: boolean;
  actionAnim: 'eat' | 'happy' | null;
  actionTimer: number;
  foodVisible: boolean;
  isDead: boolean;             // 사망 여부
  deathTime: number | null;    // 사망 시각
  genome: Genome | null;
  currentPetId: string | null;
  generation: number;
  totalFeeds: number;
  totalPlays: number;
  totalBaths: number;
  bornAt: number;
  lastSleepTime: number;       // 마지막 수면 시각
  isSleeping: boolean;         // 현재 수면 중
  mood: string;                // 현재 기분 ('happy'|'hungry'|'dirty'|'bored'|'sleepy'|'sick'|'dead')
  speechBubble: string | null; // 말풍선 텍스트
  speechTimer: number;         // 말풍선 표시 타이머
  background: 'default' | 'walk' | 'travel' | 'bath' | 'playground'; // 현재 배경
  isBathing: boolean;          // 목욕 중
  bathTimer: number;           // 목욕 타이머
}

export interface FamilyData {
  members: FamilyMember[];
  discoveredTraits: string[];
}

// 성장 기준: baby → adult (먹이 5회 + 놀기 3회)
// 유아기 → 반항기
export const INFANT_TO_TEEN_FEEDS = 3;
export const INFANT_TO_TEEN_PLAYS = 2;
// 반항기 → 성체
export const TEEN_TO_ADULT_FEEDS = 5;
export const TEEN_TO_ADULT_PLAYS = 3;
// 레거시 호환
export const BABY_TO_ADULT_FEEDS = 5;
export const BABY_TO_ADULT_PLAYS = 3;
export const TEEN_TO_ADULT_FEEDS = 5;
export const TEEN_TO_ADULT_PLAYS = 3;

const SAVE_KEY = 'tamagotchi_save';
const FAMILY_KEY = 'tamagotchi_family';

export function defaultState(): GameState {
  return {
    phase: 'egg',
    growthStage: 'egg' as GrowthStage,
    ageInSeconds: 0,
    tapCount: 0,
    hunger: 80,
    happiness: 80,
    cleanliness: 100,
    poopCount: 0,
    charX: 80,
    direction: 1,
    animState: 'idle',
    animFrame: 0,
    lastSaveTime: Date.now(),
    lastPoopTime: Date.now(),
    hatched: false,
    eggCracked: false,
    actionAnim: null,
    actionTimer: 0,
    foodVisible: false,
    isDead: false,
    deathTime: null,
    genome: null,
    currentPetId: null,
    generation: 1,
    totalFeeds: 0,
    totalPlays: 0,
    totalBaths: 0,
    bornAt: Date.now(),
    lastSleepTime: Date.now(),
    isSleeping: false,
    mood: 'happy',
    speechBubble: null,
    speechTimer: 0,
    background: 'default',
    isBathing: false,
    bathTimer: 0,
  };
}

// 현재 시간대 반환 (밤: 22~6시)
export function isNightTime(): boolean {
  const h = new Date().getHours();
  return h >= 22 || h < 6;
}

// 기분 계산
export function calcMood(s: GameState): string {
  if (s.isDead) return 'dead';
  if (s.isSleeping) return 'sleepy';
  if (s.hunger < 20) return 'hungry';
  if (s.cleanliness < 20) return 'dirty';
  if (s.happiness < 20) return 'bored';
  if (s.hunger < 40 || s.happiness < 40 || s.cleanliness < 40) return 'sick';
  return 'happy';
}

// 말풍선 텍스트
export function getMoodSpeech(mood: string): string {
  const speeches: Record<string, string[]> = {
    happy:   ['신나~! 🎵', '기분 좋아!', '오늘도 화이팅!', '냠냠 맛있어!'],
    hungry:  ['배고파... 🍼', '밥 줘요!', '꼬르륵...', '밥밥밥!'],
    dirty:   ['냄새나~! 🧹', '씻고싶어..', '더러워 ㅠ'],
    bored:   ['심심해~ 🥺', '놀아줘!', '같이 놀자!'],
    sleepy:  ['졸려... 💤', 'zzz...', '잠자고싶어'],
    sick:    ['몸이 안좋아 🤒', '아파요...', '돌봐줘 ㅠ'],
    dead:    ['...👻', '잘 있어...'],
  };
  const arr = speeches[mood] || speeches.happy;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function saveState(state: GameState) {
  try {
    const s = { ...state, lastSaveTime: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw) as GameState;
    const elapsed = (Date.now() - s.lastSaveTime) / 1000;
    const minutesAway = elapsed / 60;

    // 오프라인 스탯 감소
    if (s.phase === 'alive' && !s.isDead && minutesAway > 1) {
      s.hunger     = Math.max(0, s.hunger     - minutesAway * 0.5);
      s.happiness  = Math.max(0, s.happiness  - minutesAway * 0.3);
      s.cleanliness= Math.max(0, s.cleanliness- minutesAway * 0.2);
      s.ageInSeconds = (s.ageInSeconds || 0) + elapsed;
    }

    // 사망 체크 (오프라인 중 스탯 0 → 30분 이상이면 사망)
    if (s.phase === 'alive' && !s.isDead) {
      const allZero = s.hunger <= 0 && s.happiness <= 0;
      if (allZero && minutesAway > 30) {
        s.isDead = true;
        s.deathTime = Date.now();
        s.mood = 'dead';
      }
    }

    s.lastSaveTime = Date.now();
    s.actionAnim = null;
    s.actionTimer = 0;
    s.foodVisible = false;
    s.speechBubble = null;
    s.speechTimer = 0;
    if (!s.background) s.background = 'default';
    if (s.isBathing === undefined) s.isBathing = false;
    if (s.bathTimer === undefined) s.bathTimer = 0;
    // 구버전 호환
    if (!s.growthStage) s.growthStage = s.phase === 'egg' ? 'egg' : 'adult';
    // 구버전 'baby' 호환
    if ((s.growthStage as string) === 'baby') s.growthStage = 'infant';
    if (!s.ageInSeconds) s.ageInSeconds = 0;
    return s;
  } catch {
    return defaultState();
  }
}

export function resetState() {
  localStorage.removeItem(SAVE_KEY);
}

export function saveFamilyData(data: FamilyData) {
  try {
    localStorage.setItem(FAMILY_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function loadFamilyData(): FamilyData {
  try {
    const raw = localStorage.getItem(FAMILY_KEY);
    if (!raw) return { members: [], discoveredTraits: [] };
    return JSON.parse(raw) as FamilyData;
  } catch {
    return { members: [], discoveredTraits: [] };
  }
}
