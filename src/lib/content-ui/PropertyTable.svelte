<script lang="ts">
  export type PropertyRow = { label: string; value: string | number; href?: string };

  let { label, rows }: { label: string; rows: readonly PropertyRow[] } = $props();
</script>

<table class="property-table" aria-label={label}>
  <tbody>
    {#each rows as row}
      <tr>
        <th scope="row">{row.label}</th>
        <td>{#if row.href}<a href={row.href}>{row.value}</a>{:else}{row.value}{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>
