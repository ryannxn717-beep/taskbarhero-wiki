<script lang="ts">
  import { untrack } from 'svelte';
  import type { ContentRouteModel } from '$lib/content/routes';
  import type { ContentRecord, GearRecord, GradeRecord, HeroRecord, MaterialRecord, MonsterRecord, PassiveSkillRecord, RuneRecord, SkillRecord, StageBoxRecord, StageRecord } from '$lib/content/schema';
  import { contentRepository, monsterAnimationsFeature, runeTreeFeature, searchContent } from '$lib/content/runtime';
  import { hrefForRecord } from '$lib/content/routes';
  import {
    SOURCE_GEAR_UI_DEFAULT,
    gearQuery,
    parseGearQuery
  } from '$lib/content/gear-options';
  import type { GearFilter } from '$lib/content/repository';
  import DatabaseFrame from '$lib/content-ui/DatabaseFrame.svelte';
  import DetailPage from '$lib/content-ui/DetailPage.svelte';
  import EntityGrid from '$lib/content-ui/EntityGrid.svelte';
  import FilterBar from '$lib/content-ui/FilterBar.svelte';
  import GearFilterPanel from '$lib/content-ui/GearFilterPanel.svelte';
  import GearGrid from '$lib/content-ui/GearGrid.svelte';
  import HeroDetail from '$lib/content-ui/HeroDetail.svelte';
  import HeroIndex from '$lib/content-ui/HeroIndex.svelte';
  import GradeOverview from '$lib/content-ui/GradeOverview.svelte';
  import MaterialExplorer from '$lib/content-ui/MaterialExplorer.svelte';
  import StageBoxExplorer from '$lib/content-ui/StageBoxExplorer.svelte';
  import MonsterExplorer from '$lib/content-ui/MonsterExplorer.svelte';
  import MonsterDetail from '$lib/content-ui/MonsterDetail.svelte';
  import ItemDetail from '$lib/content-ui/ItemDetail.svelte';
  import StageDetail from '$lib/content-ui/StageDetail.svelte';
  import StageExplorer from '$lib/content-ui/StageExplorer.svelte';
  import SkillsExplorer from '$lib/content-ui/SkillsExplorer.svelte';
  import SkillDetail from '$lib/content-ui/SkillDetail.svelte';
  import RuneExplorer from '$lib/content-ui/RuneExplorer.svelte';
  import RuneDetail from '$lib/content-ui/RuneDetail.svelte';
  import ReferenceIndex from '$lib/content-ui/ReferenceIndex.svelte';
  import NewsSnapshotDetail from '$lib/content-ui/NewsSnapshotDetail.svelte';
  import type { PropertyRow } from '$lib/content-ui/PropertyTable.svelte';
  import Footer from '$lib/shell/Footer.svelte';
  import CubeOverview from '$lib/cube/CubeOverview.svelte';
  import CubeOperationPage from '$lib/cube/CubeOperationPage.svelte';
  import SaveInspector from '$lib/tools-ui/SaveInspector.svelte';
  import Market from '$lib/tools-ui/Market.svelte';
  import InventoryValue from '$lib/tools-ui/InventoryValue.svelte';
  import FarmingCalculator from '$lib/tools-ui/FarmingCalculator.svelte';
  import BisFinder from '$lib/tools-ui/BisFinder.svelte';
  import DamageCalculator from '$lib/tools-ui/DamageCalculator.svelte';
  import CubeLevelingCalculator from '$lib/tools-ui/CubeLevelingCalculator.svelte';
  import DropFinder from '$lib/tools-ui/DropFinder.svelte';
  import LoginPage from '$lib/community/LoginPage.svelte';
  import PrivacyPage from '$lib/community/PrivacyPage.svelte';
  import GuidesIndex from '$lib/community/GuidesIndex.svelte';
  import GuideDetail from '$lib/community/GuideDetail.svelte';
  import BuildsIndex from '$lib/community/BuildsIndex.svelte';
  import BuildDetail from '$lib/community/BuildDetail.svelte';
  import TierListsIndex from '$lib/community/TierListsIndex.svelte';
  import TierListDetail from '$lib/community/TierListDetail.svelte';
  import type { CommunityEntity } from '$lib/community/data';
  import '$lib/community/community.css';
  import { createLocalMarketQuotes } from '$lib/tools/market';
  import { createBisGear, createDamageStages, createDropSources, createFarmingStages, createToolHeroes, createToolItems } from '$lib/tools/calculator-data';

  let { data }: { data: { title: string; model: ContentRouteModel; query: string } } = $props();
  const model = $derived(data.model);
  let gearFilter = $state<GearFilter>(untrack(() => parseGearQuery(data.query)));
  let visibleLimit = $state(60);
  let searchQuery = $state(untrack(() => new URLSearchParams(data.query).get('q') ?? ''));

  const filteredGear = $derived(
    model.type === 'list' && model.path === '/gear'
      ? contentRepository.filterGear(gearFilter)
      : []
  );
  const visibleGear = $derived(filteredGear.slice(0, visibleLimit));
  const searchResults = $derived(model.type === 'search' ? searchContent(searchQuery, 100) : []);
  const marketQuotes = createLocalMarketQuotes(
    [...contentRepository.list('gear'), ...contentRepository.list('material')]
      .filter((record): record is GearRecord | MaterialRecord => record.kind === 'gear' || record.kind === 'material')
  );
  const calculatorStages = contentRepository.list('stage').filter((record): record is StageRecord => record.kind === 'stage');
  const calculatorBoxes = contentRepository.list('stageBox').filter((record): record is StageBoxRecord => record.kind === 'stageBox');
  const calculatorGear = contentRepository.list('gear').filter((record): record is GearRecord => record.kind === 'gear');
  const calculatorMaterials = contentRepository.list('material').filter((record): record is MaterialRecord => record.kind === 'material');
  const calculatorHeroes = contentRepository.list('hero').filter((record): record is HeroRecord => record.kind === 'hero');
  const heroSkills = contentRepository.list('skill').filter((record): record is SkillRecord => record.kind === 'skill');
  const calculatorDropSources = createDropSources(calculatorStages, calculatorBoxes);
  const farmingStages = createFarmingStages(calculatorStages, calculatorDropSources);
  const bisGear = createBisGear(calculatorGear, calculatorHeroes);
  const toolItems = createToolItems([...calculatorGear, ...calculatorMaterials]);
  const toolHeroes = createToolHeroes(calculatorHeroes);
  const damageStages = createDamageStages(calculatorStages);

  const titleCase = (value: string) => value
    .toLowerCase()
    .split(/[_\s-]+/)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');

  function updateUrl(filter: GearFilter) {
    if (typeof window === 'undefined') return;
    const query = gearQuery(filter);
    window.history.replaceState(window.history.state, '', query ? `/gear?${query}` : '/gear');
  }

  function setGearFilter(next: GearFilter) {
    gearFilter = next;
    visibleLimit = 60;
    updateUrl(next);
  }

  function patchGearFilter(patch: Partial<GearFilter>) {
    setGearFilter({ ...gearFilter, ...patch });
  }

  function resetGear() {
    setGearFilter({ ...SOURCE_GEAR_UI_DEFAULT, gradeIds: [], gearTypes: [], gearGroups: [], statTypes: [] });
  }

  function propertiesFor(record: ContentRecord): PropertyRow[] {
    if (record.kind === 'gear') return [
      { label: 'Rarity', value: titleCase(record.gradeId) },
      { label: 'Type', value: titleCase(record.gearType) },
      { label: 'Slot', value: record.gearGroup },
      { label: 'Level', value: record.level },
      { label: 'Resell value', value: `${record.sellGold} Gold` },
      { label: 'Cube experience', value: record.cubeExp },
      { label: 'Obtainable', value: record.obtainable ? 'Yes' : 'No' }
    ];
    if (record.kind === 'material') return [
      { label: 'Rarity', value: titleCase(record.gradeId) },
      { label: 'Type', value: titleCase(record.materialType) },
      { label: 'Material effects', value: record.hasEffects ? 'Yes' : 'No' }
    ];
    if (record.kind === 'stageBox') return [{ label: 'Rarity', value: titleCase(record.gradeId) }];
    if (record.kind === 'stage') return [
      { label: 'Difficulty', value: titleCase(record.difficulty) },
      { label: 'Act', value: record.act }, { label: 'Stage', value: record.number },
      { label: 'Level', value: record.level }, { label: 'Waves', value: record.waves ?? '—' },
      { label: 'Gold per clear', value: record.goldPerClear },
      { label: 'Experience per clear', value: record.expPerClear }
    ];
    if (record.kind === 'monster') return [
      { label: 'Type', value: titleCase(record.monsterType) },
      { label: 'Gold reward', value: record.rewardGold }, { label: 'Experience reward', value: record.rewardExp }
    ];
    if (record.kind === 'skill') return [
      { label: 'Activation', value: titleCase(record.activation) },
      { label: 'Element', value: titleCase(record.element) },
      { label: 'Range', value: record.range }, { label: 'Max level', value: record.maxLevel },
      { label: 'Cooldown', value: record.cooldownSeconds === null ? '—' : `${record.cooldownSeconds}s` }
    ];
    if (record.kind === 'passiveSkill') return [{ label: 'Type', value: 'Passive skill' }];
    if (record.kind === 'rune') return [{ label: 'Maximum level', value: record.maxLevel }];
    if (record.kind === 'statusEffect') return [{ label: 'Duration', value: record.durationSeconds === null ? '—' : `${record.durationSeconds}s` }];
    if (record.kind === 'hero') return [{ label: 'Class', value: record.role }];
    if (record.kind === 'pet') return [{ label: 'Role', value: record.role }, { label: 'Unlock', value: record.unlockCondition }];
    return [{ label: 'Database ID', value: record.id }];
  }

  function relatedFor(record: ContentRecord): readonly ContentRecord[] {
    const related = contentRepository.related(record);
    if (record.kind === 'gear' || record.kind === 'material' || record.kind === 'stageBox') {
      return related.filter((entry) => entry.kind !== 'grade');
    }
    return related;
  }

  function listIntro(path: string): string {
    const copy: Record<string, string> = {
      '/gear': 'Browse equipment, compare rarity, type, stats, and where each item can be found.',
      '/grades': 'Every Task Bar Hero item rarity in source order.',
      '/materials': 'Crafting and upgrade materials found throughout the game.',
      '/effects': 'Materials that provide one or more equipment effects.'
    };
    return copy[path] ?? 'Browse the Task Bar Hero database.';
  }

  const nounFor = (path: string) => path === '/grades' ? 'grades' : path === '/effects' ? 'materials' : path.slice(1);
  const asStages = (records: readonly ContentRecord[]) => records.filter((record): record is StageRecord => record.kind === 'stage');
  const asSkills = (records: readonly ContentRecord[]) => records.filter((record): record is SkillRecord | PassiveSkillRecord => record.kind === 'skill' || record.kind === 'passiveSkill');
  const asHeroes = () => contentRepository.list('hero').filter((record): record is HeroRecord => record.kind === 'hero');
  const asRunes = (records: readonly ContentRecord[]) => records.filter((record): record is RuneRecord => record.kind === 'rune');
  const asStageBoxes = (records: readonly ContentRecord[]) => records.filter((record): record is StageBoxRecord => record.kind === 'stageBox');
  const asGrades = (records: readonly ContentRecord[]) => records.filter((record): record is GradeRecord => record.kind === 'grade');
  const asMaterials = (records: readonly ContentRecord[]) => records.filter((record): record is MaterialRecord => record.kind === 'material');
  const asMonsters = (records: readonly ContentRecord[]) => records.filter((record): record is MonsterRecord => record.kind === 'monster');
  const phase5Reference = (
    section: 'buffs' | 'statusEffects' | 'statusEffectDetail' | 'pets',
    path: string,
    title: string,
    records?: readonly ContentRecord[],
    record?: ContentRecord
  ) => ({ type: 'reference' as const, section, path, title, records, record });
  const communityHeroes: CommunityEntity[] = asHeroes().map((hero) => ({
    slug: hero.slug,
    name: hero.name,
    image: hero.image,
    href: hrefForRecord(hero)
  }));
  const communityGear: CommunityEntity[] = calculatorGear.slice(0, 10).map((gear) => ({
    slug: gear.slug,
    name: gear.name,
    image: gear.image,
    href: hrefForRecord(gear)
  }));
  const communityRunes: CommunityEntity[] = contentRepository.list('rune')
    .filter((record): record is RuneRecord => record.kind === 'rune')
    .slice(0, 12)
    .map((rune) => ({
      slug: rune.slug,
      name: rune.name,
      image: rune.image,
      href: hrefForRecord(rune)
    }));
</script>

{#if model.type === 'list' && model.path === '/gear'}
  <DatabaseFrame title="Gear" intro={listIntro('/gear')} count={filteredGear.length} countLabel="items">
    {#snippet toolbar()}
      <GearFilterPanel filter={gearFilter} onPatch={patchGearFilter} onReset={resetGear} />
    {/snippet}
    <p class="database-total">200 total entries</p>
    <GearGrid records={visibleGear} hrefFor={hrefForRecord} onReset={resetGear} />
    {#if visibleLimit < filteredGear.length}
      <button class="wiki-button load-more" type="button" onclick={() => (visibleLimit += 60)}>Load more ({filteredGear.length - visibleLimit} left)</button>
    {/if}
  </DatabaseFrame>
{:else if model.type === 'phase2' && model.section === 'cubeOverview'}
  <CubeOverview />
{:else if model.type === 'phase2' && model.section === 'cubeOperation' && model.operation}
  <CubeOperationPage slug={model.operation} />
{:else if model.type === 'phase2' && model.section === 'saveInspector'}
  <SaveInspector />
{:else if model.type === 'phase2' && model.section === 'market'}
  <Market quotes={marketQuotes} />
{:else if model.type === 'phase2' && model.section === 'inventoryValue'}
  <InventoryValue quotes={marketQuotes} />
{:else if model.type === 'phase2' && model.section === 'farming'}
  <FarmingCalculator stages={farmingStages} items={toolItems} />
{:else if model.type === 'phase2' && model.section === 'bis'}
  <BisFinder gear={bisGear} heroes={toolHeroes} />
{:else if model.type === 'phase2' && model.section === 'damage'}
  <DamageCalculator stages={damageStages} />
{:else if model.type === 'phase2' && model.section === 'cubeLeveling'}
  <CubeLevelingCalculator />
{:else if model.type === 'phase2' && model.section === 'drops'}
  <DropFinder sources={calculatorDropSources} items={toolItems} />
{:else if model.type === 'phase3' && model.section === 'login'}
  <LoginPage />
{:else if model.type === 'phase3' && model.section === 'privacy'}
  <PrivacyPage />
{:else if model.type === 'phase3' && model.section === 'guides'}
  <GuidesIndex />
{:else if model.type === 'phase3' && model.section === 'guideDetail'}
  <GuideDetail />
{:else if model.type === 'phase3' && model.section === 'builds'}
  <BuildsIndex heroes={communityHeroes} />
{:else if model.type === 'phase3' && model.section === 'buildDetail'}
  <BuildDetail heroes={communityHeroes} gear={communityGear} runes={communityRunes} />
{:else if model.type === 'phase3' && model.section === 'tierLists'}
  <TierListsIndex heroes={communityHeroes} />
{:else if model.type === 'phase3' && model.section === 'tierDetail'}
  <TierListDetail heroes={communityHeroes} />
{:else if model.type === 'list' && model.variant === 'map'}
  <StageExplorer stages={asStages(model.records)} lookup={contentRepository.get} hrefFor={hrefForRecord} />
{:else if model.type === 'list' && model.path === '/skills'}
  <SkillsExplorer skills={asSkills(model.records)} heroes={asHeroes()} hrefFor={hrefForRecord} />
{:else if model.type === 'list' && model.variant === 'tree'}
  <RuneExplorer runes={asRunes(model.records)} tree={runeTreeFeature} hrefFor={hrefForRecord} />
{:else if model.type === 'list' && model.path === '/heroes'}
  <HeroIndex heroes={asHeroes()} />
{:else if model.type === 'list' && model.path === '/grades'}
  <GradeOverview grades={asGrades(model.records)} />
{:else if model.type === 'list' && model.path === '/materials'}
  <MaterialExplorer materials={asMaterials(model.records)} />
{:else if model.type === 'list' && model.path === '/effects'}
  <MaterialExplorer materials={asMaterials(model.records)} mode="effects" />
{:else if model.type === 'list' && model.path === '/stage-boxes'}
  <StageBoxExplorer boxes={asStageBoxes(model.records)} />
{:else if model.type === 'list' && model.path === '/monsters'}
  <MonsterExplorer monsters={asMonsters(model.records)} animations={monsterAnimationsFeature} />
{:else if model.type === 'list' && model.path === '/buffs'}
  <ReferenceIndex model={phase5Reference('buffs', model.path, model.title, model.records)} />
{:else if model.type === 'list' && model.path === '/status-effects'}
  <ReferenceIndex model={phase5Reference('statusEffects', model.path, model.title, model.records)} />
{:else if model.type === 'list' && model.path === '/pets'}
  <ReferenceIndex model={phase5Reference('pets', model.path, model.title, model.records)} />
{:else if model.type === 'list'}
  <DatabaseFrame title={model.title} intro={listIntro(model.path)} count={model.records.length} countLabel={nounFor(model.path)}>
    <EntityGrid records={model.records} hrefFor={hrefForRecord} />
  </DatabaseFrame>
{:else if model.type === 'detail' && model.record.kind === 'stage'}
  <StageDetail stage={model.record} lookup={contentRepository.get} hrefFor={hrefForRecord} />
{:else if model.type === 'detail' && model.record.kind === 'gear'}
  <ItemDetail gear={model.record} boxes={asStageBoxes(relatedFor(model.record))} />
{:else if model.type === 'detail' && model.record.kind === 'hero'}
  <HeroDetail hero={model.record as HeroRecord} heroes={asHeroes()} skills={heroSkills} />
{:else if model.type === 'detail' && model.record.kind === 'rune'}
  <RuneDetail rune={model.record} tree={runeTreeFeature} related={asRunes(relatedFor(model.record))} />
{:else if model.type === 'detail' && (model.record.kind === 'skill' || model.record.kind === 'passiveSkill')}
  <SkillDetail skill={model.record} heroes={asHeroes()} />
{:else if model.type === 'detail' && model.record.kind === 'monster'}
  <MonsterDetail
    monster={model.record}
    stages={asStages(relatedFor(model.record))}
    animations={monsterAnimationsFeature}
    hrefFor={hrefForRecord}
  />
{:else if model.type === 'detail' && model.record.kind === 'statusEffect'}
  <ReferenceIndex model={phase5Reference('statusEffectDetail', model.path, model.title, undefined, model.record)} />
{:else if model.type === 'detail'}
  <DetailPage
    record={model.record}
    properties={propertiesFor(model.record)}
    related={relatedFor(model.record)}
    relatedHeading={model.record.kind === 'monster' ? 'Appears in' : 'Found in'}
    hrefFor={hrefForRecord}
  />
{:else if model.type === 'newsDetail'}
  <NewsSnapshotDetail {model} />
{:else if model.type === 'search'}
  <DatabaseFrame title="Search" intro="Search names, descriptions, systems, and related records." count={searchResults.length} countLabel="results">
    {#snippet toolbar()}
      <FilterBar query={searchQuery} onQuery={(query) => (searchQuery = query)} onReset={() => (searchQuery = '')} />
    {/snippet}
    <EntityGrid records={searchResults.map((result) => result.record)} hrefFor={hrefForRecord} />
  </DatabaseFrame>
{:else if model.type === 'reference'}
  <ReferenceIndex {model} />
{/if}

<Footer />
