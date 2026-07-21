<script lang="ts">
  type CellValue = string | number | boolean | null | undefined;

  let {
    caption,
    columns,
    rows,
    rowHref
  }: {
    caption: string;
    columns: readonly { key: string; label: string }[];
    rows: readonly Record<string, CellValue>[];
    rowHref?: (row: Record<string, CellValue>) => string | null;
  } = $props();

  function display(value: CellValue): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }
</script>

<div class="dt-wrap" role="region" aria-label={`${caption} table`}>
  <table class="data-table">
    <caption>{caption}</caption>
    <thead>
      <tr>{#each columns as column}<th scope="col">{column.label}</th>{/each}</tr>
    </thead>
    <tbody>
      {#each rows as row}
        {@const href = rowHref?.(row)}
        <tr>{#each columns as column, index}<td>{#if index === 0 && href}<a href={href}>{display(row[column.key])}</a>{:else}{display(row[column.key])}{/if}</td>{/each}</tr>
      {/each}
    </tbody>
  </table>
</div>
