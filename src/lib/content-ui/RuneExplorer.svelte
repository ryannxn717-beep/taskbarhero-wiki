<script lang="ts">
  import type { RuneRecord } from '$lib/content/schema';
  import { projectRuneTreeNode, runeTreeViewport, type RuneTreeFeature } from '$lib/content/rune-tree';

  let {
    runes,
    tree,
    hrefFor
  }: {
    runes: readonly RuneRecord[];
    tree: RuneTreeFeature;
    hrefFor: (rune: RuneRecord) => string;
  } = $props();

  let mode = $state<'tree' | 'list'>('tree');
  let query = $state('');
  let zoom = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let centeredKey = $state<number | null>(null);
  let dragStart: { x: number; y: number; panX: number; panY: number } | null = null;
  let svgElement: SVGSVGElement | undefined = $state();

  const viewport = $derived(runeTreeViewport(tree.bounds));
  const recordsByKey = $derived(new Map(runes.map((rune) => [Number(rune.id), rune])));
  const nodesByKey = $derived(new Map(tree.nodes.map((node) => [node.key, node])));
  const normalizedQuery = $derived(query.trim().toLowerCase());
  const matched = $derived(
    runes.filter((rune) => {
      const node = nodesByKey.get(Number(rune.id));
      return !normalizedQuery || `${rune.id} ${rune.name} ${node?.stat ?? ''}`.toLowerCase().includes(normalizedQuery);
    })
  );
  const viewBox = $derived.by(() => {
    const width = viewport.width / zoom;
    const height = viewport.height / zoom;
    return `${viewport.centerX + panX - width / 2} ${viewport.centerY + panY - height / 2} ${width} ${height}`;
  });

  function centerKey(key: number) {
    const node = nodesByKey.get(key);
    if (!node) return;
    const point = projectRuneTreeNode(node, tree.bounds);
    zoom = Math.max(zoom, 2);
    panX = point.x - viewport.centerX;
    panY = point.y - viewport.centerY;
    centeredKey = key;
  }

  function centerRune() {
    const rune = matched[0];
    if (rune) centerKey(Number(rune.id));
  }

  function reset() {
    zoom = 1;
    panX = 0;
    panY = 0;
    centeredKey = null;
  }

  function setZoom(next: number) {
    zoom = Math.min(3, Math.max(0.7, Number(next.toFixed(2))));
  }

  function onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      centerRune();
    }
  }

  function startPan(event: PointerEvent) {
    if ((event.target as Element).closest('a')) return;
    dragStart = { x: event.clientX, y: event.clientY, panX, panY };
    svgElement?.setPointerCapture(event.pointerId);
  }

  function movePan(event: PointerEvent) {
    if (!dragStart || !svgElement) return;
    const width = Math.max(1, svgElement.clientWidth);
    const height = Math.max(1, svgElement.clientHeight);
    panX = dragStart.panX - ((event.clientX - dragStart.x) * viewport.width) / (width * zoom);
    panY = dragStart.panY - ((event.clientY - dragStart.y) * viewport.height) / (height * zoom);
  }

  function stopPan(event: PointerEvent) {
    dragStart = null;
    if (svgElement?.hasPointerCapture(event.pointerId)) svgElement.releasePointerCapture(event.pointerId);
  }

  function wheelZoom(event: WheelEvent) {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
  }
</script>

<section class="rune-index" aria-label="Rune Tree">
  <header class="rune-index-header">
    <div>
      <h1>Rune Tree</h1>
      <p>{tree.nodes.length} rune nodes | {tree.edges.length} connections - reconstructed from the game.</p>
    </div>
    <div class="rune-view-switch" aria-label="Rune view">
      <button type="button" class:active={mode === 'tree'} aria-pressed={mode === 'tree'} onclick={() => (mode = 'tree')}><span aria-hidden="true">⊹</span> Tree</button>
      <button type="button" class:active={mode === 'list'} aria-pressed={mode === 'list'} onclick={() => (mode = 'list')}><span aria-hidden="true">☰</span> List</button>
    </div>
  </header>

  {#if mode === 'tree'}
    <div class="rune-tree-shell">
      <div class="rune-map-toolbar">
        <div class="rune-map-search" role="search">
          <input type="search" aria-label="Search and center a rune" bind:value={query} onkeydown={onSearchKeydown} placeholder="Search rune, stat or id..." />
          {#if normalizedQuery}
            <div class="rune-search-results">
              {#each matched.slice(0, 8) as rune (`rune-result:${rune.id}`)}
                <button type="button" onclick={() => centerKey(Number(rune.id))}>
                  {#if rune.image}<img src={rune.image} alt="" />{/if}<span>{rune.name}</span><b>{rune.id}</b>
                </button>
              {:else}
                <p>No runes found</p>
              {/each}
            </div>
          {/if}
        </div>
        <div class="rune-map-controls">
          <button type="button" aria-label="Zoom in" onclick={() => setZoom(zoom + 0.2)}>+</button>
          <button type="button" aria-label="Zoom out" onclick={() => setZoom(zoom - 0.2)}>−</button>
          <button class="rune-reset" type="button" aria-label="Reset rune view" onclick={reset}>Reset</button>
          <button class="sr-only" type="button" onclick={centerRune}>Center rune</button>
        </div>
      </div>
      {#if centeredKey !== null}<p class="sr-only" role="status">Centered on {recordsByKey.get(centeredKey)?.name}</p>{/if}
      <p class="rune-map-help">Drag to pan | Scroll to zoom | Hover a node</p>
      <svg
        bind:this={svgElement}
        class="rune-map"
        role="application"
        aria-label="Rune tree"
        data-zoom={zoom}
        {viewBox}
        onpointerdown={startPan}
        onpointermove={movePan}
        onpointerup={stopPan}
        onpointercancel={stopPan}
        onwheel={wheelZoom}
      >
        {#each tree.edges as edge (`edge:${edge.from}:${edge.to}`)}
          {@const from = nodesByKey.get(edge.from)}
          {@const to = nodesByKey.get(edge.to)}
          {#if from && to}
            {@const fromPoint = projectRuneTreeNode(from, tree.bounds)}
            {@const toPoint = projectRuneTreeNode(to, tree.bounds)}
            <line class="rune-edge" x1={fromPoint.x} y1={fromPoint.y} x2={toPoint.x} y2={toPoint.y}></line>
          {/if}
        {/each}
        {#each tree.nodes as node (`node:${node.key}`)}
          {@const rune = recordsByKey.get(node.key)}
          {@const point = projectRuneTreeNode(node, tree.bounds)}
          {#if rune}
            <a href={hrefFor(rune)} aria-label={rune.name}>
              <g class="rune-map-node" class:is-centered={centeredKey === node.key} class:is-match={normalizedQuery && matched.includes(rune)} transform={`translate(${point.x},${point.y})`}>
                <rect class="rune-node-frame" x="-32" y="-32" width="64" height="64"></rect>
                <image href={node.icon} x="-24" y="-22" width="48" height="48"></image>
                {#if node.maxLevel > 1}
                  <rect class="rune-node-badge" x="14" y="14" width="20" height="17"></rect>
                  <text x="24" y="27" text-anchor="middle">{node.maxLevel}</text>
                {/if}
                <title>{node.name} · Max Lv {node.maxLevel}</title>
              </g>
            </a>
          {/if}
        {/each}
      </svg>
    </div>
  {:else}
    <div class="rune-list-wrap">
      <label class="rune-list-search"><span class="sr-only">Search runes</span><input type="search" aria-label="Search runes" bind:value={query} placeholder="Search rune, stat or id..." /></label>
      <ul class="rune-list" aria-label="Rune list">
        {#each matched as rune (`rune-list:${rune.id}`)}
          <li><a href={hrefFor(rune)}>{#if rune.image}<img src={rune.image} alt="" />{/if}<span>{rune.name}</span><small>Max {rune.maxLevel}</small></a></li>
        {/each}
      </ul>
    </div>
  {/if}
</section>
