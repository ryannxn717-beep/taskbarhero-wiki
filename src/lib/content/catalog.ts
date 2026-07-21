import rawCatalog from './data/catalog.json' with { type: 'json' };
import type {
  BuffRecord,
  ContentCatalog,
  ContentFamilyCounts,
  ContentKind,
  ContentRecord,
  EntityRef,
  GearGroup,
  GearRecord,
  GearType,
  GradeId,
  GradeRecord,
  HeroRecord,
  MaterialRecord,
  MonsterRecord,
  PassiveSkillRecord,
  PetRecord,
  RuneRecord,
  SkillRecord,
  StageBoxRecord,
  StageRecord,
  StatLine,
  StatusEffectRecord
} from './schema.ts';
import { validateCatalog } from './validate.ts';

type UnknownRecord = Record<string, unknown>;

function requireRecord(value: unknown, context: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${context}: expected an object`);
  }
  return value as UnknownRecord;
}

function optionalRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function requireRecords(value: unknown, context: string): UnknownRecord[] {
  if (!Array.isArray(value)) throw new Error(`${context}: expected an array`);
  return value.map((entry, index) => requireRecord(entry, `${context}[${index}]`));
}

function stringValue(value: unknown, context: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${context}: expected text`);
  return value.trim();
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown, context: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${context}: expected a finite number`);
  }
  return value;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function relation(kind: ContentKind, id: unknown): EntityRef {
  return { kind, id: String(id) };
}

function dedupeRelations(relations: EntityRef[]): EntityRef[] {
  const seen = new Set<string>();
  return relations.filter((entry) => {
    const key = `${entry.kind}:${entry.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function primitiveStats(value: unknown, excluded: string[] = []): StatLine[] {
  const record = optionalRecord(value);
  const excludedKeys = new Set(excluded);
  return Object.entries(record)
    .filter(
      ([key, entry]) =>
        !excludedKeys.has(key) &&
        ((typeof entry === 'number' && Number.isFinite(entry)) || typeof entry === 'string')
    )
    .map(([label, entry]) => ({ label, value: entry as string | number }));
}

function collectDropItemIds(value: unknown, ids = new Set<number>()): Set<number> {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectDropItemIds(entry, ids));
    return ids;
  }
  if (!value || typeof value !== 'object') return ids;
  const record = value as UnknownRecord;
  const group = optionalRecord(record.group);
  if (Array.isArray(group.items)) {
    for (const itemId of group.items) {
      const id = Number(itemId);
      if (Number.isFinite(id)) ids.add(id);
    }
  }
  Object.values(record).forEach((entry) => collectDropItemIds(entry, ids));
  return ids;
}

function collectStageBoxIds(value: unknown, ids = new Set<number>()): Set<number> {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStageBoxIds(entry, ids));
    return ids;
  }
  if (!value || typeof value !== 'object') return ids;
  const record = value as UnknownRecord;
  const box = optionalRecord(record.box);
  const boxId = Number(box.id);
  if (Number.isFinite(boxId)) ids.add(boxId);
  Object.values(record).forEach((entry) => collectStageBoxIds(entry, ids));
  return ids;
}

function arrayRecords(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is UnknownRecord => !!entry && typeof entry === 'object' && !Array.isArray(entry)
      )
    : [];
}

function createCatalog(snapshotValue: unknown): ContentCatalog {
  const snapshot = requireRecord(snapshotValue, 'catalog snapshot');
  const grades = requireRecords(snapshot.grades, 'grades');
  const gearRows = requireRecords(snapshot.gear, 'gear');
  const materialRows = requireRecords(snapshot.materials, 'materials');
  const stageBoxRows = requireRecords(snapshot.stageBoxes, 'stageBoxes');
  const stageRows = requireRecords(snapshot.stages, 'stages');
  const monsterRows = requireRecords(snapshot.monsters, 'monsters');
  const skillRows = requireRecords(snapshot.activeSkills, 'activeSkills');
  const passiveRows = requireRecords(snapshot.passiveSkills, 'passiveSkills');
  const runeRows = requireRecords(snapshot.runes, 'runes');
  const buffRows = requireRecords(snapshot.buffs, 'buffs');
  const statusRows = requireRecords(snapshot.statusEffects, 'statusEffects');
  const heroRows = requireRecords(snapshot.heroes, 'heroes');
  const petRows = requireRecords(snapshot.pets, 'pets');

  const itemKindById = new Map<number, ContentKind>();
  gearRows.forEach((row) => itemKindById.set(numberValue(row.id, 'gear id'), 'gear'));
  materialRows.forEach((row) => itemKindById.set(numberValue(row.id, 'material id'), 'material'));
  stageBoxRows.forEach((row) => itemKindById.set(numberValue(row.id, 'stage-box id'), 'stageBox'));
  const stageIds = new Set(stageRows.map((row) => numberValue(row.key, 'stage key')));
  const monsterIds = new Set(monsterRows.map((row) => numberValue(row.id, 'monster id')));
  const skillIds = new Set(skillRows.map((row) => numberValue(row.id, 'skill id')));
  const passiveIds = new Set(passiveRows.map((row) => numberValue(row.id, 'passive id')));
  const runeIds = new Set(runeRows.map((row) => numberValue(row.id, 'rune id')));
  const buffIds = new Set(buffRows.map((row) => numberValue(row.id, 'buff id')));

  const activeHeroes = new Map<number, Set<number>>();
  const passiveHeroes = new Map<number, Set<number>>();
  for (const hero of heroRows) {
    const heroId = numberValue(hero.id, 'hero id');
    const baseSkillId = Number(hero.SkillKey);
    if (Number.isFinite(baseSkillId)) {
      if (!activeHeroes.has(baseSkillId)) activeHeroes.set(baseSkillId, new Set());
      activeHeroes.get(baseSkillId)?.add(heroId);
    }
    for (const attribute of arrayRecords(hero.attributes)) {
      const activeSkill = optionalRecord(attribute.activeSkill);
      const activeId = Number(activeSkill.key);
      if (Number.isFinite(activeId)) {
        if (!activeHeroes.has(activeId)) activeHeroes.set(activeId, new Set());
        activeHeroes.get(activeId)?.add(heroId);
      }
      if (attribute.type === 'PASSIVESKILL') {
        const passiveId = Number(attribute.key);
        if (Number.isFinite(passiveId)) {
          if (!passiveHeroes.has(passiveId)) passiveHeroes.set(passiveId, new Set());
          passiveHeroes.get(passiveId)?.add(heroId);
        }
      }
    }
  }

  const records: ContentRecord[] = [];

  const gradeRecords: GradeRecord[] = grades.map((grade, order) => {
    const gradeId = stringValue(grade.GRADE, `grades[${order}].GRADE`) as GradeId;
    return {
      kind: 'grade',
      id: gradeId,
      slug: gradeId.toLowerCase(),
      name: titleCase(gradeId),
      summary: `Task Bar Hero ${titleCase(gradeId)} item grade`,
      image: null,
      searchTerms: [gradeId, titleCase(gradeId)],
      relations: [],
      source: grade,
      gradeId,
      order
    };
  });
  records.push(...gradeRecords);

  const gearRecords: GearRecord[] = gearRows.map((item) => {
    const id = numberValue(item.id, 'gear id');
    const detail = requireRecord(item.detail, `gear ${id} detail`);
    const gradeId = stringValue(item.grade, `gear ${id} grade`) as GradeId;
    const gearType = stringValue(item.gear, `gear ${id} type`) as GearType;
    const level = numberValue(item.level, `gear ${id} level`);
    const stageBoxIds = Array.isArray(item.stageBoxIds) ? item.stageBoxIds : [];
    return {
      kind: 'gear',
      id: String(id),
      slug: stringValue(item.slug, `gear ${id} slug`),
      name: stringValue(item.name, `gear ${id} name`),
      summary: `${titleCase(gradeId)} ${titleCase(gearType)} · Level ${level}`,
      image: optionalString(item.icon),
      searchTerms: [gradeId, gearType, String(item.group ?? ''), `Level ${level}`],
      relations: dedupeRelations([
        relation('grade', gradeId),
        ...stageBoxIds.map((boxId) => relation('stageBox', boxId))
      ]),
      source: item,
      gradeId,
      gearType,
      gearGroup: stringValue(item.group, `gear ${id} group`) as GearGroup,
      level,
      obtainable: stageBoxIds.length > 0,
      sellGold: numberValue(detail.sellGold, `gear ${id} sellGold`),
      cubeExp: numberValue(detail.cubeExp, `gear ${id} cubeExp`),
      stats: primitiveStats(detail.stats, ['GearKey', 'UniqueModKey'])
    };
  });
  records.push(...gearRecords);

  const materialRecords: MaterialRecord[] = materialRows.map((item) => {
    const id = numberValue(item.id, 'material id');
    const detail = requireRecord(item.detail, `material ${id} detail`);
    const technical = optionalRecord(item.material);
    const effects = optionalRecord(detail.matEffects);
    const effectGroups = optionalRecord(effects.groups);
    const gradeId = stringValue(item.grade, `material ${id} grade`) as GradeId;
    const stageBoxIds = Array.isArray(item.stageBoxIds) ? item.stageBoxIds : [];
    const name = stringValue(item.name, `material ${id} name`);
    const materialType =
      optionalString(technical.MATERIALTYPE) ?? optionalString(effects.type) ?? 'Unknown';
    return {
      kind: 'material',
      id: String(id),
      slug: stringValue(item.slug, `material ${id} slug`),
      name,
      summary: optionalString(detail.desc) ?? `${titleCase(gradeId)} ${titleCase(materialType)}`,
      image: optionalString(item.icon),
      searchTerms: [gradeId, materialType, titleCase(materialType)],
      relations: dedupeRelations([
        relation('grade', gradeId),
        ...stageBoxIds.map((boxId) => relation('stageBox', boxId))
      ]),
      source: item,
      gradeId,
      materialType,
      hasEffects: Object.keys(effectGroups).length > 0,
      effectGroups
    };
  });
  records.push(...materialRecords);

  const stageBoxRecords: StageBoxRecord[] = stageBoxRows.map((item) => {
    const id = numberValue(item.id, 'stage-box id');
    const gradeId = stringValue(item.grade, `stage box ${id} grade`) as GradeId;
    const drop = requireRecord(item.drop, `stage box ${id} drop`);
    const dropRelations = [...collectDropItemIds(drop)]
      .map((itemId) => {
        const kind = itemKindById.get(itemId);
        return kind ? relation(kind, itemId) : null;
      })
      .filter((entry): entry is EntityRef => entry !== null);
    return {
      kind: 'stageBox',
      id: String(id),
      slug: stringValue(item.slug, `stage box ${id} slug`),
      name: stringValue(item.name, `stage box ${id} name`),
      summary: `${titleCase(gradeId)} stage drop box`,
      image: optionalString(item.icon),
      searchTerms: [gradeId, 'chest', 'drop box'],
      relations: dedupeRelations([relation('grade', gradeId), ...dropRelations]),
      source: item,
      gradeId,
      drop
    };
  });
  records.push(...stageBoxRecords);

  const stageRecords: StageRecord[] = stageRows.map((stage) => {
    const id = numberValue(stage.key, 'stage key');
    const monsters = arrayRecords(stage.monsters);
    const boss = optionalRecord(stage.boss);
    const relations: EntityRef[] = [];
    for (const monster of monsters) {
      const monsterId = Number(monster.key);
      if (monsterIds.has(monsterId)) relations.push(relation('monster', monsterId));
    }
    const bossId = Number(boss.key);
    if (monsterIds.has(bossId)) relations.push(relation('monster', bossId));
    for (const boxId of collectStageBoxIds(stage.drops)) {
      relations.push(relation('stageBox', boxId));
    }
    for (const itemId of collectDropItemIds(stage.drops)) {
      const kind = itemKindById.get(itemId);
      if (kind) relations.push(relation(kind, itemId));
    }
    const next = Number(stage.next);
    if (stageIds.has(next)) relations.push(relation('stage', next));
    const difficulty = stringValue(stage.difficulty, `stage ${id} difficulty`);
    const act = numberValue(stage.act, `stage ${id} act`);
    const number = numberValue(stage.no, `stage ${id} number`);
    const level = numberValue(stage.level, `stage ${id} level`);
    return {
      kind: 'stage',
      id: String(id),
      slug: stringValue(stage.slug, `stage ${id} slug`),
      name: stringValue(stage.name, `stage ${id} name`),
      summary: `${titleCase(difficulty)} · Act ${act} Stage ${number} · Level ${level}`,
      image: optionalString(boss.portrait),
      searchTerms: [difficulty, `Act ${act}`, `Stage ${number}`, `Level ${level}`],
      relations: dedupeRelations(relations),
      source: stage,
      act,
      number,
      level,
      difficulty,
      waves: optionalNumber(stage.waves),
      kills: numberValue(stage.kills, `stage ${id} kills`),
      goldPerClear: numberValue(stage.goldPerClear, `stage ${id} goldPerClear`),
      expPerClear: numberValue(stage.expPerClear, `stage ${id} expPerClear`),
      mapPosition: requireRecord(stage.mapPosition, `stage ${id} mapPosition`)
    };
  });
  records.push(...stageRecords);

  const monsterRecords: MonsterRecord[] = monsterRows.map((monster) => {
    const id = numberValue(monster.id, 'monster id');
    const relations = arrayRecords(monster.stages)
      .map((stage) => Number(stage.key))
      .filter((stageId) => stageIds.has(stageId))
      .map((stageId) => relation('stage', stageId));
    const monsterType = stringValue(monster.MONSTERTYPE, `monster ${id} type`);
    return {
      kind: 'monster',
      id: String(id),
      slug: stringValue(monster.slug, `monster ${id} slug`),
      name: stringValue(monster.name, `monster ${id} name`),
      summary: `${titleCase(monsterType)} · ${String(monster.attackElements ?? '')}`,
      image: optionalString(monster.portrait),
      searchTerms: [monsterType, ...(Array.isArray(monster.attackElements) ? monster.attackElements.map(String) : [])],
      relations: dedupeRelations(relations),
      source: monster,
      monsterType,
      rewardGold: numberValue(monster.RewardGold, `monster ${id} RewardGold`),
      rewardExp: numberValue(monster.RewardExp, `monster ${id} RewardExp`),
      stats: primitiveStats(monster, [
        'MonsterKey',
        'RewardGold',
        'RewardExp',
        'DeadSoundKey',
        'SkillKey'
      ]).filter((stat) =>
        ['AttackDamage', 'AttackSpeed', 'MaxLife', 'MovementSpeed'].includes(stat.label)
      )
    };
  });
  records.push(...monsterRecords);

  const skillRecords: SkillRecord[] = skillRows.map((skill) => {
    const id = numberValue(skill.id, 'skill id');
    const levels = Array.isArray(skill.levels) ? skill.levels : [];
    const heroIds = [...(activeHeroes.get(id) ?? [])].map(String);
    const activation = optionalString(skill.ACTIVATIONTYPE) ?? 'Unknown';
    const element = optionalString(skill.DamageType) ?? 'None';
    const name = stringValue(skill.name, `skill ${id} name`);
    return {
      kind: 'skill',
      id: String(id),
      slug: stringValue(skill.slug, `skill ${id} slug`),
      name,
      summary: optionalString(skill.description) ?? `${titleCase(activation)} ${titleCase(element)} skill`,
      image: null,
      searchTerms: [activation, element, optionalString(skill.DamageDeliveryType) ?? ''],
      relations: heroIds.map((heroId) => relation('hero', heroId)),
      source: skill,
      heroIds,
      activation,
      element,
      range: numberValue(skill.Range, `skill ${id} range`),
      maxLevel: levels.length,
      cooldownSeconds: null,
      stats: primitiveStats(skill, ['SkillKey', 'Range', 'Order', 'SoundKey'])
    };
  });
  records.push(...skillRecords);

  const passiveRecords: PassiveSkillRecord[] = passiveRows.map((passive) => {
    const id = numberValue(passive.id, 'passive id');
    const heroIds = [...(passiveHeroes.get(id) ?? [])].map(String);
    const stat = stringValue(passive.STATTYPE, `passive ${id} stat`);
    return {
      kind: 'passiveSkill',
      id: String(id),
      slug: stringValue(passive.slug, `passive ${id} slug`),
      name: stringValue(passive.name, `passive ${id} name`),
      summary: `${titleCase(stat)} ${String(passive.MODTYPE ?? '')}`,
      image: null,
      searchTerms: [stat, String(passive.MODTYPE ?? '')],
      relations: heroIds.map((heroId) => relation('hero', heroId)),
      source: passive,
      heroIds,
      stats: [{ label: stat, value: numberValue(passive.Value, `passive ${id} value`) }]
    };
  });
  records.push(...passiveRecords);

  const runeRecords: RuneRecord[] = runeRows.map((rune) => {
    const id = numberValue(rune.id, 'rune id');
    const nextRelations = arrayRecords(rune.next_runes)
      .map((next) => Number(next.key))
      .filter((nextId) => runeIds.has(nextId))
      .map((nextId) => relation('rune', nextId));
    const maxLevel = numberValue(rune.MaxLevel, `rune ${id} MaxLevel`);
    return {
      kind: 'rune',
      id: String(id),
      slug: stringValue(rune.slug, `rune ${id} slug`),
      name: stringValue(rune.name, `rune ${id} name`),
      summary: `Maximum level ${maxLevel}`,
      image: optionalString(rune.icon),
      searchTerms: [String(rune.IconPath ?? '')],
      relations: dedupeRelations(nextRelations),
      source: rune,
      maxLevel,
      stats: []
    };
  });
  records.push(...runeRecords);

  const buffRecords: BuffRecord[] = buffRows.map((buff) => {
    const id = numberValue(buff.id, 'buff id');
    const stat = stringValue(buff.STATTYPE, `buff ${id} stat`);
    const buffType = stringValue(buff.BuffType, `buff ${id} type`);
    const value = optionalNumber(buff.Value);
    return {
      kind: 'buff',
      id: String(id),
      slug: stringValue(buff.slug, `buff ${id} slug`),
      name: stringValue(buff.name, `buff ${id} name`),
      summary: `${titleCase(buffType)} · ${titleCase(stat)}`,
      image: null,
      searchTerms: [buffType, stat, String(buff.MODTYPE ?? '')],
      relations: [],
      source: buff,
      buffType,
      stats: value === null ? [] : [{ label: stat, value }]
    };
  });
  records.push(...buffRecords);

  const statusRecords: StatusEffectRecord[] = statusRows.map((status) => {
    const id = numberValue(status.id, 'status effect id');
    const relations = arrayRecords(status.buffs)
      .map((buff) => Number(buff.BuffKey))
      .filter((buffId) => buffIds.has(buffId))
      .map((buffId) => relation('buff', buffId));
    const duration = optionalNumber(status.Duration);
    return {
      kind: 'statusEffect',
      id: String(id),
      slug: stringValue(status.slug, `status effect ${id} slug`),
      name: stringValue(status.name, `status effect ${id} name`),
      summary: duration === null ? 'Persistent status effect' : `Duration ${duration / 100}s`,
      image: null,
      searchTerms: [String(status.OverrideType ?? '')],
      relations: dedupeRelations(relations),
      source: status,
      durationSeconds: duration === null ? null : duration / 100,
      stats: arrayRecords(status.buffs).flatMap((buff) => primitiveStats(buff, ['BuffKey']))
    };
  });
  records.push(...statusRecords);

  const heroRecords: HeroRecord[] = heroRows.map((hero) => {
    const id = numberValue(hero.id, 'hero id');
    const relations: EntityRef[] = [];
    const baseSkillId = Number(hero.SkillKey);
    if (skillIds.has(baseSkillId)) relations.push(relation('skill', baseSkillId));
    const attributes = arrayRecords(hero.attributes);
    for (const attribute of attributes) {
      const activeSkillId = Number(optionalRecord(attribute.activeSkill).key);
      if (skillIds.has(activeSkillId)) relations.push(relation('skill', activeSkillId));
      const passiveId = Number(attribute.key);
      if (attribute.type === 'PASSIVESKILL' && passiveIds.has(passiveId)) {
        relations.push(relation('passiveSkill', passiveId));
      }
    }
    const role = stringValue(hero.ClassType, `hero ${id} class`);
    return {
      kind: 'hero',
      id: String(id),
      slug: stringValue(hero.slug, `hero ${id} slug`),
      name: stringValue(hero.name, `hero ${id} name`),
      summary: stringValue(hero.description, `hero ${id} description`),
      image: optionalString(hero.icon),
      searchTerms: [role, String(hero.MainWeaponGearType ?? ''), String(hero.SubWeaponGearType ?? '')],
      relations: dedupeRelations(relations),
      source: hero,
      role,
      stats: primitiveStats(hero).filter((stat) =>
        [
          'AttackDamage',
          'AttackSpeed',
          'CastSpeed',
          'CriticalChance',
          'CriticalDamage',
          'MaxHp',
          'Armor',
          'CooldownReduction',
          'MovementSpeed'
        ].includes(stat.label)
      ),
      attributes
    };
  });
  records.push(...heroRecords);

  const petRecords: PetRecord[] = petRows.map((pet) => {
    const id = numberValue(pet.id, 'pet id');
    const monsterId = Number(pet.Param1);
    const unlockCondition = stringValue(pet.UnlockCondition, `pet ${id} unlockCondition`);
    const stat = optionalRecord(pet.stat);
    const statType = optionalString(stat.STATTYPE);
    return {
      kind: 'pet',
      id: String(id),
      slug: slugify(stringValue(pet.name, `pet ${id} name`)),
      name: stringValue(pet.name, `pet ${id} name`),
      summary: stringValue(pet.description, `pet ${id} description`),
      image: optionalString(pet.portrait),
      searchTerms: [unlockCondition, statType ?? ''],
      relations: monsterIds.has(monsterId) ? [relation('monster', monsterId)] : [],
      source: pet,
      role: 'Pet',
      unlockCondition,
      stats:
        statType && typeof stat.Value === 'number'
          ? [{ label: statType, value: stat.Value }]
          : []
    };
  });
  records.push(...petRecords);

  const count = (kind: ContentKind) => records.filter((record) => record.kind === kind).length;
  const counts: ContentFamilyCounts = {
    gear: count('gear'),
    grade: count('grade'),
    material: count('material'),
    stageBox: count('stageBox'),
    stage: count('stage'),
    monster: count('monster'),
    skill: count('skill'),
    passiveSkill: count('passiveSkill'),
    rune: count('rune'),
    buff: count('buff'),
    statusEffect: count('statusEffect'),
    hero: count('hero'),
    pet: count('pet'),
    materialEffects: materialRecords.filter((material) => material.hasEffects).length
  };

  const scope = requireRecord(snapshot.scope, 'snapshot scope');
  return {
    version: 1,
    siteName: stringValue(snapshot.siteName, 'site name'),
    locale: stringValue(snapshot.locale, 'snapshot locale') as 'en-US',
    gradeOrder: (snapshot.gradeOrder as GradeId[]) ?? [],
    gearTypeOrder: (snapshot.gearTypeOrder as GearType[]) ?? [],
    counts,
    records,
    features: {
      portalMap: requireRecord(snapshot.portalMap, 'portalMap'),
      runeTree: requireRecord(snapshot.runeTree, 'runeTree'),
      monsterAnimations: requireRecord(snapshot.monsterAnimations, 'monsterAnimations'),
      references: requireRecord(snapshot.references, 'references'),
      unavailableGearCombinations: Array.isArray(scope.unavailableGearCombinations)
        ? scope.unavailableGearCombinations.map(String)
        : []
    }
  };
}

export const contentCatalog = validateCatalog(createCatalog(rawCatalog as unknown));
