import type { ContentRepository } from './repository.ts';
import type { ContentKind, ContentRecord } from './schema.ts';
import { NEWS, type NewsEntry } from './reference-data.ts';
import type { CubeOperationSlug } from '$lib/cube/data';

export interface ListRouteModel {
  type: 'list';
  path: string;
  title: string;
  kinds: ContentKind[];
  records: readonly ContentRecord[];
  variant: 'grid' | 'table' | 'map' | 'tree' | 'effects';
}

export interface DetailRouteModel {
  type: 'detail';
  path: string;
  title: string;
  record: ContentRecord;
}

export interface ReferenceRouteModel {
  type: 'reference';
  path: string;
  title: string;
  section: 'mechanics' | 'achievements' | 'news' | 'database';
}

export interface SearchRouteModel {
  type: 'search';
  path: '/search';
  title: 'Search';
}

export interface NewsDetailRouteModel {
  type: 'newsDetail';
  path: string;
  title: string;
  article: NewsEntry;
}

export interface Phase2RouteModel {
  type: 'phase2';
  path: string;
  title: string;
  section: 'cubeOverview' | 'cubeOperation' | 'saveInspector' | 'market' | 'inventoryValue' | 'farming' | 'bis' | 'damage' | 'cubeLeveling' | 'drops';
  operation?: CubeOperationSlug;
}

export interface Phase3RouteModel {
  type: 'phase3';
  path: string;
  title: string;
  section:
    | 'login'
    | 'privacy'
    | 'guides'
    | 'guideDetail'
    | 'builds'
    | 'buildDetail'
    | 'tierLists'
    | 'tierDetail';
}

export type ContentRouteModel =
  | ListRouteModel
  | DetailRouteModel
  | ReferenceRouteModel
  | NewsDetailRouteModel
  | SearchRouteModel
  | Phase2RouteModel
  | Phase3RouteModel;

interface ListDefinition {
  title: string;
  kinds: ContentKind[];
  variant: ListRouteModel['variant'];
  filter?: (record: ContentRecord) => boolean;
}

const LIST_ROUTES: Readonly<Record<string, ListDefinition>> = Object.freeze({
  '/gear': { title: 'Gear', kinds: ['gear'], variant: 'grid' },
  '/grades': { title: 'Grades', kinds: ['grade'], variant: 'grid' },
  '/materials': { title: 'Materials', kinds: ['material'], variant: 'grid' },
  '/effects': {
    title: 'Material Effects',
    kinds: ['material'],
    variant: 'effects',
    filter: (record) => record.kind === 'material' && record.hasEffects
  },
  '/stages': { title: 'Stages', kinds: ['stage'], variant: 'map' },
  '/stage-boxes': { title: 'Stage Boxes', kinds: ['stageBox'], variant: 'grid' },
  '/monsters': { title: 'Monsters', kinds: ['monster'], variant: 'grid' },
  '/skills': { title: 'Skills & Passives', kinds: ['skill', 'passiveSkill'], variant: 'table' },
  '/runes': { title: 'Runes', kinds: ['rune'], variant: 'tree' },
  '/buffs': { title: 'Buffs', kinds: ['buff'], variant: 'table' },
  '/status-effects': { title: 'Status Effects', kinds: ['statusEffect'], variant: 'grid' },
  '/heroes': { title: 'Heroes', kinds: ['hero'], variant: 'grid' },
  '/pets': { title: 'Pets', kinds: ['pet'], variant: 'grid' }
});

const REFERENCE_ROUTES = Object.freeze({
  '/mechanics': { title: 'Mechanics', section: 'mechanics' },
  '/achievements': { title: 'Achievements', section: 'achievements' },
  '/news': { title: 'News', section: 'news' },
  '/database': { title: 'All Data', section: 'database' }
} satisfies Record<
  string,
  { title: string; section: ReferenceRouteModel['section'] }
>);

const CUBE_ROUTES = Object.freeze({
  '/cube': { title: 'Overview', section: 'cubeOverview' },
  '/synthesis': { title: 'Synthesis', section: 'cubeOperation', operation: 'synthesis' },
  '/alchemy': { title: 'Alchemy', section: 'cubeOperation', operation: 'alchemy' },
  '/crafting': { title: 'Crafting', section: 'cubeOperation', operation: 'crafting' },
  '/decoration': { title: 'Decoration', section: 'cubeOperation', operation: 'decoration' },
  '/engraving': { title: 'Engraving', section: 'cubeOperation', operation: 'engraving' },
  '/inscription': { title: 'Inscription', section: 'cubeOperation', operation: 'inscription' },
  '/extraction': { title: 'Extraction', section: 'cubeOperation', operation: 'extraction' },
  '/offering': { title: 'Offering', section: 'cubeOperation', operation: 'offering' },
  '/save-inspector': { title: 'Save Inspector', section: 'saveInspector' },
  '/market': { title: 'Market', section: 'market' },
  '/inventory-value': { title: 'Inventory Value', section: 'inventoryValue' },
  '/tools/farming': { title: 'Farming Optimizer', section: 'farming' },
  '/tools/bis': { title: 'BiS Finder', section: 'bis' },
  '/tools/damage': { title: 'Damage Calculator', section: 'damage' },
  '/tools/cube-leveling': { title: 'Cube Leveling', section: 'cubeLeveling' },
  '/tools/drops': { title: 'Drop Finder', section: 'drops' }
} satisfies Record<string, {
  title: string;
  section: Phase2RouteModel['section'];
  operation?: CubeOperationSlug;
}>);

const PHASE3_ROUTES = Object.freeze({
  '/login': { title: 'Login', section: 'login' },
  '/privacy': { title: 'Privacy Policy', section: 'privacy' },
  '/guides': { title: 'Guides', section: 'guides' },
  '/guides/ranger-archer-solo-build-guide': {
    title: 'Ranger / Archer Solo Build Guide',
    section: 'guideDetail'
  },
  '/builds': { title: 'Builds', section: 'builds' },
  '/builds/3338/lv70': { title: 'Lv. 70 Ranger Build', section: 'buildDetail' },
  '/tier-lists': { title: 'Tier Lists', section: 'tierLists' },
  '/tier-lists/end-game-0u8p9': { title: 'End Game Tier List', section: 'tierDetail' }
} satisfies Record<string, {
  title: string;
  section: Phase3RouteModel['section'];
}>);

const DETAIL_ROUTES: ReadonlyArray<{
  pattern: RegExp;
  kinds: ContentKind[];
}> = Object.freeze([
  { pattern: /^\/items\/([^/]+)$/, kinds: ['gear', 'material', 'stageBox'] },
  { pattern: /^\/stages\/([^/]+)$/, kinds: ['stage'] },
  { pattern: /^\/monsters\/([^/]+)$/, kinds: ['monster'] },
  { pattern: /^\/skills\/([^/]+)$/, kinds: ['skill'] },
  { pattern: /^\/passive-skills\/([^/]+)$/, kinds: ['passiveSkill'] },
  { pattern: /^\/runes\/([^/]+)$/, kinds: ['rune'] },
  { pattern: /^\/status-effects\/([^/]+)$/, kinds: ['statusEffect'] },
  { pattern: /^\/heroes\/([^/]+)$/, kinds: ['hero'] }
]);

function normalizePath(input: string): string {
  const url = new URL(input, 'https://local.invalid');
  const decoded = decodeURIComponent(url.pathname);
  if (decoded === '/') return '/';
  return decoded.replace(/\/+$/, '') || '/';
}

export function hrefForRecord(record: ContentRecord): string {
  switch (record.kind) {
    case 'gear':
    case 'material':
    case 'stageBox':
      return `/items/${record.slug}`;
    case 'grade':
      return `/grades#${record.slug}`;
    case 'stage':
      return `/stages/${record.slug}`;
    case 'monster':
      return `/monsters/${record.slug}`;
    case 'skill':
      return `/skills/${record.slug}`;
    case 'passiveSkill':
      return `/passive-skills/${record.slug}`;
    case 'rune':
      return `/runes/${record.slug}`;
    case 'buff':
      return `/buffs#${record.slug}`;
    case 'statusEffect':
      return `/status-effects/${record.slug}`;
    case 'hero':
      return `/heroes/${record.slug}`;
    case 'pet':
      return `/pets#${record.slug}`;
    case 'effect':
      return `/effects#${record.slug}`;
    case 'mechanic':
      return `/mechanics#${record.slug}`;
    case 'achievement':
      return `/achievements#${record.slug}`;
    case 'news':
      return `/news#${record.slug}`;
  }
}

export function createRouteResolver(repository: ContentRepository) {
  return (input: string): ContentRouteModel | null => {
    let path: string;
    try {
      path = normalizePath(input);
    } catch {
      return null;
    }
    if (path === '/search') return { type: 'search', path: '/search', title: 'Search' };

    const cubeRoute = CUBE_ROUTES[path as keyof typeof CUBE_ROUTES];
    if (cubeRoute) return { type: 'phase2', path, ...cubeRoute };

    const phase3Route = PHASE3_ROUTES[path as keyof typeof PHASE3_ROUTES];
    if (phase3Route) return { type: 'phase3', path, ...phase3Route };

    const listDefinition = LIST_ROUTES[path];
    if (listDefinition) {
      const records = listDefinition.kinds.flatMap((kind) => [...repository.list(kind)]);
      return {
        type: 'list',
        path,
        title: listDefinition.title,
        kinds: [...listDefinition.kinds],
        records: Object.freeze(
          listDefinition.filter ? records.filter(listDefinition.filter) : records
        ),
        variant: listDefinition.variant
      };
    }

    const reference = REFERENCE_ROUTES[path as keyof typeof REFERENCE_ROUTES];
    if (reference) {
      return {
        type: 'reference',
        path,
        title: reference.title,
        section: reference.section
      };
    }

    const newsMatch = path.match(/^\/news\/([^/]+)$/);
    if (newsMatch) {
      const article = NEWS.find((entry) => entry.id === newsMatch[1]);
      return article ? { type: 'newsDetail', path, title: article.title, article } : null;
    }

    for (const definition of DETAIL_ROUTES) {
      const match = path.match(definition.pattern);
      if (!match) continue;
      for (const kind of definition.kinds) {
        const record = repository.get(kind, match[1]);
        if (record) return {
          type: 'detail',
          path,
          title: path.startsWith('/stages/')
            ? 'Stages'
            : path.startsWith('/items/')
              ? 'Items'
              : path.startsWith('/heroes/')
                ? 'Heroes'
                : path.startsWith('/runes/')
                  ? 'Runes'
                  : path.startsWith('/passive-skills/')
                    ? 'Passive Skills'
                    : path.startsWith('/skills/')
                      ? 'Skills & Passives'
                      : path.startsWith('/status-effects/')
                        ? 'Status Effects'
                        : record.name,
          record
        };
      }
      return null;
    }
    return null;
  };
}
