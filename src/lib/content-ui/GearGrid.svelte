<script lang="ts">
  import type { GearRecord, GradeId } from '$lib/content/schema';

  let {
    records,
    hrefFor,
    onReset
  }: {
    records: readonly GearRecord[];
    hrefFor: (record: GearRecord) => string;
    onReset?: () => void;
  } = $props();

  const statLabels: Record<string, string> = {
    AttackDamage: 'ATK',
    AttackSpeed: 'ASPD',
    CriticalDamage: 'CRIT DMG',
    CriticalChance: 'CRIT',
    CooldownReduction: 'CDR',
    MaxHp: 'HP',
    Armor: 'ARMOR',
    HpRegenPerSec: 'HP REGEN',
    MovementSpeed: 'MOVE',
    CastSpeed: 'CAST'
  };

  const slotCounts: Record<GradeId, [number, number, number]> = {
    COMMON: [1, 0, 0],
    UNCOMMON: [1, 0, 0],
    RARE: [1, 0, 0],
    LEGENDARY: [2, 0, 0],
    IMMORTAL: [2, 0, 0],
    ARCANA: [2, 1, 1],
    BEYOND: [2, 1, 1],
    CELESTIAL: [3, 1, 1],
    DIVINE: [3, 2, 2],
    COSMIC: [3, 2, 2]
  };

  function object(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  }

  function primaryStat(record: GearRecord): string {
    const detail = object(record.source.detail);
    const stats = object(detail.stats);
    for (let index = 1; index <= 3; index += 1) {
      const type = String(stats[`InherentStat${index}_STATTYPE`] ?? 'NONE');
      const mode = String(stats[`InherentStat${index}_MODTYPE`] ?? 'FLAT');
      const value = Number(stats[`InherentStat${index}_Value`]);
      if (type === 'NONE' || !Number.isFinite(value) || value === 0) continue;
      const label = statLabels[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
      if (mode === 'FLAT') return `${label} +${value.toLocaleString('en-US')}`;
      const percent = value / 10;
      return `${label} +${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1)}%`;
    }

    const baseValue = Number(stats.BaseStat1_Value);
    const label = record.gearGroup === 'Armor' ? 'HP' : record.gearGroup === 'Accessory' ? 'POWER' : 'ATK';
    return `${label} +${Number.isFinite(baseValue) ? baseValue.toLocaleString('en-US') : '0'}`;
  }
</script>

{#if records.length > 0}
  <div class="gear-result-grid" role="list" aria-label="Database results">
    {#each records as record (`gear:${record.id}`)}
      {@const slots = slotCounts[record.gradeId]}
      <div role="listitem">
        <a
          class={`gear-result-card gear-result-${record.gradeId.toLowerCase()}`}
          href={hrefFor(record)}
          aria-label={`${record.name} ${record.gradeId} ${record.gearType} Level ${record.level}`}
        >
          <span class="gear-result-art">
            {#if record.image}<img src={record.image} alt={record.name} loading="lazy" />{/if}
          </span>
          <span class="gear-result-copy">
            <small class="gear-result-rarity">{record.gradeId}</small>
            <strong>{record.name}</strong>
            <span class="gear-result-slots">
              <small>SLOT</small>
              <span>◉ D x{slots[0]}</span>
              {#if slots[1] > 0}<span>◈ E x{slots[1]}</span>{/if}
              {#if slots[2] > 0}<span>▤ I x{slots[2]}</span>{/if}
            </span>
            <span class="gear-result-stat">Lv{record.level} | {primaryStat(record)}</span>
          </span>
        </a>
      </div>
    {/each}
  </div>
{:else}
  <div class="database-empty">
    <p>No matches</p>
    {#if onReset}<button class="wiki-button" type="button" onclick={onReset}>Reset</button>{/if}
  </div>
{/if}
