<!--
  TagCloud Component
  Issue #137 - Interactive Issue Tags Word Cloud

  Displays labels as a visual word cloud with frequency-based sizing.
  Clicking a tag filters issues by that label.
-->

<script lang="ts">
  import type { LabelFrequency } from '../../lib/issue-utils';

  interface Props {
    /** Array of labels with frequency counts */
    labels: LabelFrequency[];
    /** Callback when a tag is clicked */
    onTagClick?: (labelName: string) => void;
    /** Maximum number of tags to display (default: 15) */
    maxTags?: number;
  }

  let { labels, onTagClick, maxTags = 15 }: Props = $props();

  // Get displayed labels (limited by maxTags)
  let displayedLabels = $derived(labels.slice(0, maxTags));

  // Calculate min and max counts for scaling
  let minCount = $derived(
    displayedLabels.length > 0 ? Math.min(...displayedLabels.map((l) => l.count)) : 1
  );
  let maxCount = $derived(
    displayedLabels.length > 0 ? Math.max(...displayedLabels.map((l) => l.count)) : 1
  );

  /**
   * Calculate font size using logarithmic scaling
   * Provides better visual distribution for varying frequencies
   */
  function getFontSize(count: number): number {
    const minSize = 0.75; // rem
    const maxSize = 1.4; // rem

    if (minCount === maxCount) {
      return (minSize + maxSize) / 2;
    }

    // Logarithmic scaling for better distribution
    const logCount = Math.log(count);
    const logMin = Math.log(minCount);
    const logMax = Math.log(maxCount);

    const scale = (logCount - logMin) / (logMax - logMin);
    return minSize + scale * (maxSize - minSize);
  }

  /**
   * Handle tag click - calls onTagClick callback if provided
   */
  function handleClick(labelName: string): void {
    if (onTagClick) {
      onTagClick(labelName);
    }
  }

  /**
   * Get accessible label for a tag button
   */
  function getAriaLabel(label: LabelFrequency): string {
    const issueText = label.count === 1 ? 'issue' : 'issues';
    return `Filter by label: ${label.name} (${label.count} ${issueText})`;
  }
</script>

{#if displayedLabels.length > 0}
  <div class="tag-cloud" role="group" aria-label="Issue labels word cloud">
    {#each displayedLabels as label (label.name)}
      <button
        type="button"
        class="tag-button"
        style="
          font-size: {getFontSize(label.count)}rem;
          background-color: #{label.color}20;
          color: #{label.color};
          border-color: #{label.color}40;
        "
        aria-label={getAriaLabel(label)}
        onclick={() => handleClick(label.name)}
      >
        {label.name}
        <span class="tag-count">({label.count})</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    padding: 0.75rem;
    background-color: var(--color-bg-secondary, #f8f9fa);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border, #e1e4e8);
  }

  .tag-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    border: 1px solid;
    cursor: pointer;
    white-space: nowrap;
    font-weight: 500;
    line-height: 1.4;
    transition:
      transform 0.15s ease-out,
      box-shadow 0.15s ease-out;
  }

  .tag-button:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .tag-button:focus-visible {
    outline: 2px solid var(--color-focus, #0969da);
    outline-offset: 2px;
  }

  .tag-button:active {
    transform: scale(0.98);
  }

  .tag-count {
    font-size: 0.8em;
    opacity: 0.7;
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .tag-button {
      transition: none;
    }

    .tag-button:hover {
      transform: none;
    }
  }
</style>
