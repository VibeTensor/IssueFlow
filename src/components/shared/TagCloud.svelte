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
          background-color: #{label.color}40;
          color: #{label.color};
          border: 1px solid #{label.color}60;
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
    gap: 0.35rem;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
  }

  .tag-button {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    font-weight: 500;
    font-size: 0.7rem;
    line-height: 1.4;
    transition:
      transform 0.15s ease-out,
      opacity 0.15s ease-out;
  }

  .tag-button:hover {
    transform: scale(1.05);
    opacity: 0.85;
  }

  .tag-button:focus-visible {
    outline: 2px solid var(--color-focus, #0969da);
    outline-offset: 1px;
  }

  .tag-button:active {
    transform: scale(0.98);
  }

  .tag-count {
    font-size: 0.9em;
    opacity: 0.8;
  }

  /* Mobile: same compact size */
  @media (max-width: 640px) {
    .tag-cloud {
      gap: 0.3rem;
      padding: 0.4rem;
    }

    .tag-button {
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
    }
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
