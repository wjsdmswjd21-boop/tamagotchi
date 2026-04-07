'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { EGG, EGG_CRACKED, AnimState, buildCharacterLayers, buildAnimationFrames } from './sprites';
import {
  clearCanvas, drawSprite, drawPoopSmall, drawZzz, drawFoodSmall,
  drawLayer, drawHearts, drawMiniCharacter,
  drawWalkBackground, drawTravelBackground, drawBathBackground, drawBathFoam, drawPlaygroundBackground, drawDirtyEffect,
  CANVAS_W, CANVAS_H, SPRITE_PX,
} from './renderer';
import {
  GameState, defaultState, loadState, saveState, resetState,
  INFANT_TO_TEEN_FEEDS, INFANT_TO_TEEN_PLAYS, TEEN_TO_ADULT_FEEDS, TEEN_TO_ADULT_PLAYS,
  FamilyData, saveFamilyData, loadFamilyData,
  isNightTime, calcMood, getMoodSpeech,
  infant_TO_ADULT_FEEDS, infant_TO_ADULT_PLAYS,
} from './gameState';
import {
  Genome, Phenotype, FamilyMember,
  createRandomGenome, createSanrioGenome, getPhenotype, breed, generateId, countTraits,
} from './genetics';

type UIMode = 'main' | 'breeding' | 'familyTree';
type BreedPhase = 'pick' | 'hearts' | 'egg' | 'hatch' | 'result';

export default function TamagotchiGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(defaultState());
  const familyRef = useRef<FamilyData>({ members: [], discoveredTraits: [] });
  const frameCountRef = useRef(0);
  const [stats, setStats] = useState({ hunger: 80, happiness: 80, cleanliness: 100 });
  const [bathCount, setBathCount] = useState(0);
  const [phase, setPhase] = useState<'egg' | 'alive'>('egg');
  const [growthStage, setGrowthStage] = useState<'egg'|'infant'|'teen'|'adult'>('egg');
  const [isDead, setIsDead] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string|null>(null);
  const [shakeClass, setShakeClass] = useState('');
  const [subMenu, setSubMenu] = useState<'none'|'play'|'clean'>('none');
  const [uiMode, setUiMode] = useState<UIMode>('main');
  const [traitCount, setTraitCount] = useState(0);
  const [generation, setGeneration] = useState(1);

  // Breeding state
  const [breedPhase, setBreedPhase] = useState<BreedPhase>('pick');
  const [partnerGenome, setPartnerGenome] = useState<Genome | null>(null);
  const [childGenome, setChildGenome] = useState<Genome | null>(null);
  const [childPhenotype, setChildPhenotype] = useState<Phenotype | null>(null);

  // 3 partner candidates
  const [candidates, setCandidates] = useState<{ genome: Genome; phenotype: Phenotype; layer: (string | 0)[][] }[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);

  // Animation layers cache
  const animCacheRef = useRef<ReturnType<typeof buildAnimationFrames> | null>(null);
  const partnerLayerRef = useRef<(string | 0)[][] | null>(null);
  const childLayerRef = useRef<(string | 0)[][] | null>(null);
  const breedPhaseRef = useRef<BreedPhase>('pick');
  const breedTimerRef = useRef(0);
  const uiModeRef = useRef<UIMode>('main');

  // Maturity check helper (needs to be before refs)
  const getMaturityInfo = useCallback(() => {
    const s = stateRef.current;
    const feeds = s.totalFeeds || 0;
    const plays = s.totalPlays || 0;
    const minFeeds = 3;
    const minPlays = 2;
    const minStats = 50;
    const ready = feeds >= minFeeds && plays >= minPlays
      && s.hunger >= minStats && s.happiness >= minStats && s.cleanliness >= minStats;
    return { ready, feeds, plays, minFeeds, minPlays, minStats };
  }, []);

  // Refs for render loop access
  const candidatesRef = useRef(candidates);
  const selectedCandRef = useRef(selectedCandidate);
  const getMaturityInfoRef = useRef(getMaturityInfo);

  // Sync refs
  useEffect(() => { breedPhaseRef.current = breedPhase; }, [breedPhase]);
  useEffect(() => { uiModeRef.current = uiMode; }, [uiMode]);
  useEffect(() => { candidatesRef.current = candidates; }, [candidates]);
  useEffect(() => { selectedCandRef.current = selectedCandidate; }, [selectedCandidate]);
  useEffect(() => { getMaturityInfoRef.current = getMaturityInfo; }, [getMaturityInfo]);

  // Build/rebuild animation cache when genome changes
  const rebuildAnimCache = useCallback((genome: Genome, stage: string = 'adult') => {
    const pheno = getPhenotype(genome);
    animCacheRef.current = buildAnimationFrames(pheno, stage);
    // Update discovered traits
    const family = familyRef.current;
    const traits = countTraits(pheno);
    for (const t of traits) {
      if (!family.discoveredTraits.includes(t)) {
        family.discoveredTraits.push(t);
      }
    }
    setTraitCount(family.discoveredTraits.length);
    saveFamilyData(family);
  }, []);

  // Load saved state
  useEffect(() => {
    const s = loadState();
    stateRef.current = s;
    setPhase(s.phase);
    setGrowthStage(s.growthStage || (s.phase === 'egg' ? 'egg' : 'adult'));
    setIsDead(s.isDead || false);
    setStats({ hunger: s.hunger, happiness: s.happiness, cleanliness: s.cleanliness });
    setGeneration(s.generation || 1);

    const family = loadFamilyData();
    familyRef.current = family;
    setTraitCount(family.discoveredTraits.length);

    if (s.genome) {
      const stage = s.growthStage || (s.phase === 'egg' ? 'egg' : 'adult');
      rebuildAnimCache(s.genome, stage);
    }
  }, [rebuildAnimCache]);

  // Auto-save every 10s
  useEffect(() => {
    const iv = setInterval(() => {
      saveState(stateRef.current);
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let animId: number;
    let tick = 0;

    const loop = () => {
      tick++;
      const s = stateRef.current;
      frameCountRef.current = tick;

      // --- Update logic ---
      if (tick % 30 === 0 && s.phase === 'alive' && uiModeRef.current === 'main') {
        // 사망 상태면 업데이트 스킵
        if (s.isDead) {
          setIsDead(true);
        } else {
          // 수면 체크 (밤 22시~6시 자동 수면)
          const night = isNightTime();
          if (night && !s.isSleeping && s.growthStage !== 'egg') {
            s.isSleeping = true;
            s.animState = 'sleep';
          } else if (!night && s.isSleeping) {
            s.isSleeping = false;
            s.hunger = Math.min(100, s.hunger + 20);   // 자고 나면 회복
            s.happiness = Math.min(100, s.happiness + 10);
          }

          if (!s.isSleeping) {
            s.hunger      = Math.max(0, s.hunger      - 0.3);
            s.happiness   = Math.max(0, s.happiness   - 0.2);
            const timeSincePoop = Date.now() - s.lastPoopTime;
            if (s.poopCount < 3 && timeSincePoop > (60000 + Math.random() * 120000)) {
              s.poopCount++;
              s.cleanliness = Math.max(0, s.cleanliness - 15);
              s.lastPoopTime = Date.now();
            }
            if (s.poopCount > 0) {
              s.cleanliness = Math.max(0, s.cleanliness - s.poopCount * 0.1);
            }
          }

          // 나이 증가
          s.ageInSeconds = (s.ageInSeconds || 0) + 0.5;

          // 성장 단계 체크: infant → teen → adult
          if (s.growthStage === 'infant') {
            const readyToTeen = s.totalFeeds >= INFANT_TO_TEEN_FEEDS
              && s.totalPlays >= INFANT_TO_TEEN_PLAYS;
            if (readyToTeen) {
              s.growthStage = 'teen';
              setGrowthStage('teen');
              s.speechBubble = '반항기 왔다..😤';
              s.speechTimer = 150;
              setSpeechBubble('반항기 왔다..😤');
              s.totalFeeds = 0;
              s.totalPlays = 0;
              s.totalBaths = 0;
              setBathCount(0);
              if (s.genome) rebuildAnimCache(s.genome, 'teen');
            }
          } else if (s.growthStage === 'teen') {
            const readyToAdult = s.totalFeeds >= TEEN_TO_ADULT_FEEDS
              && s.totalPlays >= TEEN_TO_ADULT_PLAYS
              && (s.totalBaths || 0) >= 2;
            if (readyToAdult) {
              s.growthStage = 'adult';
              setGrowthStage('adult');
              s.speechBubble = '다 컸다!! 🎉';
              s.speechTimer = 150;
              setSpeechBubble('다 컸다!! 🎉');
              if (s.genome) rebuildAnimCache(s.genome, 'adult');
            }
          }

          // 사망 체크 (스탯 0 → 일정 시간 경과)
          if (s.hunger <= 0 && s.happiness <= 0) {
            if (!s.deathTime) s.deathTime = Date.now();
            else if (Date.now() - s.deathTime > 60000) { // 1분 유예
              s.isDead = true;
              s.mood = 'dead';
              setIsDead(true);
            }
          } else {
            s.deathTime = null;
          }

          // 기분 업데이트
          const newMood = calcMood(s);
          if (newMood !== s.mood) {
            s.mood = newMood;
          }

          // 말풍선 타이머
          if (s.speechTimer > 0) {
            s.speechTimer--;
            if (s.speechTimer <= 0) {
              s.speechBubble = null;
              setSpeechBubble(null);
            }
          }
          // 랜덤 말풍선 (30초마다 10% 확률)
          if (tick % 900 === 0 && Math.random() < 0.1 && s.growthStage !== 'egg') {
            const speech = getMoodSpeech(s.mood);
            s.speechBubble = speech;
            s.speechTimer = 120;
            setSpeechBubble(speech);
          }

          setStats({ hunger: s.hunger, happiness: s.happiness, cleanliness: s.cleanliness });
        }
      }

      // Action animation timer
      if (s.actionTimer > 0) {
        s.actionTimer--;
        if (s.actionTimer <= 0) {
          s.actionAnim = null;
          s.foodVisible = false;
        }
      }

      // 목욕 타이머
      if (s.isBathing && s.bathTimer > 0) {
        s.bathTimer--;
        if (s.bathTimer <= 0) {
          s.isBathing = false;
          s.background = 'default';
          s.cleanliness = Math.min(100, s.cleanliness + 40);
          s.speechBubble = '개운해! 🧼';
          s.speechTimer = 100;
          setSpeechBubble('개운해! 🧼');
          setStats(prev => ({ ...prev, cleanliness: s.cleanliness }));
        }
      }

      // Breed timer
      if (breedTimerRef.current > 0) {
        breedTimerRef.current--;
      }

      // 목욕 타이머
      if (s.isBathing && s.bathTimer > 0) {
        s.bathTimer--;
        if (s.bathTimer <= 0) {
          s.isBathing = false;
          s.background = 'default';
          s.cleanliness = Math.min(100, s.cleanliness + 40);
          s.speechBubble = '개운해! 🧼';
          s.speechTimer = 100;
          setSpeechBubble('개운해! 🧼');
          setStats(prev => ({ ...prev, cleanliness: s.cleanliness }));
        }
      }

      // 산책/여행 배경 타이머
      if ((s.background === 'walk' || s.background === 'travel' || s.background === 'playground') && s.actionTimer <= 0) {
        s.background = 'default';
      }

      // AI movement
      if (tick % 10 === 0 && s.phase === 'alive' && !s.actionAnim && uiModeRef.current === 'main' && !s.isDead) {
        // 수면 중이면 sleep 애니메이션 고정
        if (s.isSleeping) {
          s.animState = 'sleep';
        } else {
          const avgStat = (s.hunger + s.happiness + s.cleanliness) / 3;
          if (avgStat < 25) {
            s.animState = 'sad';
          } else if (Math.random() < 0.05) {
            s.direction = s.direction === 1 ? -1 : 1;
          }

        if (s.animState !== 'sad' && !s.actionAnim) {
          if (Math.random() < 0.7) {
            s.animState = s.direction === 1 ? 'walk_right' : 'walk_left';
            s.charX += s.direction * 4;
            if (s.charX < 4) { s.charX = 4; s.direction = 1; }
            if (s.charX > CANVAS_W - SPRITE_PX - 4) { s.charX = CANVAS_W - SPRITE_PX - 4; s.direction = -1; }
          } else {
            s.animState = 'idle';
          }
        }
      } // end isSleeping else
      }

      // Anim frame toggle
      if (tick % 20 === 0) {
        s.animFrame = (s.animFrame + 1) % 2;
      }

      // --- Render ---
      // 배경 선택
      if (s.background === 'walk') {
        drawWalkBackground(ctx, tick);
      } else if (s.background === 'travel') {
        drawTravelBackground(ctx, tick);
      } else if (s.background === 'bath') {
        drawBathBackground(ctx, tick);
      } else if (s.background === 'playground') {
        drawPlaygroundBackground(ctx, tick);
      } else {
        clearCanvas(ctx);
      }

      if (uiModeRef.current === 'breeding') {
        renderBreeding(ctx, tick, s);
      } else if (uiModeRef.current === 'familyTree') {
        renderFamilyTree(ctx);
      } else if (s.phase === 'egg') {
        const eggX = (CANVAS_W - SPRITE_PX) / 2;
        const eggY = (CANVAS_H - SPRITE_PX) / 2 - 10;
        if (s.eggCracked) {
          drawSprite(ctx, EGG_CRACKED, eggX, eggY);
        } else {
          const frame = EGG[Math.floor(tick / 15) % EGG.length];
          drawSprite(ctx, frame, eggX, eggY);
        }
      } else {
        // 사망 상태
        if (s.isDead) {
          ctx.font = '40px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👻', CANVAS_W / 2, CANVAS_H / 2 - 10);
          ctx.font = '12px monospace';
          ctx.fillStyle = '#aaaaaa';
          ctx.fillText('...잘 있어...', CANVAS_W / 2, CANVAS_H / 2 + 20);
        } else {
          // Draw character using genetic layers
          const anim = animCacheRef.current;
          if (anim) {
            const currentAnim: AnimState = (s.actionAnim as AnimState) || s.animState;
            const animData = anim[currentAnim];
            const frameIdx = s.animFrame % animData.frames.length;
            const layer = animData.frames[frameIdx];
            const flip = (s.animState === 'walk_left' || s.direction === -1) && !s.actionAnim;
            const charY = CANVAS_H - SPRITE_PX - 16;
            drawLayer(ctx, layer, s.charX, charY, flip);
            // 더러움 효과
            if (!s.isBathing) drawDirtyEffect(ctx, s.charX, charY, s.cleanliness);
          }

          // Draw food
          if (s.foodVisible) {
            drawFoodSmall(ctx, s.charX + SPRITE_PX + 4, CANVAS_H - SPRITE_PX - 16 + 50);
          }

          // Draw poops
          for (let i = 0; i < s.poopCount; i++) {
            drawPoopSmall(ctx, CANVAS_W - 36 - i * 28, CANVAS_H - 34);
          }

          // Sleep zzz
          if (s.animState === 'sleep' || s.isSleeping) {
            drawZzz(ctx, s.charX + SPRITE_PX - 10, CANVAS_H - SPRITE_PX - 16 - 5, Math.floor(tick / 20));
          }

          // 목욕 거품
          if (s.isBathing) {
            drawBathFoam(ctx, s.charX, CANVAS_H - SPRITE_PX - 16, tick);
          }

          // 밤 표시 (달 아이콘)
          if (isNightTime()) {
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('🌙', CANVAS_W - 6, 18);
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    const renderBreeding = (ctx: CanvasRenderingContext2D, tick: number, s: GameState) => {
      const bp = breedPhaseRef.current;

      if (bp === 'pick' || bp === 'hearts') {
        const cands = candidatesRef.current;
        const maturity = getMaturityInfoRef.current();

        if (!maturity.ready) {
          // Show requirements
          ctx.fillStyle = '#444';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('아직 준비가 안 됐어요!', CANVAS_W / 2, 30);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#666';
          const feedOk = maturity.feeds >= maturity.minFeeds;
          const playOk = maturity.plays >= maturity.minPlays;
          const statOk = s.hunger >= maturity.minStats && s.happiness >= maturity.minStats && s.cleanliness >= maturity.minStats;
          ctx.fillStyle = feedOk ? '#4a4' : '#a44';
          ctx.fillText(`${feedOk ? '✅' : '❌'} 밥 ${maturity.feeds}/${maturity.minFeeds}번 주기`, CANVAS_W / 2, 60);
          ctx.fillStyle = playOk ? '#4a4' : '#a44';
          ctx.fillText(`${playOk ? '✅' : '❌'} 놀아주기 ${maturity.plays}/${maturity.minPlays}번`, CANVAS_W / 2, 80);
          ctx.fillStyle = statOk ? '#4a4' : '#a44';
          ctx.fillText(`${statOk ? '✅' : '❌'} 모든 스탯 50 이상`, CANVAS_W / 2, 100);
          ctx.fillStyle = '#888';
          ctx.font = '9px monospace';
          ctx.fillText('잘 키운 뒤에 교배할 수 있어요 🌱', CANVAS_W / 2, 130);
          ctx.fillText('탭: 돌아가기', CANVAS_W / 2, CANVAS_H - 10);
          ctx.textAlign = 'start';
          return;
        }

        if (bp === 'hearts') {
          // Hearts animation with selected partner
          const anim = animCacheRef.current;
          if (anim) {
            const layer = anim.idle.frames[0];
            drawLayer(ctx, layer, 20, CANVAS_H - SPRITE_PX - 30);
          }
          if (partnerLayerRef.current) {
            drawLayer(ctx, partnerLayerRef.current, CANVAS_W - SPRITE_PX - 20, CANVAS_H - SPRITE_PX - 30);
          }
          drawHearts(ctx, CANVAS_W / 2 - 20, CANVAS_H / 2, Math.floor(tick / 3));
          ctx.fillStyle = '#664444';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('💕 Love! 💕', CANVAS_W / 2, 20);
          ctx.textAlign = 'start';
        } else {
          // Show 3 candidates to pick
          ctx.fillStyle = '#444';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('짝꿍을 골라주세요!', CANVAS_W / 2, 16);
          ctx.textAlign = 'start';

          // Draw my pet small on top-left
          const anim = animCacheRef.current;
          if (anim) {
            const myLayer = anim.idle.frames[0];
            drawMiniCharacter(ctx, myLayer, 4, 22, 28);
            ctx.fillStyle = '#888';
            ctx.font = '8px monospace';
            ctx.fillText('나', 12, 54);
          }

          // Draw 3 candidates
          const candSize = 50;
          const gap = 12;
          const totalW = 3 * candSize + 2 * gap;
          const startX = (CANVAS_W - totalW) / 2;
          const candY = 60;

          for (let i = 0; i < cands.length; i++) {
            const cx = startX + i * (candSize + gap);
            // Highlight selected
            if (selectedCandRef.current === i) {
              ctx.fillStyle = '#ffe0e8';
              ctx.fillRect(cx - 3, candY - 3, candSize + 6, candSize + 22);
              ctx.strokeStyle = '#ff6688';
              ctx.lineWidth = 2;
              ctx.strokeRect(cx - 3, candY - 3, candSize + 6, candSize + 22);
            }
            drawMiniCharacter(ctx, cands[i].layer, cx, candY, candSize);

            // Trait hint icons
            const p = cands[i].phenotype;
            const hints: string[] = [];
            if (p.headpiece !== 'none') hints.push(p.headpiece === 'crown' ? '👑' : p.headpiece === 'ribbon' ? '🎀' : p.headpiece === 'horn' ? '🦄' : '🌸');
            if (p.earType !== 'none') hints.push(p.earType === 'bunny' ? '🐰' : p.earType === 'cat' ? '🐱' : '🐻');

            ctx.fillStyle = '#555';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(hints.join('') || '✨', cx + candSize / 2, candY + candSize + 12);
            ctx.textAlign = 'start';
          }

          ctx.fillStyle = '#888';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          if (selectedCandRef.current >= 0) {
            ctx.fillText('다시 탭: 교배 시작! 💝', CANVAS_W / 2, CANVAS_H - 8);
          } else {
            ctx.fillText('캐릭터를 탭해서 선택', CANVAS_W / 2, CANVAS_H - 8);
          }
          ctx.textAlign = 'start';
        }
      } else if (bp === 'egg' || bp === 'hatch') {
        const eggX = (CANVAS_W - SPRITE_PX) / 2;
        const eggY = (CANVAS_H - SPRITE_PX) / 2 - 10;
        if (bp === 'hatch') {
          drawSprite(ctx, EGG_CRACKED, eggX, eggY);
        } else {
          const frame = EGG[Math.floor(tick / 10) % EGG.length];
          drawSprite(ctx, frame, eggX, eggY);
        }
        ctx.fillStyle = '#444';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('알이 나타났어요!', CANVAS_W / 2, 18);
        ctx.textAlign = 'start';
      } else if (bp === 'result') {
        // Show child
        if (childLayerRef.current) {
          drawLayer(ctx, childLayerRef.current, (CANVAS_W - SPRITE_PX) / 2, CANVAS_H - SPRITE_PX - 30);
        }
        ctx.fillStyle = '#444';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 아기가 태어났어요!', CANVAS_W / 2, 18);
        ctx.font = '10px monospace';
        ctx.fillText('탭: 이 아이를 키우기', CANVAS_W / 2, 34);
        ctx.textAlign = 'start';
      }
    };

    const renderFamilyTree = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#444';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('📜 족보', CANVAS_W / 2, 16);
      ctx.textAlign = 'start';

      const family = familyRef.current;
      if (family.members.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('아직 기록이 없어요', CANVAS_W / 2, CANVAS_H / 2);
        ctx.textAlign = 'start';
        return;
      }

      // Build a lookup map for member positions
      const memberMap = new Map<string, FamilyMember>();
      for (const m of family.members) memberMap.set(m.id, m);

      // Group by generation
      const gens: Record<number, FamilyMember[]> = {};
      for (const m of family.members) {
        const g = m.generation;
        if (!gens[g]) gens[g] = [];
        gens[g].push(m);
      }

      const genKeys = Object.keys(gens).map(Number).sort((a, b) => a - b).slice(-4);
      const CHAR_SIZE = 26;
      const ROW_HEIGHT = 42;
      const startY = 28;

      // Track each member's rendered center position for drawing lines
      const positions = new Map<string, { cx: number; cy: number }>();

      // First pass: draw characters and record positions
      for (let gi = 0; gi < genKeys.length; gi++) {
        const g = genKeys[gi];
        const members = gens[g];
        const y = startY + gi * ROW_HEIGHT;
        const count = Math.min(members.length, 5);
        const totalWidth = count * (CHAR_SIZE + 8) - 8;
        const offsetX = (CANVAS_W - totalWidth) / 2;

        // Generation label
        ctx.fillStyle = '#888';
        ctx.font = '8px monospace';
        ctx.textAlign = 'start';
        ctx.fillText(`${g}세대`, 2, y + CHAR_SIZE / 2 + 3);

        for (let i = 0; i < count; i++) {
          const m = members[i];
          const pheno = getPhenotype(m.genome);
          const layer = buildCharacterLayers(pheno);
          const x = offsetX + i * (CHAR_SIZE + 8);
          drawMiniCharacter(ctx, layer, x, y, CHAR_SIZE);

          // Store center position
          const cx = x + CHAR_SIZE / 2;
          const cy = y + CHAR_SIZE / 2;
          positions.set(m.id, { cx, cy });
        }
      }

      // Second pass: draw connection lines from parents to children
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1.5;
      for (const m of family.members) {
        if (!m.parentIds) continue;
        const childPos = positions.get(m.id);
        if (!childPos) continue;

        const [p1Id, p2Id] = m.parentIds;
        const p1Pos = positions.get(p1Id);
        const p2Pos = positions.get(p2Id);

        if (p1Pos && p2Pos) {
          // Draw horizontal line between parents
          const midY = p1Pos.cy + CHAR_SIZE / 2 + 3;
          ctx.beginPath();
          ctx.moveTo(p1Pos.cx, p1Pos.cy + CHAR_SIZE / 2);
          ctx.lineTo(p1Pos.cx, midY);
          ctx.lineTo(p2Pos.cx, midY);
          ctx.lineTo(p2Pos.cx, p2Pos.cy + CHAR_SIZE / 2);
          ctx.stroke();

          // Draw ❤ between parents
          const heartX = (p1Pos.cx + p2Pos.cx) / 2;
          ctx.fillStyle = '#ff6688';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('❤', heartX, midY - 1);
          ctx.textAlign = 'start';

          // Vertical line down to child
          ctx.beginPath();
          ctx.moveTo(heartX, midY + 2);
          ctx.lineTo(childPos.cx, childPos.cy - CHAR_SIZE / 2);
          ctx.stroke();
        } else if (p1Pos || p2Pos) {
          // Only one parent visible — draw single line
          const pPos = p1Pos || p2Pos;
          if (pPos) {
            ctx.beginPath();
            ctx.moveTo(pPos.cx, pPos.cy + CHAR_SIZE / 2);
            ctx.lineTo(childPos.cx, childPos.cy - CHAR_SIZE / 2);
            ctx.stroke();
          }
        }
      }

      // Tap hint
      ctx.fillStyle = '#aaa';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('탭하여 돌아가기', CANVAS_W / 2, CANVAS_H - 6);
      ctx.textAlign = 'start';
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Canvas tap handler (with coordinates for candidate selection)
  const handleCanvasTap = useCallback((e?: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;

    // Breeding mode tap
    if (uiModeRef.current === 'breeding') {
      const bp = breedPhaseRef.current;
      if (bp === 'pick') {
        const { ready } = getMaturityInfo();
        if (!ready) {
          setUiMode('main');
          uiModeRef.current = 'main';
          return;
        }

        const cands = candidatesRef.current;
        if (cands.length === 0) return;

        // Determine which candidate was tapped using click coordinates
        if (e && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const scaleX = CANVAS_W / rect.width;
          const clickX = (e.clientX - rect.left) * scaleX;
          const clickY = (e.clientY - rect.top) * (CANVAS_H / rect.height);

          // Candidate hit areas (matching render positions)
          const candSize = 50;
          const gap = 12;
          const totalW = 3 * candSize + 2 * gap;
          const startX = (CANVAS_W - totalW) / 2;
          const candY = 60;

          for (let i = 0; i < cands.length; i++) {
            const cx = startX + i * (candSize + gap);
            if (clickX >= cx - 5 && clickX <= cx + candSize + 5 && clickY >= candY - 5 && clickY <= candY + candSize + 20) {
              if (selectedCandRef.current === i) {
                // Second tap on same = start breeding!
                const chosen = cands[i];
                setPartnerGenome(chosen.genome);
                partnerLayerRef.current = chosen.layer;
                setBreedPhase('hearts');
                breedPhaseRef.current = 'hearts';
                breedTimerRef.current = 60;
                setTimeout(() => {
                  setBreedPhase('egg');
                  breedPhaseRef.current = 'egg';
                  setTimeout(() => {
                    setBreedPhase('hatch');
                    breedPhaseRef.current = 'hatch';
                    if (s.genome && chosen.genome) {
                      const cGenome = breed(s.genome, chosen.genome);
                      const cPheno = getPhenotype(cGenome);
                      setChildGenome(cGenome);
                      setChildPhenotype(cPheno);
                      childLayerRef.current = buildCharacterLayers(cPheno, 'infant');
                      setTimeout(() => {
                        setBreedPhase('result');
                        breedPhaseRef.current = 'result';
                      }, 1000);
                    }
                  }, 1500);
                }, 1500);
              } else {
                // First tap = select this candidate
                setSelectedCandidate(i);
                selectedCandRef.current = i;
              }
              return;
            }
          }
        }
        return;
      } else if (bp === 'result' && childGenome) {
        // Adopt child
        const family = familyRef.current;
        const childId = generateId();
        const partnerId = generateId();
        const newGen = (s.generation || 1) + 1;

        // Save partner as a family member too (so tree can draw both parents)
        if (partnerGenome) {
          const partnerPheno = getPhenotype(partnerGenome);
          const partnerMember: FamilyMember = {
            id: partnerId,
            genome: partnerGenome,
            phenotype: partnerPheno,
            generation: s.generation || 1,
            parentIds: null,
            name: `파트너`,
            birthTime: Date.now(),
          };
          family.members.push(partnerMember);
        }

        const childMember: FamilyMember = {
          id: childId,
          genome: childGenome,
          phenotype: childPhenotype!,
          generation: newGen,
          parentIds: [s.currentPetId || 'unknown', partnerId],
          name: `Gen${newGen}`,
          birthTime: Date.now(),
        };
        family.members.push(childMember);

        // Update traits
        const traits = countTraits(childPhenotype!);
        for (const t of traits) {
          if (!family.discoveredTraits.includes(t)) {
            family.discoveredTraits.push(t);
          }
        }
        saveFamilyData(family);
        setTraitCount(family.discoveredTraits.length);

        // Switch to child — reset maturity so they need raising again
        s.genome = childGenome;
        s.currentPetId = childId;
        s.generation = newGen;
        s.hunger = 80;
        s.happiness = 80;
        s.cleanliness = 100;
        s.poopCount = 0;
        s.charX = 80;
        s.totalFeeds = 0;
        s.totalPlays = 0;
        s.totalBaths = 0;
        s.bornAt = Date.now();
        setBathCount(0);
        s.growthStage = 'infant';  // 교배 자식 → 유아기
        s.ageInSeconds = 0;
        s.isDead = false;
        s.isSleeping = false;
        s.mood = 'happy';
        setGrowthStage('infant');
        setIsDead(false);
        setGeneration(newGen);
        // animCache를 먼저 infant로 교체한 후 메인으로 전환
        rebuildAnimCache(childGenome, 'infant');
        animCacheRef.current = buildAnimationFrames(getPhenotype(childGenome), 'infant');
        saveState(s);

        // Return to main
        setUiMode('main');
        uiModeRef.current = 'main';
        setBreedPhase('pick');
        breedPhaseRef.current = 'pick';
        setPartnerGenome(null);
        setChildGenome(null);
        setChildPhenotype(null);
        partnerLayerRef.current = null;
        childLayerRef.current = null;
      }
      return;
    }

    // Family tree tap — go back
    if (uiModeRef.current === 'familyTree') {
      setUiMode('main');
      uiModeRef.current = 'main';
      return;
    }

    // Egg phase
    if (s.phase !== 'egg') return;
    s.tapCount++;
    setShakeClass('animate-shake');
    setTimeout(() => setShakeClass(''), 300);

    if (s.tapCount >= 4) {
      s.eggCracked = true;
    }
    if (s.tapCount >= 5) {
      setTimeout(() => {
        // Generate genome for first pet
        const genome = createRandomGenome();
        const pheno = getPhenotype(genome);
        const petId = generateId();

        s.phase = 'alive';
        s.growthStage = 'infant';  // 알 → 유아기
        s.ageInSeconds = 0;
        s.hatched = true;
        s.lastPoopTime = Date.now();
        s.genome = genome;
        s.currentPetId = petId;
        s.generation = 1;
        s.isDead = false;
        s.isSleeping = false;
        s.mood = 'happy';

        // Add to family
        const family = familyRef.current;
        family.members.push({
          id: petId,
          genome,
          phenotype: pheno,
          generation: 1,
          parentIds: null,
          name: 'Gen1',
          birthTime: Date.now(),
        });

        const traits = countTraits(pheno);
        for (const t of traits) {
          if (!family.discoveredTraits.includes(t)) {
            family.discoveredTraits.push(t);
          }
        }
        saveFamilyData(family);
        setTraitCount(family.discoveredTraits.length);

        rebuildAnimCache(genome, 'infant');
        setPhase('alive');
        setGrowthStage('infant');
        setGeneration(1);
        saveState(s);
      }, 500);
    }
  }, [partnerGenome, childGenome, childPhenotype, rebuildAnimCache]);

  // Action handlers
  const handleFeed = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || s.actionAnim || uiMode !== 'main' || s.isDead || s.isSleeping) return;
    s.actionAnim = 'eat';
    s.actionTimer = 90;
    s.foodVisible = true;
    s.hunger = Math.min(100, s.hunger + 20);
    s.totalFeeds = (s.totalFeeds || 0) + 1;
    s.animFrame = 0;
    s.speechBubble = '냠냠 맛있어! 😋';
    s.speechTimer = 80;
    setSpeechBubble('냠냠 맛있어! 😋');
    setStats(prev => ({ ...prev, hunger: s.hunger }));
  }, [uiMode]);

  const handleClean = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || uiMode !== 'main' || s.isDead) return;
    setSubMenu('clean');
  }, [uiMode]);

  const handlePlay = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || s.actionAnim || uiMode !== 'main' || s.isDead || s.isSleeping) return;
    setSubMenu('play');
  }, [uiMode]);

  // 산책
  const handleWalk = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || s.isDead || s.isSleeping) return;
    s.actionAnim = 'happy';
    s.actionTimer = 180;
    s.happiness = Math.min(100, s.happiness + 15);
    s.totalPlays = (s.totalPlays || 0) + 1;
    s.background = 'walk';
    s.animFrame = 0;
    s.speechBubble = '산책 중~ 🌿';
    s.speechTimer = 80;
    setSpeechBubble('산책 중~ 🌿');
    setStats(prev => ({ ...prev, happiness: s.happiness }));
    setSubMenu('none');
  }, []);

  // 여행
  const handleTravel = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || s.isDead || s.isSleeping) return;
    s.actionAnim = 'happy';
    s.actionTimer = 180;
    s.happiness = Math.min(100, s.happiness + 25);
    s.totalPlays = (s.totalPlays || 0) + 1;
    s.background = 'travel';
    s.animFrame = 0;
    s.speechBubble = '바다다!! 🌊';
    s.speechTimer = 80;
    setSpeechBubble('바다다!! 🌊');
    setStats(prev => ({ ...prev, happiness: s.happiness }));
    setSubMenu('none');
  }, []);


  // 놀이터
  const handlePlayground = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || s.isDead || s.isSleeping) return;
    s.actionAnim = 'happy';
    s.actionTimer = 180;
    s.happiness = Math.min(100, s.happiness + 20);
    s.totalPlays = (s.totalPlays || 0) + 1;
    s.background = 'playground';
    s.animFrame = 0;
    s.speechBubble = '모래놀이 최고!! 🏖️';
    s.speechTimer = 80;
    setSpeechBubble('모래놀이 최고!! 🏖️');
    setStats(prev => ({ ...prev, happiness: s.happiness }));
    setSubMenu('none');
  }, []);

  // 목욕
  const handleBath = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || s.isDead) return;
    s.isBathing = true;
    s.bathTimer = 200;
    s.background = 'bath';
    s.animState = 'happy';
    s.totalBaths = (s.totalBaths || 0) + 1;
    setBathCount(s.totalBaths);
    s.speechBubble = '목욕하자~ 🛁';
    s.speechTimer = 80;
    setSpeechBubble('목욕하자~ 🛁');
    setSubMenu('none');
  }, []);

  // 응가 치우기
  const handlePoop = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || uiMode !== 'main' || s.isDead) return;
    if (s.poopCount > 0) {
      s.poopCount = 0;
      s.cleanliness = Math.min(100, s.cleanliness + 20);
      s.speechBubble = '깨끗해졌다! ✨';
      s.speechTimer = 80;
      setSpeechBubble('깨끗해졌다! ✨');
      setStats(prev => ({ ...prev, cleanliness: s.cleanliness }));
    }
    setSubMenu('none');
  }, [uiMode]);

  const handleBreed = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'alive' || !s.genome) return;

    // 아기 상태면 교배 불가
    if (s.growthStage === 'infant') {
      s.speechBubble = '아직 아기예요! 🍼';
      s.speechTimer = 100;
      setSpeechBubble('아직 아기예요! 🍼');
      return;
    }

    const { ready } = getMaturityInfo();
    if (!ready) {
      // Show breeding mode with requirements screen
      setCandidates([]);
      setSelectedCandidate(-1);
      setBreedPhase('pick');
      breedPhaseRef.current = 'pick';
      setUiMode('breeding');
      uiModeRef.current = 'breeding';
      return;
    }

    // Generate 3 partner candidates — 현재 캐릭터 타입 제외
    const currentChar = stateRef.current.genome
      ? getPhenotype(stateRef.current.genome).baseChar
      : '';
    const allChars = ['kitty', 'melody', 'kuromi', 'purin', 'takoyaki',
                      'ninja', 'sheep', 'cherry', 'sushi', 'icecream', 'robot'] as const;
    const otherChars = allChars.filter(c => c !== currentChar);
    // 다른 타입 3개 (중복 없이) 셔플해서 뽑기
    const shuffled = [...otherChars].sort(() => Math.random() - 0.5);
    const pickedTypes = shuffled.slice(0, 3);
    const allColors = ['white', 'pink', 'black', 'yellow', 'purple', 'brown'] as const;
    const cands = pickedTypes.map(charType => {
      const gender = (charType === 'purin' || charType === 'takoyaki' || charType === 'ninja' || charType === 'sushi' || charType === 'robot') ? 'male' : 'female';
      const g = createSanrioGenome(charType, gender as 'female' | 'male');
      // 색상 유전자를 랜덤으로 섞어줌 (dominant는 캐릭터 고유색, recessive는 랜덤)
      const randomColor = allColors[Math.floor(Math.random() * allColors.length)];
      g.bodyColor = { dominant: g.bodyColor.dominant, recessive: randomColor };
      const p = getPhenotype(g);
      const l = buildCharacterLayers(p);
      return { genome: g, phenotype: p, layer: l };
    });
    setCandidates(cands);
    setSelectedCandidate(-1);
    setPartnerGenome(null);
    partnerLayerRef.current = null;
    setBreedPhase('pick');
    breedPhaseRef.current = 'pick';
    setUiMode('breeding');
    uiModeRef.current = 'breeding';
  }, [getMaturityInfo]);

  const handleFamilyTree = useCallback(() => {
    setUiMode('familyTree');
    uiModeRef.current = 'familyTree';
  }, []);

  const handleReset = useCallback(() => {
    resetState();
    const s = defaultState();
    stateRef.current = s;
    animCacheRef.current = null;
    familyRef.current = { members: [], discoveredTraits: [] };
    saveFamilyData(familyRef.current);
    setPhase('egg');
    setGrowthStage('egg');
    setIsDead(false);
    setGeneration(1);
    setUiMode('main');
    uiModeRef.current = 'main';
    setStats({ hunger: s.hunger, happiness: s.happiness, cleanliness: s.cleanliness });
    setTraitCount(0);
  }, []);

  const handleBack = useCallback(() => {
    setUiMode('main');
    uiModeRef.current = 'main';
    setBreedPhase('pick');
    breedPhaseRef.current = 'pick';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-blue-100 p-4">
      <div className="relative bg-gradient-to-b from-rose-200 to-rose-300 rounded-[40px] p-6 shadow-2xl border-4 border-rose-400 max-w-[340px] w-full">
        {/* Top decoration */}
        <div className="flex justify-center mb-3">
          <div className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-400 mx-1" />
          <div className="w-3 h-3 rounded-full bg-green-300 border border-green-400 mx-1" />
          <div className="w-3 h-3 rounded-full bg-blue-300 border border-blue-400 mx-1" />
        </div>

        {/* LCD Screen */}
        <div className="bg-gray-800 rounded-2xl p-3 shadow-inner">
          {/* Stats bar */}
          {phase === 'alive' && uiMode === 'main' && (
            <div className="flex justify-between mb-2 px-1 text-xs gap-1">
              <StatBar label="🍖" value={stats.hunger} color="bg-orange-400" />
              <StatBar label="💛" value={stats.happiness} color="bg-yellow-400" />
              <StatBar label="✨" value={stats.cleanliness} color="bg-cyan-400" />
            </div>
          )}

          {/* Generation & Traits & Gender & GrowthStage badge */}
          {phase === 'alive' && uiMode === 'main' && (() => {
            const s = stateRef.current;
            const pheno = s.genome ? getPhenotype(s.genome) : null;
            const genderLabel = pheno?.gender === 'female' ? '♀' : pheno?.gender === 'male' ? '♂' : '';
            const genderColor = pheno?.gender === 'female' ? 'text-pink-400' : pheno?.gender === 'male' ? 'text-blue-400' : 'text-gray-400';
            const stageLabel = growthStage === 'infant' ? '👶 유아기' : growthStage === 'teen' ? '😤 반항기' : '🌟 성체';
            const stageColor = growthStage === 'infant' ? 'text-yellow-300' : growthStage === 'teen' ? 'text-orange-300' : 'text-green-300';
            return (
              <div className="flex justify-between items-center px-1 mb-1">
                <span className="text-[10px] text-green-300 font-mono">Gen {generation}</span>
                <span className={`text-[10px] font-mono ${stageColor}`}>{stageLabel}</span>
                {genderLabel && (
                  <span className={`text-[13px] font-bold ${genderColor}`}>{genderLabel}</span>
                )}
                <span className="text-[10px] text-yellow-300 font-mono">🏆 {traitCount}</span>
              </div>
            );
          })()}

          {/* Back button for sub-modes */}
          {uiMode !== 'main' && (
            <button
              onClick={handleBack}
              className="text-[10px] text-green-300 font-mono mb-1 hover:text-green-100"
            >
              ← 돌아가기
            </button>
          )}

          {/* 말풍선 */}
          {speechBubble && phase === 'alive' && uiMode === 'main' && (
            <div className="flex justify-center mb-1">
              <div className="bg-white text-gray-800 text-[11px] font-bold px-3 py-1 rounded-full shadow relative">
                {speechBubble}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
              </div>
            </div>
          )}

          {/* 사망 오버레이 */}
          {isDead && phase === 'alive' && uiMode === 'main' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-3xl z-10">
              <div className="text-4xl mb-2">👻</div>
              <div className="text-white text-sm font-bold mb-1">떠나갔어요...</div>
              <div className="text-gray-300 text-[10px] mb-3">잘 돌봐주지 못해서 미안해 ㅠ</div>
              <button
                onClick={() => {
                  resetState();
                  const s = defaultState();
                  stateRef.current = s;
                  setPhase('egg');
                  setGrowthStage('egg');
                  setIsDead(false);
                  setSpeechBubble(null);
                  setStats({ hunger: 80, happiness: 80, cleanliness: 100 });
                  setGeneration(1);
                }}
                className="bg-green-500 text-white text-xs px-4 py-1.5 rounded-full font-bold hover:bg-green-400"
              >
                새 알 받기 🥚
              </button>
            </div>
          )}

          <div className={`flex justify-center ${shakeClass} relative`}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="rounded-lg border-2 border-gray-600 cursor-pointer"
              style={{ imageRendering: 'pixelated', width: '100%', maxWidth: '256px' }}
              onClick={handleCanvasTap}
            />
          </div>

          {phase === 'egg' && uiMode === 'main' && (
            <p className="text-center text-green-300 text-xs mt-2 font-mono">
              Tap the egg! ({stateRef.current.tapCount}/5)
            </p>
          )}
          {(growthStage === 'infant' || growthStage === 'teen') && phase === 'alive' && uiMode === 'main' && (
            <p className="text-center text-yellow-300 text-[10px] mt-1 font-mono">
              {growthStage === 'infant'
                    ? `🍼 밥 ${stateRef.current.totalFeeds}/${INFANT_TO_TEEN_FEEDS} · 놀기 ${stateRef.current.totalPlays}/${INFANT_TO_TEEN_PLAYS}`
                    : growthStage === 'teen'
                    ? `😤 밥 ${stateRef.current.totalFeeds}/${TEEN_TO_ADULT_FEEDS} · 놀기 ${stateRef.current.totalPlays}/${TEEN_TO_ADULT_PLAYS} · 🛁 ${bathCount}/2`
                    : ''}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <DeviceButton onClick={handleFeed} label="🍖" sublabel="밥주기" />
          <DeviceButton onClick={handleClean} label="🧹" sublabel="청소" />
          <DeviceButton onClick={handlePlay} label="🎮" sublabel="놀기" />
        </div>

        {/* 놀기 서브메뉴 */}
        {subMenu === 'play' && (
          <div className="flex justify-center gap-3 mt-2 animate-pulse-once">
            <button
              onClick={handleWalk}
              className="flex flex-col items-center gap-1 bg-green-800 rounded-xl px-3 py-2 border border-green-500"
            >
              <span className="text-xl">🌿</span>
              <span className="text-[10px] text-green-300 font-mono">산책</span>
            </button>
            <button
              onClick={handleTravel}
              className="flex flex-col items-center gap-1 bg-blue-800 rounded-xl px-3 py-2 border border-blue-400"
            >
              <span className="text-xl">🌊</span>
              <span className="text-[10px] text-blue-300 font-mono">여행</span>
            </button>
            <button
              onClick={handlePlayground}
              className="flex flex-col items-center gap-1 bg-yellow-800 rounded-xl px-3 py-2 border border-yellow-500"
            >
              <span className="text-xl">🏖️</span>
              <span className="text-[10px] text-yellow-300 font-mono">놀이터</span>
            </button>
            <button
              onClick={() => setSubMenu('none')}
              className="flex flex-col items-center gap-1 bg-gray-700 rounded-xl px-3 py-2 border border-gray-500"
            >
              <span className="text-xl">✖️</span>
              <span className="text-[10px] text-gray-300 font-mono">취소</span>
            </button>
          </div>
        )}

        {/* 청소 서브메뉴 */}
        {subMenu === 'clean' && (
          <div className="flex justify-center gap-3 mt-2">
            <button
              onClick={handleBath}
              className="flex flex-col items-center gap-1 bg-cyan-800 rounded-xl px-3 py-2 border border-cyan-400"
            >
              <span className="text-xl">🛁</span>
              <span className="text-[10px] text-cyan-300 font-mono">목욕</span>
            </button>
            <button
              onClick={handlePoop}
              className="flex flex-col items-center gap-1 bg-amber-900 rounded-xl px-3 py-2 border border-amber-600"
            >
              <span className="text-xl">💩</span>
              <span className="text-[10px] text-amber-300 font-mono">응가치우기</span>
            </button>
            <button
              onClick={() => setSubMenu('none')}
              className="flex flex-col items-center gap-1 bg-gray-700 rounded-xl px-3 py-2 border border-gray-500"
            >
              <span className="text-xl">✖️</span>
              <span className="text-[10px] text-gray-300 font-mono">취소</span>
            </button>
          </div>
        )}

        {/* New buttons row */}
        {phase === 'alive' && (
          <div className="flex justify-center gap-4 mt-2">
            <DeviceButton
              onClick={handleBreed}
              label="💝"
              sublabel={growthStage !== 'adult' ? '아직아기' : '짝꿍'}
              disabled={growthStage === 'infant' || growthStage === 'teen'}
            />
            <DeviceButton onClick={handleFamilyTree} label="📜" sublabel="족보" />
          </div>
        )}

        {/* Reset */}
        <div className="flex justify-center mt-3">
          <button
            onClick={handleReset}
            className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-purple-400 font-mono">🥚 Tamagotchi Web v2 🥚</p>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px) rotate(-2deg); }
          40% { transform: translateX(4px) rotate(2deg); }
          60% { transform: translateX(-3px) rotate(-1deg); }
          80% { transform: translateX(3px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <div className="flex-1 bg-gray-600 rounded-full h-2 overflow-hidden">
          <div
            className={`${color} h-full rounded-full transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DeviceButton({ onClick, label, sublabel, disabled }: { onClick: () => void; label: string; sublabel: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 border-2 border-gray-400 shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform group-hover:from-white group-hover:to-gray-200">
        {label}
      </div>
      <span className="text-xs text-rose-600 font-mono">{sublabel}</span>
    </button>
  );
}
