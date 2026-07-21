<script lang="ts">
  import type { GradeRecord } from '$lib/content/schema';
  import { gradePropertyRow, titleCase } from '$lib/content/database-families';
  import './database-families.css';

  let { grades }: { grades: readonly GradeRecord[] } = $props();
</script>

<section class="database-family-page grade-overview" aria-labelledby="rarity-grades-heading">
  <header class="database-family-heading">
    <h1 id="rarity-grades-heading">Rarity Grades</h1>
    <p>The 10-tier rarity ladder and its crafting properties.</p>
  </header>

  <ul class="grade-ladder" aria-label="Rarity ladder">
    {#each grades as grade}
      <li class="grade-tone-{grade.gradeId.toLowerCase()}">
        <span aria-hidden="true"></span>
        <strong>{titleCase(grade.gradeId)}</strong>
      </li>
    {/each}
  </ul>

  <div class="grade-table-wrap">
    <table class="grade-properties" aria-label="Grade properties">
      <thead>
        <tr>
          <th>Grade</th>
          <th>Inherent slots</th>
          <th>Decoration</th>
          <th>Engraving</th>
          <th>Inscription</th>
          <th>Alchemy gold</th>
          <th>Cube EXP</th>
        </tr>
      </thead>
      <tbody>
        {#each grades as grade}
          {@const row = gradePropertyRow(grade)}
          <tr>
            <th><span class="grade-name grade-tone-{grade.gradeId.toLowerCase()}">{titleCase(grade.gradeId)}</span></th>
            <td>{row.inherent}</td>
            <td>{row.decoration}</td>
            <td>{row.engraving}</td>
            <td>{row.inscription}</td>
            <td><span class="database-coin" aria-hidden="true">●</span>{row.gold.toLocaleString('en-US')}</td>
            <td>{row.cubeExp}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
