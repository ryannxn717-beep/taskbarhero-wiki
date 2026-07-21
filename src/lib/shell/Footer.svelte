<script lang="ts">
  import { siteConfig } from '$lib/config/site';

  const groups = [
    { label: 'Browse', links: [['Database', '/database'], ['Heroes', '/heroes'], ['Gear', '/gear'], ['Skills', '/skills']] },
    { label: 'More', links: [['News', '/news'], ['Mechanics', '/mechanics'], ['Search', '/search'], ['Sitemap↗', '/sitemap.xml']] },
    { label: 'Community', links: [['Game on Steam↗', '/game'], ['Buy me a coffee↗', '/support']] },
    { label: 'Legal', links: [['Privacy', '/privacy']] }
  ] as const;
</script>

<footer class="wiki-footer">
  <div class="wiki-footer-intro">
    <strong>TBH <span>WIKI</span></strong>
    <p>{siteConfig.footer.disclaimer}</p>
  </div>
  <nav aria-label="Footer" class="wiki-footer-nav">
    {#each groups as group (group.label)}
      <section>
        <h2>{group.label}</h2>
        {#each group.links as link (link[0])}<a href={link[1]}>{link[0]}</a>{/each}
      </section>
    {/each}
  </nav>
  <div class="wiki-footer-bottom">
    <p>© 2026 TBH Wiki - a fan-made project.</p>
    <p>{siteConfig.footer.rights}</p>
  </div>
</footer>
