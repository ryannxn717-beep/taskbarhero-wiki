export interface MechanicsRarity {
  name: string;
  color: string;
}

export interface MechanicsAbilityGroup {
  name: string;
  abilities: readonly string[];
}

export interface AchievementEntry {
  id: string;
  title: string;
  summary: string;
  rate: number;
  icon: string;
}

export interface NewsEntry {
  id: string;
  category: string;
  date: string;
  author: string;
  title: string;
  summary: string;
}

export interface DatabaseDataset {
  label: string;
  count: number;
  href: string;
}

export interface DatabaseGroup {
  title: string;
  datasets: readonly DatabaseDataset[];
}

const SITE_CONTENT = {
  "achievements": [
    {
      "id": "achievement-01",
      "title": "Hero Out of the Taskbar",
      "summary": "Clear stage 1-1 for the first time.",
      "rate": 100
    },
    {
      "id": "achievement-02",
      "title": "TBH, This Game Slaps",
      "summary": "Clear stage 1-10 for the first time!",
      "rate": 100
    },
    {
      "id": "achievement-03",
      "title": "Gone Without a Trace",
      "summary": "Defeat 1,000 monsters.",
      "rate": 100
    },
    {
      "id": "achievement-04",
      "title": "I Was Just Idling...",
      "summary": "Defeat 10,000 monsters.",
      "rate": 100
    },
    {
      "id": "achievement-05",
      "title": "Package Delivered~",
      "summary": "Open 10 normal boxes.",
      "rate": 100
    },
    {
      "id": "achievement-06",
      "title": "A Gift from the Boss",
      "summary": "Open 10 stage boss boxes.",
      "rate": 100
    },
    {
      "id": "achievement-07",
      "title": "Tasted the Power of Synthesis",
      "summary": "Successfully synthesize an Uncommon grade item for the first time.",
      "rate": 100
    },
    {
      "id": "achievement-08",
      "title": "Hey, Not Bad!",
      "summary": "Successfully synthesize a Rare grade item for the first time.",
      "rate": 100
    },
    {
      "id": "achievement-09",
      "title": "Hero's First Awakening",
      "summary": "Reach Hero level 10 for the first time.",
      "rate": 100
    },
    {
      "id": "achievement-10",
      "title": "Friend of the Night",
      "summary": "Unlock the Bat pet.",
      "rate": 97
    },
    {
      "id": "achievement-11",
      "title": "Still Warming Up",
      "summary": "Reach Hero level 20 for the first time.",
      "rate": 95.2
    },
    {
      "id": "achievement-12",
      "title": "Still Not Off the Clock",
      "summary": "Clear stage 2-10 for the first time!",
      "rate": 94.7
    },
    {
      "id": "achievement-13",
      "title": "Monsters? What Monsters?",
      "summary": "Defeat 100,000 monsters.",
      "rate": 93.2
    },
    {
      "id": "achievement-14",
      "title": "Starlit Gear",
      "summary": "Obtain an Arcana grade gear for the first time.",
      "rate": 92.2
    },
    {
      "id": "achievement-15",
      "title": "The Big Boss's Treasure",
      "summary": "Open 10 act boss boxes.",
      "rate": 90.8
    },
    {
      "id": "achievement-16",
      "title": "Normal? That's Boring.",
      "summary": "Clear Normal mode for the first time!",
      "rate": 87.5
    },
    {
      "id": "achievement-17",
      "title": "Legends Are Made, Not Born",
      "summary": "Successfully synthesize a Legendary grade item for the first time.",
      "rate": 87.1
    },
    {
      "id": "achievement-18",
      "title": "First Paycheck",
      "summary": "Earn 1,000 gold.",
      "rate": 86.5
    },
    {
      "id": "achievement-19",
      "title": "Gear Beyond Limits",
      "summary": "Obtain a Beyond grade gear for the first time.",
      "rate": 83.5
    },
    {
      "id": "achievement-20",
      "title": "Rookie Merchant",
      "summary": "List an item on the Trading Ship for the first time.",
      "rate": 78.9
    },
    {
      "id": "achievement-21",
      "title": "The Nightmare Begins",
      "summary": "Clear Nightmare mode for the first time!",
      "rate": 78.7
    },
    {
      "id": "achievement-22",
      "title": "Getting the Hang of It",
      "summary": "Reach Hero level 30 for the first time.",
      "rate": 77.4
    },
    {
      "id": "achievement-23",
      "title": "The Sacred Calling",
      "summary": "Unlock the Priest hero.",
      "rate": 75.2
    },
    {
      "id": "achievement-24",
      "title": "A Decorative Awakening",
      "summary": "Successfully apply a Tier 1+ decoration option for the first time.",
      "rate": 73.5
    },
    {
      "id": "achievement-25",
      "title": "Horroric Cube",
      "summary": "Reach Cube level 10.",
      "rate": 68.9
    },
    {
      "id": "achievement-26",
      "title": "Recipe for Immortality",
      "summary": "Successfully synthesize an Immortal grade item for the first time.",
      "rate": 67.4
    },
    {
      "id": "achievement-27",
      "title": "Millionaire Dreams",
      "summary": "Earn 1,000,000 gold.",
      "rate": 65.4
    },
    {
      "id": "achievement-28",
      "title": "Hell? Better Than Monday.",
      "summary": "Clear Hell mode for the first time!",
      "rate": 65.2
    },
    {
      "id": "achievement-29",
      "title": "Alchemy 101",
      "summary": "Earn 1,000 gold through alchemy.",
      "rate": 64.6
    },
    {
      "id": "achievement-30",
      "title": "Heaven-Sent Gear",
      "summary": "Obtain a Celestial grade gear for the first time.",
      "rate": 64.4
    },
    {
      "id": "achievement-31",
      "title": "Accessory Workshop: OPEN!",
      "summary": "Successfully craft a Common grade or higher accessory for the first time.",
      "rate": 63.2
    },
    {
      "id": "achievement-32",
      "title": "Half-Legend",
      "summary": "Reach Hero level 50 for the first time.",
      "rate": 63.1
    },
    {
      "id": "achievement-33",
      "title": "Baby Steps in Engraving",
      "summary": "Successfully apply a Tier 1+ engraving option for the first time.",
      "rate": 53.1
    },
    {
      "id": "achievement-34",
      "title": "Unleashed Potential",
      "summary": "Reach Hero level 60 for the first time.",
      "rate": 51.5
    },
    {
      "id": "achievement-35",
      "title": "In the Blink of an Eye",
      "summary": "Clear any stage within 10 seconds.",
      "rate": 49.5
    },
    {
      "id": "achievement-36",
      "title": "First Wish",
      "summary": "Successfully make an offering for the first time.",
      "rate": 49
    },
    {
      "id": "achievement-37",
      "title": "Blessed by the Divine",
      "summary": "Obtain a Divine grade gear for the first time.",
      "rate": 48.8
    },
    {
      "id": "achievement-38",
      "title": "The Immortal Artisan",
      "summary": "Successfully craft an Immortal grade or higher accessory for the first time.",
      "rate": 48.6
    },
    {
      "id": "achievement-39",
      "title": "Essence Extracted",
      "summary": "Successfully extract for the first time.",
      "rate": 47.4
    },
    {
      "id": "achievement-40",
      "title": "Chosen by the Cosmos",
      "summary": "Obtain a Cosmic grade gear for the first time.",
      "rate": 44.7
    },
    {
      "id": "achievement-41",
      "title": "Almost There",
      "summary": "Reach Hero level 70 for the first time.",
      "rate": 44.6
    },
    {
      "id": "achievement-42",
      "title": "Decoration is an Art",
      "summary": "Successfully apply a Tier 5+ decoration option for the first time.",
      "rate": 43.5
    },
    {
      "id": "achievement-43",
      "title": "Overflowing Vault",
      "summary": "Earn 100,000,000 gold.",
      "rate": 42.5
    },
    {
      "id": "achievement-44",
      "title": "The Philosopher's Stone",
      "summary": "Earn 1,000,000 gold through alchemy.",
      "rate": 41
    },
    {
      "id": "achievement-45",
      "title": "Decubed Cain",
      "summary": "Reach Cube level 50.",
      "rate": 39.1
    },
    {
      "id": "achievement-46",
      "title": "Legend of the Taskbar",
      "summary": "Reach Hero level 80 for the first time.",
      "rate": 37.5
    },
    {
      "id": "achievement-47",
      "title": "Outshining Jewels",
      "summary": "Successfully apply a Tier 5+ engraving option for the first time.",
      "rate": 34.4
    },
    {
      "id": "achievement-48",
      "title": "Let's Try Inscribing",
      "summary": "Successfully apply a Tier 1+ inscription option for the first time.",
      "rate": 25.6
    },
    {
      "id": "achievement-49",
      "title": "Like a Ghost",
      "summary": "Clear Nightmare 3-10 act boss without getting hit.",
      "rate": 16.2
    },
    {
      "id": "achievement-50",
      "title": "Heroes Never Walk Alone",
      "summary": "Raise 4 heroes to level 50 or above.",
      "rate": 15.9
    },
    {
      "id": "achievement-51",
      "title": "Etched into the Soul",
      "summary": "Successfully apply a Tier 5+ inscription option for the first time.",
      "rate": 12.9
    },
    {
      "id": "achievement-52",
      "title": "Solo Shift in Hell",
      "summary": "Clear Hell 3-10 solo.",
      "rate": 10.1
    },
    {
      "id": "achievement-53",
      "title": "Two's Company",
      "summary": "Clear Torment 3-10 with a 2-player party.",
      "rate": 7.1
    },
    {
      "id": "achievement-54",
      "title": "...Wait, I'm the Only One Left?",
      "summary": "Clear Normal 3-10 act boss with 2 party members dead in a 3-player party.",
      "rate": 5.3
    },
    {
      "id": "achievement-55",
      "title": "Obsession? No, Dedication.",
      "summary": "Attempt inscription 100 times on the same item.",
      "rate": 0.2
    },
    {
      "id": "achievement-56",
      "title": "The Perfectionist",
      "summary": "Complete all decoration/engraving/inscription on all equipped gear (for items with 2/2/2 slots).",
      "rate": 0.2
    }
  ],
  "news": [
    {
      "id": "hotfix-update-ver-1-00-28",
      "category": "Community Announcements",
      "date": "Jul 15, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.28",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.28. ■ Bug Fixes [*] Fixed an issue where save data conflicts in certain situations caused save files to become corrupted. [/*][*] Fixed an issue.."
    },
    {
      "id": "tbh-development-roadmap",
      "category": "Community Announcements",
      "date": "Jul 10, 2026",
      "author": "nugemstudio",
      "title": "TBH Development Roadmap",
      "summary": "Hello, This is the development team. Thank you to everyone who plays and continues to share your feedback with us. Recently, as many of you have been clearing the Torment difficulty, we've received a great deal of interest in our next.."
    },
    {
      "id": "hotfix-update-ver-1-00-27",
      "category": "Community Announcements",
      "date": "Jul 10, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.27",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.27. ■ Bug Fixes [*] Fixed an issue where Movement Speed slowed down when encountering monsters with a party composed only of ranged heroes..."
    },
    {
      "id": "hotfix-update-ver-1-00-26",
      "category": "Community Announcements",
      "date": "Jul 10, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.26",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.26. This update includes server-related changes, so a queue of up to about 20 minutes may occur after updating. ■ Bug Fixes [*] Fixed an issue.."
    },
    {
      "id": "additional-sanctions-against-cheating-users",
      "category": "Community Announcements",
      "date": "Jul 6, 2026",
      "author": "nugemstudio",
      "title": "Additional Sanctions Against Cheating Users",
      "summary": "Hello, This is the development team. To help maintain a healthy gaming environment, we conducted a review of cheating activity based on server data, and have applied additional sanctions to 20,406 users confirmed to have engaged in.."
    },
    {
      "id": "hotfix-update-ver-1-00-25",
      "category": "Community Announcements",
      "date": "Jul 4, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.25",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.25. ■ Improvements [*] To reduce mail server load, a 1-minute wait time has been applied to repeated mail claim requests. [/*] As always, thank.."
    },
    {
      "id": "hotfix-update-ver-1-00-24",
      "category": "Community Announcements",
      "date": "Jul 3, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.24",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.24. ■ Improvements [*] Slightly reduced the minimum acquisition cooldown for Common Treasure Chests and Stage Treasure Chests across all stages..."
    },
    {
      "id": "hotfix-update-ver-1-00-23",
      "category": "Community Announcements",
      "date": "Jul 2, 2026",
      "author": "nugemstudio",
      "title": "Hotfix Update [Ver 1.00.23]",
      "summary": "Hello, everyone. This is the development team of . A hotfix update has been applied. - Fixed an issue where DLC classes could be used without purchasing the DLC, and where the purchase information was reset upon reconnecting. - Fixed an.."
    },
    {
      "id": "server-disruption-compensation-update-ver-1-00-22",
      "category": "Community Announcements",
      "date": "Jul 2, 2026",
      "author": "nugemstudio",
      "title": "Server Disruption Compensation Update [Ver 1.00.22]",
      "summary": "Hello, This is the development team. An update has been applied that lets you receive compensation for the server disruption. ■ Server Disruption Compensation - Distribution Guide 1. Starting Thursday, July 2, 2026, we will distribute 10.."
    },
    {
      "id": "apology-for-server-issues-compensation-for-all-players",
      "category": "Community Announcements",
      "date": "Jun 30, 2026",
      "author": "nugemstudio",
      "title": "Apology for Server Issues & Compensation for All Players",
      "summary": "Hello, this is the development team. We sincerely apologize for the connection delays and various other inconveniences caused by server overload during the past month or so since launch. We tried to respond to these issues as quickly as.."
    },
    {
      "id": "steam-market-reopening-hotfix-ver-1-00-21",
      "category": "Community Announcements",
      "date": "Jun 25, 2026",
      "author": "nugemstudio",
      "title": "Steam Market Reopening & Hotfix [Ver 1.00.21]",
      "summary": "Hello, This is the development team. We would like to share today's update details. With today's update, the Steam Market has reopened, and a hotfix has been applied to stabilize the Market and resolve major bugs. Immediately after the.."
    },
    {
      "id": "update-delayed-by-an-additional-2-hours",
      "category": "Community Announcements",
      "date": "Jun 25, 2026",
      "author": "nugemstudio",
      "title": "Update Delayed by an Additional +2 Hours",
      "summary": "Hello, This is the development team. The Steam market open scheduled for today has been delayed by +2 hours. We sincerely apologize to everyone who has been waiting. 2026.06.25 (Thu) 02:00 (PDT | San Francisco) 2026.06.25 (Thu) 18:00 (KST.."
    },
    {
      "id": "notice-regarding-sanctions-against-cheating-players",
      "category": "Community Announcements",
      "date": "Jun 25, 2026",
      "author": "nugemstudio",
      "title": "Notice Regarding Sanctions Against Cheating Players",
      "summary": "Hello, This is the development team. To maintain a healthy gameplay environment, we conducted a review of cheating activity based on server data, and we have applied sanctions to 6,180 confirmed cheating accounts. ■ Players who created or.."
    },
    {
      "id": "steam-market-launch-schedule-hotfix-update-ver-1-00-20",
      "category": "Community Announcements",
      "date": "Jun 23, 2026",
      "author": "nugemstudio",
      "title": "Steam Market Launch Schedule & Hotfix Update [Ver 1.00.20]",
      "summary": "Hello, everyone. This is the development team. Work on the Steam Market is nearing completion, so we'd like to share the opening schedule with you. 2026.06.25 (Thu) 00:00 (PDT | San Francisco) 2026.06.25 (Thu) 16:00 (KST | Seoul).."
    },
    {
      "id": "hotfix-update-ver-1-00-19",
      "category": "Community Announcements",
      "date": "Jun 22, 2026",
      "author": "happyone",
      "title": "Hotfix Update [Ver 1.00.19]",
      "summary": "Hello, everyone. This is the development team. A hotfix update has been applied. ■ Fixed an issue where the maximum movement speed limit was incorrectly applied. We sincerely apologize for any inconvenience caused during gameplay. Thank.."
    },
    {
      "id": "hotfix-update-ver-1-00-18",
      "category": "Community Announcements",
      "date": "Jun 22, 2026",
      "author": "nugemstudio",
      "title": "Hotfix Update [Ver 1.00.18]",
      "summary": "Hello, everyone. This is the development team. A hotfix update has been applied. ■ Fixed an issue where stage changes were restricted when challenging the Act Boss multiple times in a row ■ Fixed a security vulnerability. We sincerely.."
    },
    {
      "id": "hotfix-update-ver-1-00-17",
      "category": "Community Announcements",
      "date": "Jun 20, 2026",
      "author": "nugemstudio",
      "title": "Hotfix Update - ver 1.00.17",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.17. We sincerely apologize for any inconvenience caused by the emergency server maintenance. ■ Patch Notes - Fixed an issue so that when an.."
    },
    {
      "id": "emergency-server-maintenance-notice",
      "category": "Community Announcements",
      "date": "Jun 20, 2026",
      "author": "happyone",
      "title": "Emergency Server Maintenance Notice",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. A server security issue has been identified, and we are carrying out emergency server maintenance. Fixes will be applied immediately, and we will post a separate notice once the.."
    },
    {
      "id": "hotfix-update-ver-1-00-16",
      "category": "Community Announcements",
      "date": "Jun 19, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.16",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.16. We sincerely apologize for the confusion caused by this bug. ■ Bug Fixes [*] Fixed an issue where the achievement for obtaining your first.."
    },
    {
      "id": "hotfix-update-ver-1-00-15",
      "category": "Community Announcements",
      "date": "Jun 19, 2026",
      "author": "happyone",
      "title": "Hotfix Update - ver 1.00.15",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.15. ■ Bug Fixes [*] Fixed an issue where the damage of the Priest's 'Wrath of Heaven' skill was applied abnormally high. [/*][*] Fixed an issue.."
    },
    {
      "id": "hotfix-update-ver-1-00-14",
      "category": "Community Announcements",
      "date": "Jun 17, 2026",
      "author": "nugemstudio",
      "title": "Hotfix Update [Ver 1.00.14]",
      "summary": "Hello, everyone. This is the development team for . A hotfix update has been applied. - Fixed an issue where Chests could be obtained more quickly when changing stages. - Fixed an issue where, if you reconnected while holding more than 5.."
    },
    {
      "id": "hotfix-ver-1-00-13",
      "category": "Community Announcements",
      "date": "Jun 15, 2026",
      "author": "happyone",
      "title": "Hotfix - ver 1.00.13",
      "summary": "Hello. This is the TBH : Task Bar Hero development team. The game has been updated to ver 1.00.13. ■ Bug Fixes [*] Fixed an issue where invalid chests could be received too quickly upon reconnecting. [/*][*] Fixed an issue where Decoration.."
    },
    {
      "id": "server-migration-update-ver-1-00-12",
      "category": "Community Announcements",
      "date": "Jun 15, 2026",
      "author": "nugemstudio",
      "title": "Server Migration Update (Ver 1.00.12)",
      "summary": "Hello, This is the development team. As the first step toward fundamentally resolving the issues caused by server overload, the server migration update has been carried out. ※ After connecting to version 1.00.12, connecting again with an.."
    },
    {
      "id": "update-delayed-by-an-additional-3-hours",
      "category": "Community Announcements",
      "date": "Jun 15, 2026",
      "author": "nugemstudio",
      "title": "Update Delayed by an Additional +3 Hours",
      "summary": "Hello, This is the development team. A critical issue was discovered right before the update was set to go live, so we've had no choice but to delay the update by an additional 3 hours (now +9 hours from the original schedule). We don't.."
    },
    {
      "id": "update-time-delay-advance-notice-1-hours",
      "category": "Community Announcements",
      "date": "Jun 15, 2026",
      "author": "nugemstudio",
      "title": "Update Time Delay & Advance Notice (+1 Hours)",
      "summary": "Hello, This is the development team. The scheduled time for the server migration update has been delayed by an additional +1 hours (+5 hours from the original plan). We sincerely apologize once again for the inconvenience caused to so many.."
    },
    {
      "id": "update-delay-notice-4-hours",
      "category": "Community Announcements",
      "date": "Jun 15, 2026",
      "author": "nugemstudio",
      "title": "Update Delay Notice (+4 Hours)",
      "summary": "Hello, This is the development team. The server migration update scheduled for midnight today (PDT, San Francisco) has been delayed by +4 hours. We sincerely apologize to everyone who has been waiting. ■ Scheduled Build Update Time a..."
    },
    {
      "id": "notice-of-terms-of-service-privacy-policy-update",
      "category": "Community Announcements",
      "date": "Jun 12, 2026",
      "author": "nugemstudio",
      "title": "Notice of Terms of Service & Privacy Policy Update",
      "summary": "Hello, This is the development team. We have received feedback from many users regarding the Terms posted on June 11. We sincerely thank everyone who shared their input. Accordingly, we have revised the Terms once again to align with the.."
    },
    {
      "id": "server-migration-update-steam-market-reopening-schedule",
      "category": "Community Announcements",
      "date": "Jun 11, 2026",
      "author": "nugemstudio",
      "title": "Server Migration Update & Steam Market Reopening Schedule",
      "summary": "Hello, This is the development team. Due to the current server overload, many of you have been unable to play the game properly. We sincerely apologize once again for the inconvenience this has caused. To fundamentally resolve this issue,.."
    },
    {
      "id": "notice-temporary-closure-of-the-steam-market",
      "category": "Community Announcements",
      "date": "Jun 8, 2026",
      "author": "nugemstudio",
      "title": "Notice: Temporary Closure of the Steam Market",
      "summary": "Hello, This is the development team. The feature for listing items on the Steam Market has been temporarily suspended. Accordingly, an update that disables the in-game Trade Ship menu has also been applied. Players on older versions can.."
    },
    {
      "id": "chest-error-hotfix-update-postponement-notice",
      "category": "Community Announcements",
      "date": "Jun 7, 2026",
      "author": "nugemstudio",
      "title": "Chest Error Hotfix & Update Postponement Notice",
      "summary": "Hello, This is the development team. We have identified an issue where chests were not appearing, and a hotfix update has been deployed. In addition, please note that the \"Relay Server Addition\" update scheduled for tomorrow has been.."
    }
  ]
} as const;

export const MECHANICS_MOD_TYPES = Object.freeze(['Flat', 'Additive', 'Multiplicative']);
export const MECHANICS_MOD_SOURCES = Object.freeze([
  'Base', 'Item', 'Attribute', 'Passive', 'Account Status', 'Status Effect', 'Buff Skill', 'Envirounment'
]);
export const MECHANICS_DELIVERY_TYPES = Object.freeze(['Melee', 'Projectile', 'AOE', 'Summon', 'Dot', 'Trap']);
export const MECHANICS_ELEMENTS = Object.freeze(['Physical', 'Fire', 'Cold', 'Lightning', 'Chaos', 'All Element']);
export const MECHANICS_STATUS_EFFECTS = Object.freeze(['Chill', 'Freeze', 'Ignite', 'Shock', 'Bleed', 'Stun']);
export const MECHANICS_STATS = Object.freeze([
  'Attack Damage', 'Attack Speed', 'Critical Chance', 'Critical Damage', 'Max HP', 'Armor', 'Movement Speed',
  'Area Of Effect', 'Base Attack Count Reduction', 'Cooldown Reduction', 'Skill Range Expansion', 'Fire Resistance',
  'Cold Resistance', 'Lightning Resistance', 'Chaos Resistance', 'Dodge Chance', 'Block Chance', 'Max Dodge Chance',
  'Max Block Chance', 'Multistrike', 'HP Leech', 'Projectile Count', 'HP Regen Per Sec', 'Physical Damage Percent',
  'Fire Damage Percent', 'Cold Damage Percent', 'Lightning Damage Percent', 'Chaos Damage Percent', 'Max Fire Resistance',
  'Max Cold Resistance', 'Max Lightning Resistance', 'Max Chaos Resistance', 'Add HP Per Hit', 'Damage Reduction',
  'Physical Damage Reduction', 'Fire Damage Reduction', 'Cold Damage Reduction', 'Lightning Damage Reduction',
  'Chaos Damage Reduction', 'Damage Absorption', 'Damage Addition', 'Physical Damage Addition', 'Fire Damage Addition',
  'Cold Damage Addition', 'Lightning Damage Addition', 'Chaos Damage Addition', 'Increase Exp Amount', 'Additional Exp',
  'Cast Speed', 'Skill Heal Increase', 'Skill Duration Increase', 'All Elemental Resistance', 'Increase Projectile Damage',
  'Increase Melee Damage', 'Increase Area Of Effect Damage', 'Increase Summon Damage', 'Increase Projectile Speed',
  'Add HP Per Kill', 'Add All Skill Level', 'Elemental Block Chance', 'Elemental Dodge Chance',
  'Max Elemental Block Chance', 'Max Elemental Dodge Chance'
]);
export const MECHANICS_GEAR_TYPES = Object.freeze([
  'Sword', 'Bow', 'Staff', 'Scepter', 'Crossbow', 'Axe', 'Shield', 'Arrow', 'Orb', 'Tome', 'Bolt', 'Hatchet',
  'Helmet', 'Armor', 'Gloves', 'Boots', 'Amulet', 'Earing', 'Ring', 'Bracer'
]);
export const MECHANICS_CRAFTING_SYSTEMS = Object.freeze([
  'Alchemy', 'Synthesis', 'Crafting', 'Decoration', 'Engraving', 'Inscription', 'Offering', 'Extraction'
]);
export const MECHANICS_RARITIES: readonly MechanicsRarity[] = Object.freeze([
  { name: 'Common', color: '#e4e4e4' },
  { name: 'Uncommon', color: '#54fc0c' },
  { name: 'Rare', color: '#0c6cfc' },
  { name: 'Legendary', color: '#fc9c0c' },
  { name: 'Immortal', color: '#fc2424' },
  { name: 'Arcana', color: '#b40cfc' },
  { name: 'Beyond', color: '#fc246c' },
  { name: 'Celestial', color: '#6ccce4' },
  { name: 'Divine', color: '#fce454' },
  { name: 'Cosmic', color: '#fcfcfc' }
]);
export const MECHANICS_ABILITY_GROUPS: readonly MechanicsAbilityGroup[] = Object.freeze([
  { name: 'Knight', abilities: ['Aegis Field', 'Base Attack', 'Dash Attack', 'Revenge Attack', 'Sacred Blade', 'Strong Attack', 'Unyielding Will'] },
  { name: 'Ranger', abilities: ['Arrow Rain Attack', 'Barrage Attack', 'Base Attack', 'Base Projectile', 'Piercing Arrow', 'Skewer Shot', 'Spread Shot Attack', 'Swift Surge'] },
  { name: 'Hunter', abilities: ['Base Attack', 'Charge Trap', 'Crossbow Turret', 'Explosive Bolt', 'Frost Bolt', 'Quick Loader', 'Shock Bolt'] },
  { name: 'Priest', abilities: ['Base Attack', 'Blessing Of Might', 'Blessing Of Warding', 'Heal', 'Resurrection', 'Sanctuary', 'Wrath Of Heaven'] },
  { name: 'Slayer', abilities: ['Axe Spin', 'Base Attack', 'Bloodlust', 'Commander Cry', 'Crushing Blow', 'Ground Slam', 'Slam Jump'] },
  { name: 'Sorcerer', abilities: ['Base Attack', 'Fireball', 'Flame Hydra', 'Ice Orb', 'Lightning', 'Meteor Strike', 'Snowstorm'] },
  { name: 'Act Boss', abilities: ['Bone Fall', 'Curved Projectile Base Attack', 'Dash Attack', 'Howling', 'Jump Attack', 'Massive Void Call', 'Monster Stab', 'Set Damage Reduction Mode', 'Soul Snatch', 'Spawn Undead', 'Spawn Void Turret', 'Void Thunder', 'Void Wave'] },
  { name: 'Shared / System', abilities: ['AOEHit Line Effect', 'Aegis Field', 'Bone Fall Area', 'Damage Absorb Component', 'Explosion Projectile', 'Frost Bolt', 'Massive Void Call Area', 'Melee Turret', 'Monster Active', 'Projectile_Arrow', 'Repeating AOESpawner', 'Snowstorm Area', 'Soul Snatch Effect', 'Turret Skill Data', 'Void Melee Turret'] }
]);

export const ACHIEVEMENTS: readonly AchievementEntry[] = Object.freeze(
  SITE_CONTENT.achievements.map((entry, index) => ({
    ...entry,
    icon: `/game/content/achievements/achievement-${String(index + 1).padStart(2, '0')}.jpg`
  }))
);
export const NEWS: readonly NewsEntry[] = SITE_CONTENT.news;

export const DATABASE_GROUPS: readonly DatabaseGroup[] = Object.freeze([
  {
    title: 'Heroes & Combat',
    datasets: [
      { label: 'Heroes', count: 6, href: '/heroes' },
      { label: 'Monsters', count: 61, href: '/monsters' },
      { label: 'Skills', count: 106, href: '/skills' },
      { label: 'Passive Skills', count: 108, href: '/skills' },
      { label: 'Attributes', count: 132, href: '/database#attributes' },
      { label: 'Attribute Groups', count: 8, href: '/database#attribute-groups' },
      { label: 'Buffs', count: 29, href: '/buffs' },
      { label: 'Buff Groups', count: 16, href: '/database#buff-groups' },
      { label: 'Status Effects', count: 6, href: '/status-effects' }
    ]
  },
  {
    title: 'Items & Gear',
    datasets: [
      { label: 'Items', count: 384, href: '/database#items' },
      { label: 'Gear', count: 200, href: '/gear' },
      { label: 'Gear Types', count: 16, href: '/database#gear-types' },
      { label: 'Materials', count: 125, href: '/materials' },
      { label: 'Grades', count: 10, href: '/grades' },
      { label: 'Unique Mods', count: 36, href: '/database#unique-mods' },
      { label: 'Stat Mods', count: 620, href: '/database#stat-mods' },
      { label: 'Stat Mod Groups', count: 474, href: '/database#stat-mod-groups' },
      { label: 'Item Groups', count: 2_275, href: '/database#item-groups' },
      { label: 'Item Level Scaling', count: 19, href: '/database#item-level-scaling' },
      { label: 'Item Type Scaling', count: 2, href: '/database#item-type-scaling' },
      { label: 'Gear Type Scaling', count: 20, href: '/database#gear-type-scaling' }
    ]
  },
  {
    title: 'Progression',
    datasets: [
      { label: 'Runes', count: 197, href: '/runes' },
      { label: 'Rune Levels', count: 663, href: '/database#rune-levels' },
      { label: 'Skill Levels', count: 360, href: '/database#skill-levels' },
      { label: 'Stages', count: 120, href: '/stages' },
      { label: 'Stage Scaling', count: 170, href: '/database#stage-scaling' },
      { label: 'Levels', count: 100, href: '/database#levels' },
      { label: 'Offline Rewards', count: 116, href: '/database#offline-rewards' }
    ]
  },
  {
    title: 'Crafting & Economy',
    datasets: [
      { label: 'Synthesis Recipes', count: 533, href: '/database#synthesis-recipes' },
      { label: 'Synthesis Drops', count: 203, href: '/database#synthesis-drops' },
      { label: 'Crafting Recipes', count: 56, href: '/crafting' },
      { label: 'Cube Recipes', count: 8, href: '/cube' },
      { label: 'Cube Sub-Recipes', count: 31, href: '/database#cube-sub-recipes' },
      { label: 'Cube Levels', count: 100, href: '/tools/cube-leveling' },
      { label: 'Extraction Costs', count: 90, href: '/extraction' },
      { label: 'Currencies', count: 1, href: '/database#currencies' }
    ]
  },
  {
    title: 'Collection & Storage',
    datasets: [
      { label: 'Pets', count: 8, href: '/pets' },
      { label: 'Pet Stats', count: 11, href: '/database#pet-stats' },
      { label: 'Skins', count: 100, href: '/database#skins' },
      { label: 'Inventory', count: 260, href: '/database#inventory' },
      { label: 'Storage', count: 101, href: '/database#storage' },
      { label: 'Stash', count: 131, href: '/database#stash' },
      { label: 'Trading Stash', count: 10, href: '/database#trading-stash' }
    ]
  },
  {
    title: 'Misc',
    datasets: [
      { label: 'Sounds', count: 312, href: '/database#sounds' },
      { label: 'Drops', count: 6_303, href: '/database#drops' }
    ]
  }
]);
