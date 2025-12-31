/**
 * Difficulty Utilities for Issue #145
 * Visual Issue Difficulty Badges
 *
 * Calculates difficulty level based on:
 * - Labels (40%): Presence of difficulty-indicating labels
 * - Comments (30%): Lower comment count = easier
 * - Body Length (30%): Shorter body = simpler scope
 */

import type { GitHubIssue } from './github-graphql';

/**
 * Difficulty levels for issues
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Result of difficulty calculation
 */
export interface DifficultyResult {
  /** Calculated difficulty level */
  level: DifficultyLevel;
  /** Numeric score (0-100, lower = easier) */
  score: number;
  /** Human-readable explanation */
  explanation: string;
}

// Label patterns indicating difficulty (case-insensitive)
const EASY_LABELS = [
  'good first issue',
  'good-first-issue',
  'beginner',
  'beginner-friendly',
  'easy',
  'starter',
  'first-timers-only',
  'documentation',
  'docs',
  'typo'
];

const HARD_LABELS = [
  'complex',
  'difficult',
  'hard',
  'advanced',
  'architecture',
  'security',
  'performance',
  'breaking-change',
  'major'
];

// Thresholds for scoring
const COMMENT_THRESHOLDS = {
  easy: 2, // 0-2 comments
  medium: 10 // 3-10 comments, 11+ is hard
};

const BODY_LENGTH_THRESHOLDS = {
  easy: 500, // < 500 chars
  medium: 2000 // 500-2000 chars, > 2000 is hard
};

/**
 * Normalize a label name for comparison
 * Converts to lowercase and removes spaces/hyphens
 *
 * @param label - Label name to normalize
 * @returns Normalized label string
 */
function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[\s-]/g, '');
}

/**
 * Check if issue has any labels matching the given patterns
 *
 * @param issue - GitHub issue to check
 * @param patterns - Label patterns to match against
 * @returns true if any label matches any pattern
 */
function hasMatchingLabel(issue: GitHubIssue, patterns: string[]): boolean {
  if (!issue.labels?.nodes) {
    return false;
  }

  const normalizedPatterns = patterns.map(normalizeLabel);

  return issue.labels.nodes.some((label) => {
    const normalized = normalizeLabel(label.name);
    return normalizedPatterns.some(
      (pattern) => normalized.includes(pattern) || pattern.includes(normalized)
    );
  });
}

/**
 * Calculate label-based difficulty score (0-100)
 * Easy labels = 0, Hard labels = 100, Otherwise = 50
 *
 * @param issue - GitHub issue to evaluate
 * @returns Score from 0-100
 */
function calculateLabelScore(issue: GitHubIssue): number {
  if (hasMatchingLabel(issue, EASY_LABELS)) {
    return 0;
  }
  if (hasMatchingLabel(issue, HARD_LABELS)) {
    return 100;
  }
  return 50;
}

/**
 * Calculate comment-based difficulty score (0-100)
 * Fewer comments = easier
 *
 * @param issue - GitHub issue to evaluate
 * @returns Score from 0-100
 */
function calculateCommentScore(issue: GitHubIssue): number {
  const count = issue.comments?.totalCount ?? 0;

  if (count <= COMMENT_THRESHOLDS.easy) {
    // 0-2 comments: score 0-33
    return (count / COMMENT_THRESHOLDS.easy) * 33;
  }

  if (count <= COMMENT_THRESHOLDS.medium) {
    // 3-10 comments: score 34-66
    const range = COMMENT_THRESHOLDS.medium - COMMENT_THRESHOLDS.easy;
    const position = count - COMMENT_THRESHOLDS.easy;
    return 34 + (position / range) * 32;
  }

  // 11+ comments: score 67-100 (capped at 100)
  const excess = count - COMMENT_THRESHOLDS.medium;
  return Math.min(67 + excess * 3, 100);
}

/**
 * Calculate body length-based difficulty score (0-100)
 * Shorter body = simpler scope
 *
 * @param issue - GitHub issue to evaluate
 * @returns Score from 0-100
 */
function calculateBodyScore(issue: GitHubIssue): number {
  const length = issue.body?.length ?? 0;

  if (length <= BODY_LENGTH_THRESHOLDS.easy) {
    // < 500 chars: score 0-33
    return (length / BODY_LENGTH_THRESHOLDS.easy) * 33;
  }

  if (length <= BODY_LENGTH_THRESHOLDS.medium) {
    // 500-2000 chars: score 34-66
    const range = BODY_LENGTH_THRESHOLDS.medium - BODY_LENGTH_THRESHOLDS.easy;
    const position = length - BODY_LENGTH_THRESHOLDS.easy;
    return 34 + (position / range) * 32;
  }

  // > 2000 chars: score 67-100 (capped at 100)
  const excess = length - BODY_LENGTH_THRESHOLDS.medium;
  return Math.min(67 + (excess / 1000) * 10, 100);
}

/**
 * Convert numeric score to difficulty level
 *
 * @param score - Numeric score (0-100)
 * @returns Difficulty level
 */
function scoreToLevel(score: number): DifficultyLevel {
  if (score <= 33) {
    return 'easy';
  }
  if (score <= 66) {
    return 'medium';
  }
  return 'hard';
}

/**
 * Generate explanation for the difficulty rating
 *
 * @param issue - GitHub issue
 * @param level - Calculated difficulty level
 * @returns Human-readable explanation
 */
function generateExplanation(issue: GitHubIssue, level: DifficultyLevel): string {
  const factors: string[] = [];

  // Check labels
  if (hasMatchingLabel(issue, EASY_LABELS)) {
    factors.push('beginner-friendly labels');
  } else if (hasMatchingLabel(issue, HARD_LABELS)) {
    factors.push('complex labels');
  }

  // Check comments
  const commentCount = issue.comments?.totalCount ?? 0;
  if (commentCount <= COMMENT_THRESHOLDS.easy) {
    factors.push('low discussion');
  } else if (commentCount > COMMENT_THRESHOLDS.medium) {
    factors.push('active discussion');
  }

  // Check body length
  const bodyLength = issue.body?.length ?? 0;
  if (bodyLength <= BODY_LENGTH_THRESHOLDS.easy) {
    factors.push('concise scope');
  } else if (bodyLength > BODY_LENGTH_THRESHOLDS.medium) {
    factors.push('detailed requirements');
  }

  if (factors.length === 0) {
    return `${level.charAt(0).toUpperCase() + level.slice(1)} difficulty`;
  }

  return `${level.charAt(0).toUpperCase() + level.slice(1)}: ${factors.join(', ')}`;
}

/**
 * Calculate the difficulty level of a GitHub issue
 *
 * Uses weighted scoring based on:
 * - Labels (40%): Presence of difficulty-indicating labels
 * - Comments (30%): Lower comment count = easier
 * - Body Length (30%): Shorter body = simpler scope
 *
 * @param issue - GitHub issue to evaluate
 * @returns Difficulty result with level, score, and explanation
 *
 * @example
 * const result = calculateDifficulty(issue);
 * console.log(result.level); // 'easy' | 'medium' | 'hard'
 * console.log(result.explanation); // 'Easy: beginner-friendly labels, low discussion'
 */
export function calculateDifficulty(issue: GitHubIssue): DifficultyResult {
  // Calculate individual scores
  const labelScore = calculateLabelScore(issue);
  const commentScore = calculateCommentScore(issue);
  const bodyScore = calculateBodyScore(issue);

  // Weighted average (labels 40%, comments 30%, body 30%)
  const weightedScore = labelScore * 0.4 + commentScore * 0.3 + bodyScore * 0.3;

  // Round to nearest integer
  const score = Math.round(weightedScore);

  // Determine level
  const level = scoreToLevel(score);

  // Generate explanation
  const explanation = generateExplanation(issue, level);

  return {
    level,
    score,
    explanation
  };
}

/**
 * Get display properties for a difficulty level
 *
 * @param level - Difficulty level
 * @returns Object with label and color classes
 */
export function getDifficultyDisplay(level: DifficultyLevel): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  switch (level) {
    case 'easy':
      return {
        label: 'Easy',
        bgClass: 'bg-green-500/15',
        textClass: 'text-green-400'
      };
    case 'medium':
      return {
        label: 'Medium',
        bgClass: 'bg-amber-500/15',
        textClass: 'text-amber-400'
      };
    case 'hard':
      return {
        label: 'Hard',
        bgClass: 'bg-red-500/15',
        textClass: 'text-red-400'
      };
  }
}
