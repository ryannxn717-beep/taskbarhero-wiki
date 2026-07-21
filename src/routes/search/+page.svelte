<script lang="ts">
  import type { SearchResult } from '$lib/content/search';
  import type { ContentKind, GradeId } from '$lib/content/schema';
  import Footer from '$lib/shell/Footer.svelte';

  let { data }: { data: { title: string; query: string; results: readonly SearchResult[] } } = $props();

  const gradeColors: Record<GradeId, string> = {
    COMMON: '#e4e4e4',
    UNCOMMON: '#54fc0c',
    RARE: '#0c6cfc',
    LEGENDARY: '#fc9c0c',
    IMMORTAL: '#fc2424',
    ARCANA: '#c84cff',
    BEYOND: '#ff3f92',
    CELESTIAL: '#57d8ff',
    DIVINE: '#ffe84f',
    COSMIC: '#ffffff'
  };

  const groupDefinitions: readonly { label: string; kinds: readonly ContentKind[] }[] = [
    { label: 'Items', kinds: ['gear', 'material', 'stageBox'] },
    { label: 'Heroes', kinds: ['hero'] },
    { label: 'Skills', kinds: ['skill', 'passiveSkill'] },
    { label: 'Runes', kinds: ['rune'] },
    { label: 'Stages', kinds: ['stage'] },
    { label: 'Monsters', kinds: ['monster'] },
    { label: 'Pets', kinds: ['pet'] },
    { label: 'Effects', kinds: ['effect', 'buff', 'statusEffect'] },
    { label: 'Database', kinds: ['grade', 'mechanic', 'achievement', 'news'] }
  ];

  const resultGroups = $derived(
    groupDefinitions
      .map((definition) => ({
        ...definition,
        results: data.results.filter((result) => definition.kinds.includes(result.record.kind))
      }))
      .filter((group) => group.results.length > 0)
  );

  function accentColor(result: SearchResult): string {
    if (
      result.record.kind === 'gear' ||
      result.record.kind === 'material' ||
      result.record.kind === 'stageBox'
    ) {
      return gradeColors[result.record.gradeId];
    }
    return '#f5b73a';
  }
</script>

<section class="source-search" aria-labelledby="search-page-title">
  <h1 id="search-page-title">Search</h1>
  {#if data.query}
    <p class="source-search-summary">{data.results.length} results for “{data.query}”</p>
  {:else}
    <p class="source-search-summary">Type a query in the top bar.</p>
  {/if}

  {#if data.query && data.results.length === 0}
    <p class="source-search-empty">No matches. Try a different spelling or browse via the sidebar.</p>
  {:else}
    {#each resultGroups as group (group.label)}
      <section class="source-search-group" aria-labelledby={`search-group-${group.label.toLowerCase()}`}>
        <h2 id={`search-group-${group.label.toLowerCase()}`}>{group.label} ({group.results.length})</h2>
        <ul aria-label={`${group.label} search results`}>
          {#each group.results as result (`${result.record.kind}:${result.record.id}`)}
            <li>
              <a href={result.href} style:--search-accent={accentColor(result)}>
                {#if result.record.image}<img src={result.record.image} alt="" />{/if}
                <span>{result.record.name}</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</section>

<Footer />
