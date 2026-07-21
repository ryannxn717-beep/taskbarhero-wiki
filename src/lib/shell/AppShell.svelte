<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { createShellState } from './shell-state';
  import AnnouncementBar from './AnnouncementBar.svelte';
  import Header from './Header.svelte';
  import PageFrame from './PageFrame.svelte';
  import Sidebar from './Sidebar.svelte';

  let {
    title = 'Home',
    currentPath = '/',
    children
  }: { title?: string; currentPath?: string; children?: Snippet } = $props();

  const shell = createShellState();
  let snapshot = $state(shell.snapshot());
  let removeAdsVisible = $state(true);

  function update(action: () => void) {
    action();
    snapshot = shell.snapshot();
  }

  const openMenu = () => update(shell.openMenu);
  const closeMenu = () => update(shell.closeMenu);
  const dismissAnnouncement = () => update(shell.dismissAnnouncement);
  const wideGuide = $derived(currentPath.startsWith('/guides/') && currentPath !== '/guides');

  onMount(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  });
</script>

<div class="shell-root" class:announcement-hidden={!snapshot.announcementVisible}>
  {#if snapshot.announcementVisible}<AnnouncementBar onDismiss={dismissAnnouncement} />{/if}
  <Header onMenu={openMenu} />

  <div class="app-shell" class:wide-community={wideGuide}>
    <div class="app-gutter app-gutter-left" aria-hidden="true">
      <img src="/game/ui/Arrage_ChaAnim_Knight_Large_0.png" alt="" />
    </div>
    <div class="app-frame" class:wide-community={wideGuide}>
      <Sidebar open={snapshot.menuOpen} {currentPath} onNavigate={closeMenu} />
      {#if snapshot.menuOpen}
        <button class="mobile-backdrop" type="button" aria-label="Close" onclick={closeMenu}></button>
      {/if}
      <PageFrame {title} hideTitlebar={wideGuide}>{#if children}{@render children()}{/if}</PageFrame>
    </div>
    <div class="app-gutter app-gutter-right" aria-hidden="true">
      <img src="/game/ui/Arrage_ChaAnim_Sorcerer_Large_0.png" alt="" />
    </div>
  </div>

  {#if removeAdsVisible}
    <button class="remove-ads" type="button" onclick={() => (removeAdsVisible = false)}><span aria-hidden="true">×</span> Remove ads</button>
  {/if}
</div>
