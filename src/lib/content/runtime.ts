import { contentCatalog } from './catalog.ts';
import { createContentRepository } from './repository.ts';
import { createRouteResolver } from './routes.ts';
import { createContentSearch } from './search.ts';
import { parseRuneTreeFeature } from './rune-tree.ts';

export const contentRepository = createContentRepository(contentCatalog);
export const resolveContentRoute = createRouteResolver(contentRepository);
export const searchContent = createContentSearch(contentRepository);
export const runeTreeFeature = parseRuneTreeFeature(contentCatalog.features.runeTree);
export const monsterAnimationsFeature = contentCatalog.features.monsterAnimations;
