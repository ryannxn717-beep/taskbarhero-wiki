<script lang="ts">
  import { siteConfig } from '$lib/config/site';

  let { onDismiss }: { onDismiss: () => void } = $props();
</script>

<div class="announce" role="status">
  <img class="announce-icon" src="/game/ui/Icon_Gold.png" alt="" />
  <p class="announce-text">
    <strong>{siteConfig.announcement.label}</strong>
    <span>: {siteConfig.announcement.message} — </span>
    {#each siteConfig.announcement.links as link, index}
      {#if index > 0}<span aria-hidden="true">&nbsp;·&nbsp;</span>{/if}<a href={link.href}>{link.label}</a>
    {/each}
  </p>
  <button class="announce-close" type="button" aria-label="Dismiss" onclick={onDismiss}>×</button>
</div>
