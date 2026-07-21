export const homeStats = [
  { value: 200, label: 'items and gear' },
  { value: 6, label: 'playable classes' },
  { value: 120, label: 'stage entries' },
  { value: 1, label: 'language' }
] as const;

export const numberTiles = [
  { value: 200, label: 'Gear', href: '/gear' },
  { value: 197, label: 'Runes', href: '/runes' },
  { value: 120, label: 'Stages', href: '/stages' },
  { value: 61, label: 'Monsters', href: '/monsters' },
  { value: 106, label: 'Skills', href: '/skills' },
  { value: 125, label: 'Materials', href: '/materials' },
  { value: 533, label: 'Synthesis', href: '/synthesis' },
  { value: 56, label: 'Crafting', href: '/crafting' },
  { value: 8, label: 'Pets', href: '/pets' }
] as const;

export const communityCards = [
  {
    kind: 'BUILD',
    title: 'LEVEL 80 ENDGAME BUILD',
    detail: 'General · local community fixture',
    score: 726,
    href: '/builds',
    icon: '/game/ui/Arrange_StatusShortcutButton_Active.png'
  },
  {
    kind: 'TIER',
    title: 'MID — END',
    detail: 'Heroes · local community fixture',
    score: 149,
    href: '/tier-lists',
    icon: '/game/ui/TierText_T1.png'
  },
  {
    kind: 'GUIDE',
    title: 'ATTACK SPEED',
    detail: 'Ranger setup · local community fixture',
    score: 86,
    href: '/guides',
    icon: '/game/ui/Icon_Guides.png'
  }
] as const;

export const featuredHeroes = [
  {
    name: 'Knight',
    href: '/heroes/knight',
    image: '/game/content/heroes/full/knight.png'
  },
  {
    name: 'Ranger',
    href: '/heroes/ranger',
    image: '/game/content/heroes/full/ranger.png'
  },
  {
    name: 'Sorcerer',
    href: '/heroes/sorcerer',
    image: '/game/content/heroes/full/sorcerer.png'
  },
  {
    name: 'Priest',
    href: '/heroes/priest',
    image: '/game/content/heroes/full/priest.png'
  },
  {
    name: 'Hunter',
    href: '/heroes/hunter',
    image: '/game/content/heroes/full/hunter.png'
  },
  {
    name: 'Slayer',
    href: '/heroes/slayer',
    image: '/game/content/heroes/full/slayer.png'
  }
] as const;

export const categoryDescriptions: Record<string, string> = {
  '/achievements': 'Every achievement and what it takes to unlock it.',
  '/alchemy': 'Convert materials into one another and bank Cube EXP.',
  '/database': 'Browse the raw datamined tables behind the wiki.',
  '/tools/bis': 'Best-in-slot gear for each hero, scored against your own save.',
  '/buffs': 'Temporary boosts, what they do and how long they last.',
  '/builds': 'Hero builds shared by the community — copy, tweak and vote.',
  '/crafting': 'Recipes that forge gear and materials from what you have gathered.',
  '/tools/cube-leveling': 'Plan the cheapest route to your next Cube level.',
  '/tools/damage': 'Estimate hero damage from your stats, skills and runes.',
  '/decoration': 'Slot decorations onto gear for extra stats.',
  '/tools/drops': 'Look up which stages and boxes drop any item.',
  '/engraving': 'Engrave permanent stat lines onto your equipment.',
  '/extraction': 'Pull materials and effects back out of gear you are done with.',
  '/tools/farming': 'Find the best stage to farm gold or a target drop from your save.',
  '/gear': 'Weapons, armor and accessories — stats, grades and drop sources.',
  '/grades': 'The rarity ladder from Common to Cosmic, and what each tier means.',
  '/guides': 'Player-written guides, from first steps to deep dives.',
  '/heroes': 'The playable classes, their skills and signature playstyles.',
  '/inscription': 'Inscribe bonus effects and reroll the lines you do not want.',
  '/inventory-value': 'Value your inventory with the local market fixture.',
  '/market': 'Explore the local market-price and volume experience.',
  '/effects': 'Every effect a material can grant, and the gear it rolls on.',
  '/materials': 'Crafting and synthesis materials by type, rarity and drop source.',
  '/mechanics': 'How the game’s core systems work, explained plainly.',
  '/monsters': 'Enemies and bosses, with HP, attacks and spawn locations.',
  '/news': 'Patch notes and updates as the game evolves.',
  '/offering': 'Hand materials to the Cube for rewards and EXP.',
  '/cube': 'How the Cube works and every operation it unlocks.',
  '/pets': 'Companion pets and the bonuses they bring your team.',
  '/runes': 'Every rune, its bonus and the stat it boosts.',
  '/save-inspector': 'Read a browser-local save fixture, roster, gear and progress.',
  '/skills': 'Active skills and passive talents, with scaling and cooldowns.',
  '/stage-boxes': 'Stage-clear loot boxes and everything each one can contain.',
  '/stages': 'Every stage with its monsters, drops and gold-per-run.',
  '/status-effects': 'Burn, freeze, stun and the other states that swing a fight.',
  '/synthesis': 'Combine nine materials to roll a higher grade — odds and tiers.',
  '/tier-lists': 'Community rankings of heroes and gear, by game version.'
};
