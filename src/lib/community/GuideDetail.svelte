<script lang="ts">
  import { onMount } from 'svelte';
  import {
    createEmptyCommunityState,
    readCommunityState,
    toggleVote,
    writeCommunityState,
    type CommunityState,
    type VoteDirection
  } from './state';

  const guideVoteKey = 'guide:ranger-archer-solo-build-guide';
  let communityState = $state<CommunityState>(createEmptyCommunityState());
  const vote = $derived(communityState.votes[guideVoteKey] ?? 0);

  onMount(() => {
    communityState = readCommunityState(localStorage);
  });

  function voteGuide(direction: VoteDirection) {
    communityState = toggleVote(communityState, guideVoteKey, direction);
    writeCommunityState(localStorage, communityState);
  }
</script>

<article class="community-page guide-detail-page">
  <a class="community-back" href="/guides">← All guides</a>

  <header class="guide-title-frame">
    <span>RANGER BUILD GUIDE</span>
    <h1>Ranger(Archer) SOLO build guide</h1>
    <p>By <strong>PhMestre</strong> · Updated Jul 2, 2026 · v1.00.17</p>
  </header>

  <figure class="guide-cover">
    <img src="/game/community/guide-ranger-solo.png" alt="Ranger solo build guide reference" />
  </figure>

  <div class="guide-article-layout">
    <div class="guide-prose">
      <p class="guide-lede"><strong>[Wiki] Guide: Solo Explorer Archer Build (Late Game 80+)</strong></p>
      <p>This English guide focuses on optimizing the Explorer Archer for end-game content. The target is a fast, repeatable clear that reaches the instant-kill threshold on regular monsters while remaining comfortable against bosses.</p>

      <section id="attributes">
        <h2>1. Target attributes (Stats)</h2>
        <p>For a late-game character around level 80, build the offensive floor first and only add quality-of-life stats once clear speed is stable.</p>
        <ul>
          <li><strong>Attack Speed:</strong> smooths the main attack loop and reduces time lost between targets.</li>
          <li><strong>Physical and Projectile Damage:</strong> multiply both the retained active skill and basic attacks.</li>
          <li><strong>Critical Chance / Damage:</strong> becomes valuable after the base physical package is reliable.</li>
          <li><strong>Movement Speed:</strong> shortens travel time and improves farming efficiency.</li>
        </ul>
        <table class="guide-priority-table" aria-label="Attribute priorities">
          <thead><tr><th>Priority</th><th>Attribute</th><th>Target / reason</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>Attack Speed</td><td>Reach a smooth, uninterrupted firing rhythm</td></tr>
            <tr><td>2</td><td>Physical Damage %</td><td>Primary multiplier for skills and auto-attacks</td></tr>
            <tr><td>3</td><td>Projectile Damage</td><td>Scales the Ranger's core damage family</td></tr>
            <tr><td>4</td><td>Critical Chance</td><td>Add once consistent base damage is secured</td></tr>
            <tr><td>5</td><td>Movement Speed</td><td>Reduce downtime between monster groups</td></tr>
          </tbody>
        </table>
        <div class="article-callout"><strong>Benchmark</strong><span>If normal monsters survive a full volley, keep offensive rolls. If they already die instantly, movement speed gives the larger farming gain.</span></div>
      </section>

      <section id="equipment">
        <h2>2. Equipment (Gears)</h2>
        <p>Use the strongest bow and off-hand combination available. Keep the loadout coherent: each item should improve the same physical-projectile damage loop instead of opening a second damage family.</p>
        <h3 id="weapons">Weapons &amp; off-hands</h3>
        <p>Prioritize base weapon damage, Physical Damage %, Projectile Damage and Attack Speed. A lower-grade bow with the correct multipliers can outperform a higher-grade drop with unrelated bonuses.</p>
        <h3 id="armor">Armor parts</h3>
        <p>Chest, helmet, gloves and boots should supply enough maximum HP for the stage, then convert remaining rolls into percentage damage. Gloves are the best place to solve an Attack Speed shortfall.</p>
        <h3 id="jewelry">Jewelry (Accessories)</h3>
        <p>Rings, earrings, amulets and bracelets are flexible damage slots. Use Movement Speed only after the build reaches its clear-speed threshold.</p>
        <table class="guide-priority-table" aria-label="Equipment priorities">
          <thead><tr><th>Equipment</th><th>Main rolls</th><th>Fallback</th></tr></thead>
          <tbody>
            <tr><td>Bow / Arrow</td><td>Physical %, Projectile %, Attack Speed</td><td>Critical Damage</td></tr>
            <tr><td>Armor parts</td><td>Max HP, Physical %, Attack Speed</td><td>Flat HP</td></tr>
            <tr><td>Jewelry</td><td>Movement Speed, Critical Chance</td><td>Attack Damage</td></tr>
          </tbody>
        </table>
        <div class="article-callout"><strong>Practical rule</strong><span>Replace one item at a time and compare the same stage. A larger sheet number is not useful if the farming run becomes slower.</span></div>
      </section>

      <section id="customization">
        <h2>3. Item customization</h2>
        <p>Inscription, decoration and engraving slots should reinforce the chosen damage package. Avoid spreading limited slots over unrelated defensive and elemental bonuses.</p>
        <table class="guide-priority-table" aria-label="Item customization priorities">
          <thead><tr><th>Equipment type</th><th>Decoration / engraving</th><th>Inscription</th></tr></thead>
          <tbody>
            <tr><td>Weapons</td><td>Physical Damage %</td><td>Physical Damage / Attack Speed</td></tr>
            <tr><td>Armor</td><td>Max HP on 3–4 pieces, then HP %</td><td>Survival only when required</td></tr>
            <tr><td>Jewelry</td><td>Movement Speed or Critical Chance</td><td>Attack Damage when below threshold</td></tr>
          </tbody>
        </table>
        <p><em>Why Physical Damage %?</em> It scales both the active skill and basic auto-attacks, so every offensive action benefits from the same investment.</p>
      </section>

      <section id="skills">
        <h2>4. Skill tree</h2>
        <h3 id="core-skills">Core skills (leveling / progression)</h3>
        <ul>
          <li><strong>Rapid Fire:</strong> the primary active skill and first point priority.</li>
          <li><strong>Piercing Arrow:</strong> the standard area-clear option for crowded stages.</li>
          <li><strong>Projectile Damage Boost:</strong> the most direct passive multiplier.</li>
          <li><strong>Attack Speed:</strong> important until the animation loop feels continuous.</li>
        </ul>
        <h3 id="situational-skills">Situational skill (boss swap)</h3>
        <div class="article-callout"><strong>Gameplay tip</strong><span>Against a single-target boss, swap Piercing Arrow for the focused shot skill to concentrate every projectile on one target.</span></div>
        <h3 id="late-skills">Late-game skills</h3>
        <p>Elemental Dodge and Critical Damage are leftover-point choices. Do not delay the core physical and projectile nodes to obtain them early.</p>
        <ol>
          <li>Max the core active skill and projectile multiplier.</li>
          <li>Raise Attack Speed until the practical breakpoint.</li>
          <li>Add boss or survival tools for the stage being farmed.</li>
          <li>Spend remaining points on Critical Damage and utility.</li>
        </ol>
      </section>

      <section id="checklist">
        <h2>5. Late-game checklist</h2>
        <ul>
          <li>Normal monsters die in one volley.</li>
          <li>The boss swap is saved as a repeatable loadout.</li>
          <li>No equipment slot carries an unrelated damage family.</li>
          <li>Movement Speed is added only after the damage threshold is met.</li>
        </ul>
      </section>
    </div>

    <aside class="guide-aside">
      <section class="author-card"><span class="profile-avatar">P</span><div><small>Author</small><strong>PhMestre</strong><p>Published Jul 2, 2026</p></div></section>
      <nav aria-label="Guide contents">
        <strong>CONTENTS</strong>
        <a href="#attributes">1. Target attributes</a>
        <a href="#equipment">2. Equipment</a>
        <a class="nested" href="#weapons">Weapons &amp; off-hands</a>
        <a class="nested" href="#armor">Armor parts</a>
        <a class="nested" href="#jewelry">Jewelry</a>
        <a href="#customization">3. Item customization</a>
        <a href="#skills">4. Skill tree</a>
        <a class="nested" href="#core-skills">Core skills</a>
        <a class="nested" href="#situational-skills">Boss swap</a>
        <a class="nested" href="#late-skills">Late-game skills</a>
        <a href="#checklist">5. Checklist</a>
      </nav>
    </aside>
  </div>

  <section class="more-guides">
    <h2>More guides</h2>
    <div class="more-guide-links"><a href="/guides">Attack Speed <span>DarkfizzTV →</span></a><a href="/guides">F2P guide for early game <span>Marcos Valadão →</span></a></div>
  </section>

  <section class="discussion-boundary guide-discussion">
    <h2>Discussion</h2>
    <div class="discussion-vote-row">
      <strong>Was this guide helpful?</strong>
      <div>
        <button type="button" aria-label="Upvote guide" aria-pressed={vote === 1} class:active={vote === 1} onclick={() => voteGuide(1)}>▲</button>
        <span>{-5 + vote}</span>
        <button type="button" aria-label="Downvote guide" aria-pressed={vote === -1} class:active={vote === -1} onclick={() => voteGuide(-1)}>▼</button>
      </div>
    </div>
    <p><strong>Local discussion preview.</strong> Votes stay in this browser; accounts and public moderation are not connected.</p>
    <div class="guide-comment"><span class="profile-avatar">A</span><div><b>ArcherMain</b><small> retained English example</small><p>The equipment table makes the replacement order much easier to follow.</p></div></div>
  </section>
</article>
