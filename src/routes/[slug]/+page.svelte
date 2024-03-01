<script lang="ts">
  import type { QueryData } from "./+page";

  export let data: QueryData;
  let hopIdx = 0;
  $: hop = data.hops[hopIdx];
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<h1>Baleen Visualizer</h1>
<p>Query: {data.query}</p>

<span>Hop</span>
{#each [0, 1, 2, 3] as i}
  <button
    class={hopIdx == i ? `step-selected` : ""}
    on:click={() => (hopIdx = i)}
  >
    {i}
  </button>
{/each}

<h2>Query + Context</h2>
<div class="explanation">
  At the start of each hop, the query and context are tokenized and
  contextualized with a BERT-based model. Queries are padded to a length of 64
  with [MASK] tokens.
</div>

<div class="token-list">
  {#each hop.c_toks as tok, i}
    <div class="token {i < 64 ? 'token-q' : 'token-c'}">{tok}</div>
  {/each}
</div>

<h2>Retrieval</h2>
<div class="explanation">
  Each document is scored using the contextualized query. Unlike ColBERT, not
  every token in the query/context is used. Instead, Baleen uses <i>focused</i> late
  interaction, where only the top N most relevant query/context tokens are used for
  MaxSim. The score for the query and the score for the context are computed independently,
  and use a different number of tokens (32 for the query, 8 for the context).
</div>

{#each hop.ranking as ranking, j}
  <p><b>{ranking[0].toFixed(2)}: {ranking[1]}</b></p>
  <div>
    <span>Query Token Matches (32)</span>
    <div class="token-list">
      {#each hop.q_matches[j] as tok_idx}
        <div class="token token-q">{hop.c_toks[tok_idx]}</div>
      {/each}
    </div>
    {#if hop.c_matches[j].length > 0}
      <span>Context Token Matches (8)</span>
      <div class="token-list">
        {#each hop.c_matches[j] as tok_idx}
          <div class="token token-c">{hop.c_toks[64 + tok_idx]}</div>
        {/each}
      </div>
    {/if}
  </div>
{/each}

<h2>Condenser (Stage 1)</h2>
<div class="explanation">
  The first stage reads all passages independently, then assigns a score to each
  sentence within the passage. The top 9 sentences across all passages ove on to
  the next stage.
</div>

{#each hop.stage1 as result}
  <p>
    <b>{result[0].toFixed(2)}: {result[1].split("|")[0]}</b>
    {result[1].split("|")[1]}
  </p>
{/each}

<h2>Condenser (Stage 2)</h2>
<div class="explanation">
  The second stage reads all sentences from the previous stage at once, then
  rescores all sentences. All positive passages move on.
</div>

{#each hop.stage2 as result}
  <p class={result[0] < 0.0 ? "condenser-excluded" : ""}>
    <b>{result[0].toFixed(2)}: {result[1].split("|")[0]}</b>
    {result[1].split("|")[1]}
  </p>
{/each}

<h2>New Context</h2>
<div class="explanation">
  The context for the next hop consists of the facts produced by the previous stage. If this is the final hop, the query
  and context are passed to the reader for answering.
</div>

{#each hop.new_ctx.split("[SEP]") as fact}
  <p><b>{fact.split("|")[0]}</b> {fact.split("|")[1]}</p>
{/each}

<style>
  :global(body) {
    font-family: "Montserrat";
  }

  .token {
    background-color: black;
    color: white;
    margin: 0.24rem;
    padding: 0.24rem;
    font-weight: bold;
  }

  .token-q {
    background-color: darkgreen;
  }

  .token-c {
    background-color: #fa9231;
  }

  .token-list {
    display: flex;
    flex-wrap: wrap;
  }

  .step-selected {
    background-color: black;
    color: white;
  }

  .condenser-excluded {
    color: #888888;
  }

  .explanation {
    padding: 1rem;
    border: solid 1px black;
    background-color: #f0f0f0;
    margin: 1rem;
  }
</style>
