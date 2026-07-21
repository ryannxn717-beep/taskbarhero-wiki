import type { PageLoad } from './$types';
import { searchContent } from '$lib/content/runtime';

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export const load: PageLoad = ({ url }) => {
  const query = (url.searchParams.get('q') ?? '').trim();
  const rankedResults = query ? searchContent(query, 50) : [];
  const normalizedQuery = normalize(query);
  const directNameResults = normalizedQuery
    ? rankedResults.filter((result) => normalize(result.record.name).includes(normalizedQuery))
    : [];
  return {
    title: 'Search',
    query,
    results: directNameResults.length > 0 ? directNameResults : rankedResults
  };
};
