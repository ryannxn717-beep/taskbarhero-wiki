<script lang="ts">
  import { siteConfig } from '$lib/config/site';

  let {
    open = false,
    currentPath = '/',
    onNavigate
  }: { open?: boolean; currentPath?: string; onNavigate: () => void } = $props();
</script>

<aside class="wiki-sidebar" class:is-open={open} data-open={String(open)}>
  <div class="wiki-sidebar-head">
    <img src="/game/ui/Icon_Setting.png" alt="" />
    <div><strong>Menu</strong><span>Task Bar Hero</span></div>
  </div>

  <nav aria-label="Wiki sections" data-open={String(open)}>
    {#each siteConfig.navigation as group}
      <div class="nav-group">
        <div class="nav-group-title">{group.label}</div>
        {#each group.items as item}
          <a
            class="nav-link"
            class:is-active={currentPath === item.href}
            href={item.href}
            aria-current={currentPath === item.href ? 'page' : undefined}
            onclick={onNavigate}
          >
            <span class="nav-link-icon"><img src={item.icon} alt="" loading="lazy" /></span>
            <span class="nav-link-label">{item.label}</span>
            <span class="nav-link-meta">
              {#if item.count !== undefined}<span class="nav-link-count">{item.count}</span>{/if}
              {#if item.badge === 'NEW'}<span class="nav-link-new">NEW</span>{/if}
              {#if item.badge === 'BETA'}<span class="nav-link-beta">BETA</span>{/if}
            </span>
          </a>
        {/each}
      </div>
    {/each}
  </nav>
</aside>
