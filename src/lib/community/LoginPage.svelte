<script lang="ts">
  import { onMount } from 'svelte';
  import {
    createEmptyCommunityState,
    readCommunityState,
    signInLocal,
    signOutLocal,
    writeCommunityState,
    type CommunityState,
    type LocalProvider
  } from './state';

  let state = $state<CommunityState>(createEmptyCommunityState());

  onMount(() => {
    state = readCommunityState(localStorage);
  });

  function signIn(provider: LocalProvider) {
    state = signInLocal(state, provider);
    writeCommunityState(localStorage, state);
  }

  function signOut() {
    state = signOutLocal(state);
    writeCommunityState(localStorage, state);
  }
</script>

<section class="community-page login-page">
  <div class="login-emblem" aria-hidden="true">
    <img src="/game/ui/BG_hero_dragonHead.png" alt="" />
  </div>
  <div class="community-panel login-panel">
    <div class="community-panel-title">PLAYER ACCOUNT</div>
    <div class="login-panel-body">
      <span class="community-kicker">TASK BAR HERO WIKI</span>
      <h1>Sign in</h1>
      {#if state.profile}
        <div class="profile-badge">
          <span class="profile-avatar">{state.profile.displayName.slice(0, 1)}</span>
          <div><small>Signed in locally as</small><strong>{state.profile.displayName}</strong></div>
        </div>
        <button class="community-button danger" type="button" onclick={signOut}>Sign out</button>
      {:else}
        <p class="login-intro">Continue with an account provider to keep community drafts on this device.</p>
        <button class="provider-button google" type="button" onclick={() => signIn('google')}>
          <span aria-hidden="true">G</span> Continue with Google
        </button>
        <button class="provider-button discord" type="button" onclick={() => signIn('discord')}>
          <span aria-hidden="true">◉</span> Continue with Discord
        </button>
      {/if}
      <p class="local-disclosure"><strong>Browser-local demo</strong> — no OAuth request is made and no account data leaves this browser.</p>
    </div>
  </div>
</section>
