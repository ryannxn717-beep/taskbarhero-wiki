<script lang="ts">
  import { onMount } from 'svelte';
  import {
    DEMO_SAVE_TEXT,
    MAX_SAVE_BYTES,
    SaveValidationError,
    parseSaveText,
    type LocalSave
  } from '$lib/local/save';
  import {
    clearStoredSave,
    readStoredSave,
    writeStoredSave,
    type StoredSaveResult
  } from '$lib/local/storage';
  import './save-inspector.css';

  let inputText = $state('');
  let candidate = $state<LocalSave | null>(null);
  let stored = $state<StoredSaveResult>({ status: 'empty' });
  let errorMessage = $state('');
  let statusMessage = $state('');
  let replacePending = $state(false);
  let fileInput = $state<HTMLInputElement>();

  const formatNumber = (value: number) => value.toLocaleString('en-US');

  onMount(() => {
    stored = readStoredSave(window.localStorage);
  });

  function resetFeedback() {
    errorMessage = '';
    statusMessage = '';
    replacePending = false;
  }

  function loadDemo() {
    inputText = DEMO_SAVE_TEXT;
    candidate = null;
    resetFeedback();
  }

  function inspectSave() {
    resetFeedback();
    candidate = null;
    try {
      candidate = parseSaveText(inputText);
    } catch (error) {
      errorMessage = error instanceof SaveValidationError || error instanceof Error
        ? error.message
        : String(error);
    }
  }

  function persistCandidate() {
    if (!candidate) return;
    try {
      writeStoredSave(window.localStorage, candidate);
      stored = { status: 'valid', save: candidate };
      replacePending = false;
      statusMessage = 'Save stored only in this browser.';
    } catch (error) {
      errorMessage = `Local storage failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  function useCandidate() {
    resetFeedback();
    if (!candidate) return;
    if (stored.status === 'valid' && JSON.stringify(stored.save) !== JSON.stringify(candidate)) {
      replacePending = true;
      return;
    }
    persistCandidate();
  }

  function clearLocalSave() {
    clearStoredSave(window.localStorage);
    stored = { status: 'empty' };
    candidate = null;
    statusMessage = 'Local save cleared.';
    errorMessage = '';
    replacePending = false;
  }

  async function readFile(file: File) {
    resetFeedback();
    candidate = null;
    if (file.size > MAX_SAVE_BYTES) {
      errorMessage = `root: save is ${file.size} bytes and exceeds the ${MAX_SAVE_BYTES}-byte limit`;
      return;
    }
    try {
      inputText = await file.text();
      inspectSave();
    } catch (error) {
      errorMessage = `Could not read ${file.name}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async function onFileChange(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) await readFile(file);
  }

  async function onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) await readFile(file);
  }
</script>

<article class="save-page">
  <aside class="save-construction" aria-label="Local tool notice">
    <strong>LOCAL-ONLY INSPECTOR</strong>
    <span>The source tool is under construction. This safe local copy accepts the documented demo JSON schema.</span>
  </aside>

  <header class="save-heading">
    <h1>Save Inspector</h1>
  </header>

  <section class="save-workbench" aria-labelledby="save-import-heading">
    <button
      class="save-drop-zone"
      type="button"
      onclick={() => fileInput?.click()}
      ondragover={(event) => event.preventDefault()}
      ondrop={onDrop}
    >
      <span class="save-hero-label">HERO</span>
      <span class="save-gears" aria-hidden="true">⚙⚙</span>
      <strong id="save-import-heading">Drop a local save JSON here</strong>
      <span>Files stay in your browser and are never uploaded.</span>
      <span class="save-file-button">Choose file</span>
      <small>Maximum {formatNumber(MAX_SAVE_BYTES)} bytes · JSON only</small>
    </button>
    <input bind:this={fileInput} class="sr-only" type="file" accept=".json,application/json" aria-label="Choose save file" onchange={onFileChange} />

    <details class="save-advanced">
      <summary>Advanced (paste or demo JSON)</summary>
      <label for="save-json">Save JSON</label>
      <textarea
        id="save-json"
        rows="12"
        bind:value={inputText}
        spellcheck="false"
        placeholder="Paste the documented local save JSON schema here"
      ></textarea>
      <div class="save-actions">
        <button type="button" class="wiki-button" onclick={loadDemo}>Load demo save</button>
        <button type="button" class="wiki-button primary" onclick={inspectSave}>Inspect save</button>
      </div>
    </details>
  </section>

  {#if errorMessage}<p class="save-feedback error" role="alert">{errorMessage}</p>{/if}
  {#if statusMessage}<p class="save-feedback success" role="status">{statusMessage}</p>{/if}

  {#if candidate}
    <section class="save-summary" aria-labelledby="save-summary-heading">
      <h2 id="save-summary-heading">Inspection summary</h2>
      <div class="save-summary-grid">
        <div><span>Heroes</span><strong>{candidate.heroes.length} heroes</strong></div>
        <div><span>Inventory</span><strong>{candidate.inventory.length} inventory rows</strong></div>
        <div><span>Cube</span><strong>Lv{candidate.cube.level}</strong><small>{formatNumber(candidate.cube.exp)} EXP</small></div>
        <div><span>Gold</span><strong>{formatNumber(candidate.currencies.gold)}</strong><small>{formatNumber(candidate.currencies.gems)} gems</small></div>
      </div>
      <button type="button" class="wiki-button primary save-use" onclick={useCandidate}>Use this save</button>
    </section>
  {/if}

  {#if replacePending}
    <dialog class="save-confirm" open aria-labelledby="replace-save-heading">
      <h2 id="replace-save-heading">Replace the stored save?</h2>
      <p>A different validated save already exists in this browser. Nothing is sent to a server.</p>
      <div class="save-actions">
        <button type="button" class="wiki-button" onclick={() => (replacePending = false)}>Cancel</button>
        <button type="button" class="wiki-button primary" onclick={persistCandidate}>Replace local save</button>
      </div>
    </dialog>
  {/if}

  {#if stored.status !== 'empty'}
    <section class="save-storage" aria-labelledby="local-save-heading">
      <h2 id="local-save-heading">Browser storage</h2>
      {#if stored.status === 'valid'}
      <p>One validated Version 1 save is stored locally: {stored.save.heroes.length} heroes, {stored.save.inventory.length} inventory rows.</p>
      <button type="button" class="wiki-button" onclick={clearLocalSave}>Clear local save</button>
      {:else}
      <p class="save-feedback error" role="alert">Stored data could not be read: {stored.message}</p>
      <button type="button" class="wiki-button" onclick={clearLocalSave}>Clear local save</button>
      {/if}
    </section>
  {/if}
</article>
