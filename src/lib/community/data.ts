export type CommunityKind = 'Heroes' | 'Materials' | 'Skills';
export type BuildCategory = 'General' | 'Campaign' | 'Boss' | 'Farming' | 'Speed Farm' | 'Beginner' | 'Endgame';
export type BuildSort = 'top' | 'trending' | 'new';
export type TierLabel = 'S' | 'A' | 'B' | 'C' | 'D';

export interface CommunityEntity {
  slug: string;
  name: string;
  image: string | null;
  href: string;
}

export interface GuideRecord {
  slug: string;
  locale: 'en';
  title: string;
  author: string;
  published: string;
  summary: string;
  image: string | null;
  initial: string;
}

export interface BuildHero {
  slug: string;
  level: number;
}

export interface BuildRecord {
  id: string;
  slug: string;
  title: string;
  author: string;
  published: string;
  category: BuildCategory;
  version: 'v1.00.17';
  summary: string;
  score: number;
  trending: number;
  heroes: readonly BuildHero[];
}

export interface TierListRecord {
  slug: string;
  title: string;
  description: string;
  author: string;
  published: string;
  kind: CommunityKind;
  version: 'v1.00.17';
  score: number;
  heroSlugs: readonly string[];
  tiers?: Readonly<Record<TierLabel, readonly string[]>>;
}

export interface BuildFilter {
  sort: BuildSort;
  version: 'all' | 'v1.00.17';
  query: string;
  category: 'all' | BuildCategory;
  heroSlug: 'all' | string;
  minLevel: number | null;
  maxLevel: number | null;
}

export const GUIDE_RECORDS: readonly GuideRecord[] = Object.freeze([
  Object.freeze({ slug: 'ranger-archer-solo-build-guide', locale: 'en', title: 'Ranger(Archer) SOLO build guide', author: 'PhMestre', published: 'Jul 2, 2026', summary: 'Solo Explorer Archer optimization for late game 80+, including attributes, equipment, customization and skills.', image: '/game/community/guide-ranger-solo.png', initial: 'R' }),
  Object.freeze({ slug: 'attack-speed', locale: 'en', title: 'Attack Speed', author: 'DarkfizzTV', published: 'Jun 27, 2026', summary: 'Push Attack Speed first, then stack Projectile and Physical Damage with Critical Chance.', image: null, initial: 'A' }),
  Object.freeze({ slug: 'f2p-early-game', locale: 'en', title: 'F2P guide for early game', author: 'Marcos Valadão', published: 'Jun 10, 2026', summary: 'A practical free-to-play route through early heroes, gear and farming decisions.', image: null, initial: 'F' }),
  Object.freeze({ slug: 'beginners-survival-guide', locale: 'en', title: "Beginner's Survival Guide", author: 'KuAng Yũ', published: 'Jun 5, 2026', summary: 'Beginner-friendly formation, Cube, pets, farming and rune-tree fundamentals.', image: null, initial: 'B' })
]);

const build = (record: BuildRecord): BuildRecord => Object.freeze({
  ...record,
  heroes: Object.freeze(record.heroes.map((hero) => Object.freeze({ ...hero })))
});

export const BUILD_RECORDS: readonly BuildRecord[] = Object.freeze([
  build({ id: '3338', slug: 'lv70', title: 'LV70', author: 'Luis Enrique Bacallao Rodríguez', published: 'Jun 21, 2026', category: 'General', version: 'v1.00.17', summary: 'A reliable three-hero farming and progression setup.', score: 854, trending: 88, heroes: [{ slug: 'priest', level: 72 }, { slug: 'sorcerer', level: 72 }, { slug: 'ranger', level: 73 }] }),
  build({ id: '3339', slug: 'level-80-endgame-build', title: 'LEVEL 80 ENDGAME BUILD', author: 'Miraç Furkan Çimen', published: 'Jun 21, 2026', category: 'General', version: 'v1.00.17', summary: 'Creative endgame setup for three heroes.', score: 728, trending: 96, heroes: [{ slug: 'ranger', level: 91 }, { slug: 'priest', level: 90 }, { slug: 'sorcerer', level: 90 }] }),
  build({ id: '3340', slug: 'end-game-fast-farm', title: 'END GAME 3-9 / FAST FARM', author: 'Carry', published: 'Jun 21, 2026', category: 'Endgame', version: 'v1.00.17', summary: 'Fast farm 3-9 with step-by-step retained hero benchmarks.', score: 541, trending: 100, heroes: [{ slug: 'sorcerer', level: 100 }, { slug: 'ranger', level: 100 }, { slug: 'priest', level: 100 }] }),
  build({ id: '3341', slug: 'priest-tank-sorc-aoe', title: 'MID GAME — PRIEST TANK, SORC AOE, RANGER MAIN DPS', author: 'kuga', published: 'Jun 15, 2026', category: 'Farming', version: 'v1.00.17', summary: 'A mid-game benchmark that adapts to the items you own.', score: 399, trending: 72, heroes: [{ slug: 'priest', level: 50 }, { slug: 'sorcerer', level: 50 }, { slug: 'ranger', level: 50 }] }),
  build({ id: '3342', slug: 'beginner-level-30', title: 'Lv30 Priest Ranger Sorcerer', author: 'Marcos Valadão', published: 'Jun 10, 2026', category: 'Beginner', version: 'v1.00.17', summary: 'A compact beginner campaign formation.', score: 306, trending: 54, heroes: [{ slug: 'priest', level: 30 }, { slug: 'ranger', level: 30 }, { slug: 'sorcerer', level: 30 }] }),
  build({ id: '3343', slug: 'solo-ranger-cheap', title: 'Solo Ranger Build (Cheap)', author: 'brick bubbles', published: 'Jun 21, 2026', category: 'Speed Farm', version: 'v1.00.17', summary: 'A budget solo Ranger route for fast farming.', score: 199, trending: 81, heroes: [{ slug: 'ranger', level: 65 }] })
]);

const tier = (record: TierListRecord): TierListRecord => Object.freeze({
  ...record,
  heroSlugs: Object.freeze([...record.heroSlugs]),
  tiers: record.tiers ? Object.freeze(Object.fromEntries(Object.entries(record.tiers).map(([key, value]) => [key, Object.freeze([...value])]))) as Readonly<Record<TierLabel, readonly string[]>> : undefined
});

export const TIER_LIST_RECORDS: readonly TierListRecord[] = Object.freeze([
  tier({ slug: 'mid-end', title: 'Mid - End', description: 'Focus on Ranger, Rapid Fire and movement speed; use Priest as tank and Sorcerer as the third slot.', author: 'laviR', published: 'Jul 15, 2026', kind: 'Heroes', version: 'v1.00.17', score: 148, heroSlugs: ['ranger', 'priest', 'sorcerer'] }),
  tier({ slug: 'end-game', title: 'End Game', description: 'A compact four-hero late-game ranking.', author: 'potaotokid', published: 'Jul 14, 2026', kind: 'Heroes', version: 'v1.00.17', score: 45, heroSlugs: ['priest', 'ranger', 'hunter', 'sorcerer'] }),
  tier({ slug: 'real-tier-list', title: 'REAL TIER LIST (from player with 700 hours)', description: '', author: 'Дмитро Волченко', published: 'Jul 12, 2026', kind: 'Heroes', version: 'v1.00.17', score: 22, heroSlugs: ['ranger', 'sorcerer'] }),
  tier({ slug: 'general', title: 'General', description: 'Priest tank and heal, Ranger solo damage, Hunter burst, Sorcerer free-to-play area damage.', author: 'Hover536.', published: 'Jul 10, 2026', kind: 'Heroes', version: 'v1.00.17', score: 10, heroSlugs: ['priest', 'ranger', 'hunter', 'sorcerer'] }),
  tier({ slug: 'true-tier-list', title: 'True Tier List', description: '', author: 'Artem Arkhipov', published: 'Jul 9, 2026', kind: 'Heroes', version: 'v1.00.17', score: 4, heroSlugs: ['knight', 'ranger', 'sorcerer', 'priest'] }),
  tier({ slug: 'end-game-0u8p9', title: 'end game', description: 'Max dps & Max time efficiency', author: '5hut', published: 'Jul 16, 2026', kind: 'Heroes', version: 'v1.00.17', score: 0, heroSlugs: ['sorcerer', 'ranger', 'priest', 'hunter', 'knight', 'slayer'], tiers: { S: ['sorcerer', 'ranger', 'priest'], A: ['hunter'], B: ['knight', 'slayer'], C: [], D: [] } })
]);

function requireOptionalLevel(value: number | null, label: string): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value) || value < 0 || value > 999) throw new Error(`${label}: expected a level from 0 to 999`);
  return value;
}

export function filterBuilds(records: readonly BuildRecord[], filter: BuildFilter): BuildRecord[] {
  const min = requireOptionalLevel(filter.minLevel, 'minLevel');
  const max = requireOptionalLevel(filter.maxLevel, 'maxLevel');
  if (min !== null && max !== null && min > max) throw new Error(`minLevel ${min} cannot exceed maxLevel ${max}`);
  const query = filter.query.trim().toLowerCase();
  const rows = records.filter((record) => {
    if (filter.version !== 'all' && record.version !== filter.version) return false;
    if (filter.category !== 'all' && record.category !== filter.category) return false;
    if (filter.heroSlug !== 'all' && !record.heroes.some((hero) => hero.slug === filter.heroSlug)) return false;
    if (min !== null && !record.heroes.every((hero) => hero.level >= min)) return false;
    if (max !== null && !record.heroes.every((hero) => hero.level <= max)) return false;
    return !query || `${record.title} ${record.summary} ${record.author}`.toLowerCase().includes(query);
  });
  return [...rows].sort((left, right) => {
    if (filter.sort === 'trending') return right.trending - left.trending || right.score - left.score;
    if (filter.sort === 'new') return right.published.localeCompare(left.published) || right.score - left.score;
    return right.score - left.score || left.title.localeCompare(right.title);
  });
}

export function filterTierLists(records: readonly TierListRecord[], filter: { kind: CommunityKind; version: string }): TierListRecord[] {
  return records
    .filter((record) => record.kind === filter.kind && record.version === filter.version)
    .slice()
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
}
