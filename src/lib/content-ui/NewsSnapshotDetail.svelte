<script lang="ts">
  import type { NewsDetailRouteModel } from '$lib/content/routes';

  let { model }: { model: NewsDetailRouteModel } = $props();
</script>

<article class="news-detail database-frame">
  <a class="detail-back" href="/news"><span aria-hidden="true">←</span> Back to news</a>
  <header>
    <div class="news-meta"><span>{model.article.category}</span><time>{model.article.date}</time><small>| {model.article.author}</small></div>
    <h1>{model.article.title}</h1>
    <p>{model.article.summary}</p>
  </header>
  <section aria-labelledby="news-snapshot-heading">
    <h2 id="news-snapshot-heading">Frozen index snapshot</h2>
    <p>This local copy preserves the public article metadata and index excerpt so the route, layout, and navigation remain functional without requesting Steam or the source Wiki at runtime.</p>
  </section>
  <nav aria-label="News recovery"><a class="wiki-button" href="/news">All news</a><a class="wiki-button" href="/database">Database</a></nav>
</article>
