<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, hideTitlebar = false, children }: { title: string; hideTitlebar?: boolean; children?: Snippet } = $props();
</script>

<main class="wiki-main">
  <div class="wiki-main-frame">
    {#if !hideTitlebar}
      <div class="wiki-main-titlebar">
        <span class="wiki-title-ornament" aria-hidden="true"></span>
        <p class="wiki-title-text">{title}</p>
      </div>
    {/if}
    <div class="wiki-page-scroll">
      {#if children}{@render children()}{/if}
    </div>
  </div>
</main>
