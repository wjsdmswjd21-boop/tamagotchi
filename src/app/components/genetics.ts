// Genetics — 1세대는 산리오 캐릭터, 교배 후 파츠 조합

export interface Gene {
  dominant: string;
  recessive: string;
}

export interface Genome {
  // 파츠 유전자
  earType: Gene;    // 'kitty' | 'melody' | 'kuromi' | 'purin' | 'none'
  eyeType: Gene;    // 'kitty' | 'kuromi' | 'purin' | 'takoyaki'
  mouthType: Gene;  // 'smile' | 'dot3' | 'pout' | 'kuromi'
  headpiece: Gene;  // 'ribbon' | 'skullpin' | 'beret' | 'horn' | 'none'
  whiskers: Gene;   // 'yes' | 'no'
  sauce: Gene;      // 'yes' | 'no'
  bodyColor: Gene;  // 'white' | 'pink' | 'black' | 'yellow' | 'purple' | 'brown'
  bodyShape: Gene;  // 'round' | 'tall' | 'chubby'
  gender: Gene;     // 'female' | 'male'
  // 1세대 산리오 캐릭터 타입 (2세대부터는 'custom')
  baseChar: Gene;   // 'kitty' | 'melody' | 'kuromi' | 'purin' | 'takoyaki' | 'custom'
}

export interface Phenotype {
  earType: string;
  eyeType: string;
  mouthType: string;
  headpiece: string;
  whiskers: string;
  sauce: string;
  bodyColor: string;
  bodyShape: string;
  gender: string;
  baseChar: string; // 'kitty' | 'melody' | 'kuromi' | 'purin' | 'takoyaki' | 'custom'
}

export interface FamilyMember {
  id: string;
  genome: Genome;
  phenotype: Phenotype;
  generation: number;
  parentIds: [string, string] | null;
  name: string;
  birthTime: number;
}

const GENE_OPTIONS: Record<keyof Genome, string[]> = {
  earType:   ['kitty', 'melody', 'kuromi', 'purin', 'none'],
  eyeType:   ['kitty', 'kuromi', 'purin', 'takoyaki'],
  mouthType: ['smile', 'dot3', 'pout', 'kuromi'],
  headpiece: ['ribbon', 'skullpin', 'beret', 'horn', 'none'],
  whiskers:  ['yes', 'no'],
  sauce:     ['yes', 'no'],
  bodyColor: ['white', 'pink', 'black', 'yellow', 'purple', 'brown'],
  bodyShape: ['round', 'tall', 'chubby'],
  gender:    ['female', 'male'],
  baseChar:  ['kitty', 'melody', 'kuromi', 'purin', 'takoyaki',
              'ninja', 'sheep', 'cherry', 'sushi', 'icecream', 'robot', 'custom'],
};

// 산리오 캐릭터별 기본 파츠 세팅
const SANRIO_PRESETS: Record<string, Partial<Omit<Genome, 'gender' | 'baseChar'>>> = {
  kitty: {
    earType:   { dominant: 'kitty',   recessive: 'kitty' },
    eyeType:   { dominant: 'kitty',   recessive: 'kitty' },
    mouthType: { dominant: 'smile',   recessive: 'smile' },
    headpiece: { dominant: 'ribbon',  recessive: 'ribbon' },
    whiskers:  { dominant: 'yes',     recessive: 'yes' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'white',   recessive: 'white' },
    bodyShape: { dominant: 'round',   recessive: 'round' },
  },
  melody: {
    earType:   { dominant: 'melody',  recessive: 'melody' },
    eyeType:   { dominant: 'kitty',   recessive: 'kitty' },
    mouthType: { dominant: 'smile',   recessive: 'smile' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'pink',    recessive: 'pink' },
    bodyShape: { dominant: 'round',   recessive: 'round' },
  },
  kuromi: {
    earType:   { dominant: 'kuromi',  recessive: 'kuromi' },
    eyeType:   { dominant: 'kuromi',  recessive: 'kuromi' },
    mouthType: { dominant: 'kuromi',  recessive: 'kuromi' },
    headpiece: { dominant: 'skullpin',recessive: 'skullpin' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'black',   recessive: 'black' },
    bodyShape: { dominant: 'round',   recessive: 'round' },
  },
  purin: {
    earType:   { dominant: 'purin',   recessive: 'purin' },
    eyeType:   { dominant: 'purin',   recessive: 'purin' },
    mouthType: { dominant: 'smile',   recessive: 'smile' },
    headpiece: { dominant: 'beret',   recessive: 'beret' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'yellow',  recessive: 'yellow' },
    bodyShape: { dominant: 'chubby',  recessive: 'chubby' },
  },
  takoyaki: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'takoyaki',recessive: 'takoyaki' },
    mouthType: { dominant: 'dot3',    recessive: 'dot3' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'yes',     recessive: 'yes' },
    bodyColor: { dominant: 'brown',   recessive: 'brown' },
    bodyShape: { dominant: 'chubby',  recessive: 'chubby' },
  },
  // 새 캐릭터들
  ninja: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'kuromi',  recessive: 'kuromi' },
    mouthType: { dominant: 'pout',    recessive: 'pout' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'black',   recessive: 'black' },
    bodyShape: { dominant: 'tall',    recessive: 'tall' },
  },
  sheep: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'purin',   recessive: 'purin' },
    mouthType: { dominant: 'smile',   recessive: 'smile' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'white',   recessive: 'white' },
    bodyShape: { dominant: 'chubby',  recessive: 'chubby' },
  },
  cherry: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'kitty',   recessive: 'kitty' },
    mouthType: { dominant: 'smile',   recessive: 'smile' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'pink',    recessive: 'pink' },
    bodyShape: { dominant: 'round',   recessive: 'round' },
  },
  sushi: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'takoyaki',recessive: 'takoyaki' },
    mouthType: { dominant: 'dot3',    recessive: 'pout' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'white',   recessive: 'white' },
    bodyShape: { dominant: 'chubby',  recessive: 'chubby' },
  },
  icecream: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'kitty',   recessive: 'kitty' },
    mouthType: { dominant: 'smile',   recessive: 'smile' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'yellow',  recessive: 'pink' },
    bodyShape: { dominant: 'tall',    recessive: 'tall' },
  },
  robot: {
    earType:   { dominant: 'none',    recessive: 'none' },
    eyeType:   { dominant: 'kuromi',  recessive: 'kuromi' },
    mouthType: { dominant: 'pout',    recessive: 'pout' },
    headpiece: { dominant: 'none',    recessive: 'none' },
    whiskers:  { dominant: 'no',      recessive: 'no' },
    sauce:     { dominant: 'no',      recessive: 'no' },
    bodyColor: { dominant: 'yellow',  recessive: 'yellow' },
    bodyShape: { dominant: 'chubby',  recessive: 'chubby' },
  },
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 1세대 산리오 캐릭터 생성
export function createSanrioGenome(charType: 'kitty'|'melody'|'kuromi'|'purin'|'takoyaki'|'ninja'|'sheep'|'cherry'|'sushi'|'icecream'|'robot', gender: 'female'|'male'): Genome {
  const preset = SANRIO_PRESETS[charType];
  return {
    ...(preset as Omit<Genome, 'gender'|'baseChar'>),
    gender:   { dominant: gender,   recessive: gender },
    baseChar: { dominant: charType, recessive: charType },
  };
}

// 랜덤 1세대 생성 (성별에 따라 캐릭터 배정)
export function createRandomGenome(): Genome {
  const gender = Math.random() < 0.5 ? 'female' : 'male';
  const femaleChars = ['kitty', 'melody', 'kuromi', 'sheep', 'cherry', 'icecream'] as const;
  const maleChars   = ['purin', 'takoyaki', 'ninja', 'sushi', 'robot'] as const;
  const charType = gender === 'female'
    ? randomFrom(femaleChars)
    : randomFrom(maleChars);
  return createSanrioGenome(charType, gender);
}

export function express(gene: Gene): string {
  return gene.dominant;
}

export function getPhenotype(genome: Genome): Phenotype {
  return {
    earType:   express(genome.earType),
    eyeType:   express(genome.eyeType),
    mouthType: express(genome.mouthType),
    headpiece: express(genome.headpiece),
    whiskers:  express(genome.whiskers),
    sauce:     express(genome.sauce),
    bodyColor: express(genome.bodyColor),
    bodyShape: express(genome.bodyShape),
    gender:    express(genome.gender),
    baseChar:  express(genome.baseChar),
  };
}

function isAbsence(v: string): boolean {
  return v === 'none' || v === 'no';
}

function inheritGene(p1: Gene, p2: Gene): Gene {
  const fromP1 = Math.random() < 0.5 ? p1.dominant : p1.recessive;
  const fromP2 = Math.random() < 0.5 ? p2.dominant : p2.recessive;
  // 한쪽이 'none'/'no'이면 있는 쪽이 dominant로 올라감
  if (isAbsence(fromP1) && !isAbsence(fromP2)) {
    return { dominant: fromP2, recessive: fromP1 };
  }
  if (!isAbsence(fromP1) && isAbsence(fromP2)) {
    return { dominant: fromP1, recessive: fromP2 };
  }
  // 둘 다 있거나 둘 다 없으면 랜덤
  return Math.random() < 0.5
    ? { dominant: fromP1, recessive: fromP2 }
    : { dominant: fromP2, recessive: fromP1 };
}

export function breed(parent1: Genome, parent2: Genome): Genome {
  // 성별 유전
  const g1 = Math.random() < 0.5 ? parent1.gender.dominant : parent1.gender.recessive;
  const g2 = Math.random() < 0.5 ? parent2.gender.dominant : parent2.gender.recessive;
  const childGender: Gene = Math.random() < 0.5
    ? { dominant: g1, recessive: g2 }
    : { dominant: g2, recessive: g1 };

  const child: Genome = {
    earType:   inheritGene(parent1.earType,   parent2.earType),
    eyeType:   inheritGene(parent1.eyeType,   parent2.eyeType),
    mouthType: inheritGene(parent1.mouthType, parent2.mouthType),
    headpiece: inheritGene(parent1.headpiece, parent2.headpiece),
    whiskers:  inheritGene(parent1.whiskers,  parent2.whiskers),
    sauce:     inheritGene(parent1.sauce,     parent2.sauce),
    bodyColor: inheritGene(parent1.bodyColor, parent2.bodyColor),
    bodyShape: inheritGene(parent1.bodyShape, parent2.bodyShape),
    gender:    childGender,
    // 자식은 항상 custom (파츠 조합)
    baseChar:  { dominant: 'custom', recessive: 'custom' },
  };
  return mutate(child, 0.05);
}

export function mutate(genome: Genome, rate: number): Genome {
  const result = { ...genome };
  const keys = Object.keys(GENE_OPTIONS) as (keyof Genome)[];
  for (const key of keys) {
    if (key === 'gender' || key === 'baseChar') continue;
    if (Math.random() < rate) {
      const opts = GENE_OPTIONS[key];
      const mutated = randomFrom(opts);
      if (Math.random() < 0.5) {
        result[key] = { ...result[key], dominant: mutated };
      } else {
        result[key] = { ...result[key], recessive: mutated };
      }
    }
  }
  return result;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function countTraits(phenotype: Phenotype): string[] {
  return Object.values(phenotype).filter(v => v !== 'none' && v !== 'no' && v !== 'custom');
}
