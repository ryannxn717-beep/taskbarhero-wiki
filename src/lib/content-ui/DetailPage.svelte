<script lang="ts">
  import type { ContentRecord } from '$lib/content/schema';
  import EntityCard from './EntityCard.svelte';
  import PropertyTable, { type PropertyRow } from './PropertyTable.svelte';

  let {
    record,
    properties,
    related = [],
    relatedHeading = 'Found in',
    hrefFor
  }: {
    record: ContentRecord;
    properties: readonly PropertyRow[];
    related?: readonly ContentRecord[];
    relatedHeading?: string;
    hrefFor: (record: ContentRecord) => string;
  } = $props();

  const stats = $derived('stats' in record && Array.isArray(record.stats) ? record.stats : []);
</script>

<article class="detail-page">
  <div class="detail-core">
    <section class="detail-identity">
      {#if record.image}<img class="detail-portrait" src={record.image} alt={record.name} />{/if}
      <p class="detail-kind">{record.kind}</p>
      <h1>{record.name}</h1>
      <p>{record.summary}</p>
    </section>

    <section class="detail-facts" aria-labelledby="detail-properties-heading">
      <h2 id="detail-properties-heading">Properties</h2>
      <PropertyTable label={`${record.name} properties`} rows={properties} />
      <h2>Status</h2>
      {#if stats.length > 0}
        <PropertyTable
          label={`${record.name} status`}
          rows={stats.map((stat) => ({
            label: stat.label,
            value: `${stat.value}${stat.unit ? ` ${stat.unit}` : ''}`
          }))}
        />
      {:else}
        <p class="detail-none">No fixed status values.</p>
      {/if}
    </section>
  </div>

  {#if related.length > 0}
    <section class="detail-related" aria-label={relatedHeading}>
      <h2>{relatedHeading}</h2>
      <div class="entity-grid compact-grid">
        {#each related as item (`${item.kind}:${item.id}`)}
          <EntityCard record={item} href={hrefFor(item)} />
        {/each}
      </div>
    </section>
  {/if}
</article>
