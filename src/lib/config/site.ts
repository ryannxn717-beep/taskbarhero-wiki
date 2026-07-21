export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  count?: number;
  badge?: 'BETA' | 'NEW';
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export interface SiteConfig {
  shortName: string;
  name: string;
  locale: 'en';
  noIndex: boolean;
  patch: string;
  announcement: {
    label: string;
    message: string;
    links: { label: string; href: string }[];
  };
  navigation: NavigationGroup[];
  footer: {
    disclaimer: string;
    rights: string;
  };
}

export const siteConfig: SiteConfig = {
  shortName: 'TBH',
  name: 'Task Bar Hero Wiki',
  locale: 'en',
  noIndex: true,
  patch: 'v1.00.17',
  announcement: {
    label: 'NEW',
    message: 'live Steam Market prices are in',
    links: [
      { label: 'browse the Market', href: '/market' },
      { label: 'value your inventory', href: '/inventory-value' }
    ]
  },
  navigation: [
    {
      label: 'Gear & Items',
      items: [
        { label: 'Gear', href: '/gear', icon: '/game/ui/SWORD_300001.png', count: 200 },
        {
          label: 'Grades',
          href: '/grades',
          icon: '/game/ui/AllHeroAttackDamagePercent.png',
          count: 10
        },
        {
          label: 'Materials',
          href: '/materials',
          icon: '/game/ui/Icon_Material_DeActive.png',
          count: 125
        },
        {
          label: 'Material Effects',
          href: '/effects',
          icon: '/game/ui/SlotIcon_Decoration.png',
          count: 79
        }
      ]
    },
    {
      label: 'Stages & Monsters',
      items: [
        {
          label: 'Stages',
          href: '/stages',
          icon: '/game/ui/AdditionalGoldActBoss.png',
          count: 120
        },
        {
          label: 'Stage Boxes',
          href: '/stage-boxes',
          icon: '/game/ui/Item_910011.png',
          count: 59
        },
        {
          label: 'Monsters',
          href: '/monsters',
          icon: '/game/ui/BasicSlime_Idle_character_3.png',
          count: 61
        }
      ]
    },
    {
      label: 'Combat',
      items: [
        {
          label: 'Skills & Passives',
          href: '/skills',
          icon: '/game/ui/Skill_30101.png',
          count: 214
        },
        {
          label: 'Runes',
          href: '/runes',
          icon: '/game/ui/AllHeroAttackDamage.png',
          count: 197
        },
        { label: 'Buffs', href: '/buffs', icon: '/game/ui/AdditionalExp.png', count: 29 },
        {
          label: 'Status Effects',
          href: '/status-effects',
          icon: '/game/ui/AdditionalGold.png',
          count: 6
        }
      ]
    },
    {
      label: 'Characters',
      items: [
        { label: 'Heroes', href: '/heroes', icon: '/game/ui/Knight_Idle_0.png', count: 6 },
        {
          label: 'Pets',
          href: '/pets',
          icon: '/game/ui/DragonHatchling_Idle_character_0.png',
          count: 8
        }
      ]
    },
    {
      label: 'Cube',
      items: [
        { label: 'Overview', href: '/cube', icon: '/game/ui/CubeLevel_DemonEye.png' },
        { label: 'Synthesis', href: '/synthesis', icon: '/game/ui/Icon_Cube_Synthesis.png' },
        {
          label: 'Alchemy',
          href: '/alchemy',
          icon: '/game/ui/Icon_Cube_Category1_Alchemy.png'
        },
        { label: 'Crafting', href: '/crafting', icon: '/game/ui/Icon_Cube_Crafting.png' },
        {
          label: 'Decoration',
          href: '/decoration',
          icon: '/game/ui/Icon_Cube_Decoration.png'
        },
        { label: 'Engraving', href: '/engraving', icon: '/game/ui/Icon_Cube_Engraving.png' },
        {
          label: 'Inscription',
          href: '/inscription',
          icon: '/game/ui/Icon_Cube_Inscription.png'
        },
        { label: 'Extraction', href: '/extraction', icon: '/game/ui/Icon_Cube_Detach.png' },
        { label: 'Offering', href: '/offering', icon: '/game/ui/Icon_Cube_Offering.png' }
      ]
    },
    {
      label: 'Market',
      items: [
        { label: 'Market', href: '/market', icon: '/game/ui/Icon_Gold.png', badge: 'BETA' },
        {
          label: 'Inventory Value',
          href: '/inventory-value',
          icon: '/game/ui/Item_930011.png',
          badge: 'NEW'
        }
      ]
    },
    {
      label: 'Tools',
      items: [
        {
          label: 'Farming Optimizer',
          href: '/tools/farming',
          icon: '/game/ui/Icon_Gold_3_0.png'
        },
        { label: 'BiS Finder', href: '/tools/bis', icon: '/game/ui/MenuButton_Stat_Hover.png' },
        {
          label: 'Damage Calculator',
          href: '/tools/damage',
          icon: '/game/ui/AllHeroArmor.png'
        },
        {
          label: 'Cube leveling',
          href: '/tools/cube-leveling',
          icon: '/game/ui/Icon_Cube_Category1_Alchemy.png'
        },
        { label: 'Drop Finder', href: '/tools/drops', icon: '/game/ui/Item_930011.png' },
        {
          label: 'Save Inspector',
          href: '/save-inspector',
          icon: '/game/ui/MenuButton_Stat_Active.png',
          badge: 'BETA'
        }
      ]
    },
    {
      label: 'Community',
      items: [
        { label: 'Guides', href: '/guides', icon: '/game/ui/Icon_Guides.png' },
        {
          label: 'Builds',
          href: '/builds',
          icon: '/game/ui/Arrange_StatusShortcutButton_Active.png',
          badge: 'BETA'
        },
        { label: 'Tier Lists', href: '/tier-lists', icon: '/game/ui/TierText_T1.png' }
      ]
    },
    {
      label: 'Reference',
      items: [
        {
          label: 'Mechanics',
          href: '/mechanics',
          icon: '/game/ui/AllHeroAttackDamage.png'
        },
        {
          label: 'Achievements',
          href: '/achievements',
          icon: '/game/ui/Icon_BossSoulstone.png'
        },
        { label: 'News', href: '/news', icon: '/game/ui/Icon_Notice.png' },
        { label: 'All Data', href: '/database', icon: '/game/ui/Icon_Setting.png', count: 45 }
      ]
    }
  ],
  footer: {
    disclaimer:
      'A community-made wiki & database for TBH: Task Bar Hero, datamined straight from the game. Fan project - not affiliated with or endorsed by the developer.',
    rights: 'All game content, names and assets are property of their respective owners.'
  }
};
