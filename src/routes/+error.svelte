<script lang="ts">
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config/site';
  import Footer from '$lib/shell/Footer.svelte';

  const popularHrefs = new Set([
    '/gear',
    '/grades',
    '/materials',
    '/effects',
    '/stages',
    '/stage-boxes',
    '/monsters',
    '/skills'
  ]);
  const popularSections = siteConfig.navigation
    .flatMap((group) => group.items)
    .filter((item) => popularHrefs.has(item.href));
</script>

<div class="error-route">
  <section class="error-panel" aria-labelledby="error-heading">
    <span class="error-kicker">Lost in the dungeon</span>
    <h1 id="error-heading">{page.status}</h1>
    <h2>This page dropped no loot.</h2>
    <p>The page you were looking for isn't in the database - maybe it was renamed, removed, or the link was mistyped.</p>
    <nav aria-label="Error recovery">
      <a class="error-home" href="/">← Back home</a>
      <a href="/search">Search the wiki</a>
    </nav>
  </section>

  <span class="error-popular-kicker">Or try one of these</span>
  <h2 class="error-popular-title">Popular sections</h2>
  <div class="error-popular-grid" role="list" aria-label="Popular sections">
    {#each popularSections as item (item.href)}
      <div role="listitem" data-testid="popular-section-card">
        <a href={item.href}>
          <span class="error-popular-icon"><img src={item.icon} alt="" /></span>
          <span class="error-popular-copy">
            <strong>{item.label}</strong>
            {#if item.count !== undefined}<small>{item.count}</small>{/if}
          </span>
        </a>
      </div>
    {/each}
  </div>
</div>

<Footer />
