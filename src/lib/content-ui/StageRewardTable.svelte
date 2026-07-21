<script lang="ts">
  import type { ContentKind, ContentRecord } from '$lib/content/schema';
  import type { StageDropView, StageDropEntryView } from '$lib/content/stage-view';

  let {
    drop,
    lookup,
    hrefFor
  }: {
    drop: StageDropView;
    lookup: (kind: ContentKind, id: string) => ContentRecord | null;
    hrefFor: (record: ContentRecord) => string;
  } = $props();

  function recordsFor(entry: StageDropEntryView): ContentRecord[] {
    return entry.itemIds.flatMap((id) => {
      const record = lookup('gear', id) ?? lookup('material', id) ?? lookup('stageBox', id);
      return record ? [record] : [];
    });
  }

  function rarityClass(grade: string | null): string {
    return `grade-${(grade ?? 'common').toLowerCase()}`;
  }
</script>

<section class="stage-drop-table" aria-label={`${drop.label} rewards`}>
  {#each drop.entries as entry}
    {@const records = recordsFor(entry)}
    <div class="stage-reward-row">
      <b>{entry.chance < 0.1 && entry.chance > 0 ? '<0.1' : entry.chance.toFixed(1)}%</b>
      <div class="stage-reward-content">
        <div class="stage-reward-meta">
          {#if entry.grade}<small class={rarityClass(entry.grade)}>{entry.grade}</small>{/if}
          {#if entry.level}<small>Lv{entry.level}</small>{/if}
          {#if records.length > 1}<span>one random of {records.length}</span>{/if}
        </div>
        {#if records.length > 0}
          <div class="stage-reward-items">
            {#each records as record}
              <a class={rarityClass(entry.grade)} href={hrefFor(record)} aria-label={record.name}>
                {#if record.image}<img src={record.image} alt={record.name} />{/if}
                <strong>{record.name}</strong>
              </a>
            {/each}
          </div>
        {:else}
          <strong class="stage-reward-fallback">{entry.label}</strong>
        {/if}
      </div>
    </div>
  {/each}
</section>
