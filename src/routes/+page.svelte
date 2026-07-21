<script lang="ts">
  import { siteConfig } from '$lib/config/site';
  import {
    categoryDescriptions,
    communityCards,
    featuredHeroes,
    homeStats,
    numberTiles
  } from '$lib/home/home-data';
  import Footer from '$lib/shell/Footer.svelte';
  import './home.css';

  const categories = siteConfig.navigation
    .flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        description: categoryDescriptions[item.href]
      }))
    )
    .sort((left, right) => left.label.localeCompare(right.label, 'en', { sensitivity: 'base' }));

  const inventorySlots = [
    '/game/ui/SWORD_300001.png',
    '/game/ui/ARMOR_510001.png',
    '/game/ui/Skill_30101.png',
    '/game/ui/Skill_50101.png',
    '/game/ui/AllHeroAttackDamage.png',
    '/game/ui/AdditionalGold.png',
    '/game/ui/Item_910011.png',
    '/game/ui/Icon_BossSoulstone.png'
  ];
</script>

<svelte:head>
  <title>TBH: Task Bar Hero Wiki &amp; Database</title>
  <meta
    name="description"
    content="Task Bar Hero gear, stages, heroes, skills, runes, builds, guides and tools."
  />
</svelte:head>

<article class="home-page">
  <div class="wiki-main-content">
    <section class="home-hero">
      <div class="home-hero-copy">
        <span class="eyebrow">Community database</span>
        <h1 class="home-hero-title" aria-label="Task Bar Hero Wiki">
          Task Bar Hero<br /><span>Wiki</span>
        </h1>
        <p class="home-hero-text">
          A compact companion database for the tiny idle RPG that runs from the taskbar: heroes,
          builds, skills, loot, stages and rune data pulled straight from the game files.
        </p>
        <div class="home-hero-actions">
          <a class="game-button" href="/gear">
            <img src="/game/ui/SWORD_300001.png" alt="" />
            <span>Browse gear</span>
          </a>
          <a class="game-button secondary" href="/stages">
            <img src="/game/ui/AdditionalGoldActBoss.png" alt="" />
            <span>Open portal</span>
          </a>
        </div>
        <div class="hero-stat-strip" aria-label="Wiki coverage">
          {#each homeStats as stat}
            <div class="hero-stat"><b>{stat.value}</b><span>{stat.label}</span></div>
          {/each}
        </div>
      </div>

      <div class="home-hero-visual">
        <div class="game-window">
          <div class="game-window-title">HERO</div>
          <div class="game-window-body">
            <div class="hero-loadout">
              <div class="portrait-frame">
                <img src="/game/ui/Arrage_ChaAnim_Knight_Large_0.png" alt="Knight" />
              </div>
              <div class="mini-slots">
                {#each inventorySlots.slice(0, 3) as image}
                  <span class="wiki-slot"><img src={image} alt="" /></span>
                {/each}
              </div>
            </div>
            <div class="inventory-grid" aria-label="Hero inventory preview">
              {#each Array(10) as _, index}
                <span class="wiki-slot">
                  {#if inventorySlots[index]}<img src={inventorySlots[index]} alt="" />{/if}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="patch-banner">
      <div class="patch-titlebar"><h2>Now playing</h2></div>
      <div class="patch-body">
        <span class="patch-version">{siteConfig.patch}</span>
        <p>Wiki data current as of this patch.</p>
        <a class="game-button patch-cta" href="/news">
          <img src="/game/ui/Icon_Notice.png" alt="" />
          <span>What changed →</span>
        </a>
      </div>
    </section>

    <section class="home-section community-section">
      <div class="home-section-head">
        <span>From the community</span>
        <h2>Community wall</h2>
        <i></i>
      </div>
      <div class="community-grid">
        {#each communityCards as card}
          <a class="community-card" href={card.href}>
            <div class="community-card-top">
              <img src={card.icon} alt="" />
              <span class="community-kind">{card.kind}</span>
              <b>▲ {card.score}</b>
            </div>
            <h3>{card.title}</h3>
            <p>{card.detail}</p>
            <small>LOCAL FIXTURE</small>
          </a>
        {/each}
      </div>
    </section>

    <section class="home-section numbers-section">
      <div class="home-section-head">
        <span>Coverage</span>
        <h2>By the numbers</h2>
        <i></i>
        <a href="/database">View all</a>
      </div>
      <div class="numbers-grid">
        {#each numberTiles as tile}
          <a class="number-tile" href={tile.href}><b>{tile.value}</b><span>{tile.label}</span></a>
        {/each}
      </div>
    </section>

    <section class="home-section category-section">
      <div class="home-section-head">
        <span>Browse the wiki</span>
        <h2>Jump straight to a system</h2>
        <i></i>
      </div>
      <div class="category-grid">
        {#each categories as category}
          <a class="category-card" href={category.href}>
            <span class="category-card-icon"><img src={category.icon} alt="" /></span>
            <span class="category-card-copy">
              <strong>{category.label}</strong>
              {#if category.count !== undefined}<em>{category.count}</em>{/if}
              {#if category.badge}<em class:badge-new={category.badge === 'NEW'}>{category.badge}</em>{/if}
              <small>{category.description}</small>
            </span>
          </a>
        {/each}
      </div>
    </section>

    <section class="home-section roster-section">
      <div class="home-section-head">
        <span>The roster</span>
        <h2>Playable heroes</h2>
        <i></i>
        <a href="/heroes">View all</a>
      </div>
      <div class="hero-roster">
        {#each featuredHeroes as hero}
          <a class="hero-card" href={hero.href}>
            <img src={hero.image} alt={hero.name} />
            <strong>{hero.name}</strong>
          </a>
        {/each}
      </div>
    </section>
  </div>

  <Footer />
</article>
