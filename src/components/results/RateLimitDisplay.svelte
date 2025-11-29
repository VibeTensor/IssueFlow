<!--
  RateLimitDisplay Component
  Issue #35 - Extracted from ResultsList.svelte

  Displays GitHub API rate limit information with countdown timer.
  Shows warning styling when remaining requests are low.
-->

<script lang="ts">
  interface Props {
    remaining: number;
    resetAt: string;
    isAuthenticated: boolean;
  }

  let { remaining, resetAt, isAuthenticated }: Props = $props();

  /**
   * Calculate time until rate limit resets
   */
  function getResetTime(resetAt: string): string {
    if (!resetAt) return '';
    const resetDate = new Date(resetAt);
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} minutes` : 'soon';
  }

  // Derived state
  let isLowRemaining = $derived(remaining < 10);
  let showDisplay = $derived(remaining !== undefined && remaining > 0);
</script>

{#if showDisplay}
  <div class="text-center text-xs md:text-sm mb-6 px-4">
    <div class="inline-flex items-center gap-2 sketch-badge px-3 md:px-4 py-2 rounded-full bg-slate-800/80 max-w-full">
      <!-- Lightning bolt icon -->
      <svg class="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span class={`${isLowRemaining ? 'text-amber-400 font-semibold' : 'text-slate-300'} break-words`}>
        {remaining} requests remaining
        {#if resetAt}
          <span class="whitespace-nowrap">(resets in {getResetTime(resetAt)})</span>
        {/if}
      </span>
    </div>
  </div>
{/if}
