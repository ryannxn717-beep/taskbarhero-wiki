<script lang="ts">
  import type { RuneRecord } from '$lib/content/schema';
  import { formatRuneEffect, runeTreeNodeFor, type RuneTreeFeature } from '$lib/content/rune-tree';

  let {
    rune,
    tree,
    related
  }: {
    rune: RuneRecord;
    tree: RuneTreeFeature;
    related: readonly RuneRecord[];
  } = $props();

  const node = $derived(runeTreeNodeFor(tree, rune));
  const unlocks = $derived(related.filter((entry) => tree.nodes.some((candidate) => String(candidate.key) === entry.id)));
</script>

<article class="rune-detail" aria-label={`${rune.name} details`}>
  <a class="detail-back rune-detail-back" href="/runes"><span aria-hidden="true">←</span> Rune Tree</a>

  <div class="rune-detail-layout">
    <section class="rune-identity-card" aria-label={`${rune.name} identity`}>
      <img src={rune.image ?? node.icon} alt={rune.name} />
      <h1>{rune.name}</h1>
      <p>Max Lv {node.maxLevel}</p>
    </section>

    <div class="rune-detail-facts">
      <section aria-labelledby="rune-effect-title">
        <h2 class="item-detail-section-title" id="rune-effect-title"><span>Effect</span></h2>
        <div class="rune-effect-card">
          <small>Effect</small>
          <strong>{formatRuneEffect(node, node.levels[0]?.value ?? 0)}</strong>
        </div>
      </section>

      <section aria-labelledby="rune-level-values-title">
        <h2 class="item-detail-section-title" id="rune-level-values-title"><span>Level Values</span></h2>
        <div class="rune-level-table-wrap">
          <table class="rune-level-table" aria-label={`${rune.name} level values`}>
            <thead><tr><th>LV</th><th>EFFECT</th><th>COST</th></tr></thead>
            <tbody>
              {#each node.levels as level (level.level)}
                <tr>
                  <td>{level.level}</td>
                  <td>{formatRuneEffect(node, level.value)}</td>
                  <td><img src="/game/ui/Icon_Gold.png" alt="" />{level.costValue.toLocaleString('en-US')}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="rune-unlocks-title">
        <h2 class="item-detail-section-title" id="rune-unlocks-title"><span>Unlocks</span></h2>
        {#if unlocks.length > 0}
          <div class="rune-unlock-list">
            {#each unlocks as unlocked (unlocked.id)}
              <a href={`/runes/${unlocked.slug}`}><img src={unlocked.image ?? ''} alt="" /><span>{unlocked.name}</span></a>
            {/each}
          </div>
        {:else}
          <p class="rune-no-unlocks">No connected runes.</p>
        {/if}
      </section>
    </div>
  </div>
</article>
