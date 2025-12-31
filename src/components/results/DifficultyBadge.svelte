<!--
  DifficultyBadge Component
  Issue #145 - Visual Issue Difficulty Badges

  Displays a color-coded difficulty badge based on:
  - Labels (40%): Presence of difficulty-indicating labels
  - Comments (30%): Lower comment count = easier
  - Body Length (30%): Shorter body = simpler scope

  Colors:
  - Easy: Green (bg-green-500/15, text-green-400)
  - Medium: Amber (bg-amber-500/15, text-amber-400)
  - Hard: Red (bg-red-500/15, text-red-400)
-->

<script lang="ts">
  import type { GitHubIssue } from '../../lib/github-graphql';
  import { calculateDifficulty, getDifficultyDisplay } from '../../lib/difficulty-utils';

  interface Props {
    /** GitHub issue to calculate difficulty for */
    issue: GitHubIssue;
    /** Whether to show tooltip with explanation (default: true) */
    showTooltip?: boolean;
    /** Size variant: 'sm' for mobile, 'md' for desktop */
    size?: 'sm' | 'md';
  }

  let { issue, showTooltip = true, size = 'md' }: Props = $props();

  // Calculate difficulty using $derived for reactivity
  let difficultyResult = $derived(calculateDifficulty(issue));
  let display = $derived(getDifficultyDisplay(difficultyResult.level));

  // Size-specific classes
  let sizeClasses = $derived(
    size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[10px] px-1.5 py-0.5'
  );
</script>

<span
  class="{sizeClasses} rounded font-medium {display.bgClass} {display.textClass}"
  role="status"
  aria-label="Difficulty: {display.label}"
  title={showTooltip ? difficultyResult.explanation : undefined}
>
  {display.label}
</span>
