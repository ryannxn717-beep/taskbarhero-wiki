<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import '$lib/theme/global.css';
  import '$lib/shell/shell.css';
  import '$lib/content-ui/content.css';
  import AppShell from '$lib/shell/AppShell.svelte';

  let { children }: { children: Snippet } = $props();

  const shellTitle = $derived(
    page.status === 404
      ? decodeURIComponent(page.url.pathname)
          .replace(/^\/+|\/+$/g, '')
          .replace(/-/g, ' ') || 'Page not found'
      : (page.data.title ?? 'Home')
  );
</script>

<svelte:head>
  <title>TBH: Task Bar Hero Wiki &amp; Database</title>
  <meta
    name="description"
    content="Task Bar Hero community wiki, game database, builds, guides and tools."
  />
</svelte:head>

<AppShell title={shellTitle} currentPath={page.url.pathname}>
  {@render children()}
</AppShell>
