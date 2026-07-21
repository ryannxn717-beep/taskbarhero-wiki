<script lang="ts">
  import type { ContentRecord } from '$lib/content/schema';

  let { record, href }: { record: ContentRecord; href: string } = $props();

  function titleCase(value: string): string {
    return value
      .toLowerCase()
      .split(/[_\s-]+/)
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(' ');
  }

  const grade = $derived('gradeId' in record ? titleCase(String(record.gradeId)) : null);
  const type = $derived(
    record.kind === 'gear'
      ? titleCase(record.gearType)
      : record.kind === 'monster'
        ? titleCase(record.monsterType)
        : null
  );
  const level = $derived('level' in record && typeof record.level === 'number' ? record.level : null);
</script>

<a class="entity-card" class:entity-card-with-image={record.image !== null} {href}>
  {#if record.image}
    <span class="entity-card-image"><img src={record.image} alt={record.name} loading="lazy" /></span>
  {/if}
  <span class="entity-card-copy">
    <strong>{record.name}</strong>
    <span class="entity-card-meta">
      {#if grade}<span class="grade-tag grade-{grade?.toLowerCase()}">{grade}</span>{/if}
      {#if type}<span>{type}</span>{/if}
      {#if level !== null}<span>Level {level}</span>{/if}
    </span>
    <small>{record.summary}</small>
  </span>
</a>
