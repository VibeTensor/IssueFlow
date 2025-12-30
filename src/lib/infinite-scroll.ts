/**
 * Infinite Scroll Svelte Action
 * Issue #131 - Infinite Scroll with Virtual List Rendering
 *
 * Provides IntersectionObserver-based infinite scroll detection.
 * Dispatches a custom 'loadmore' event when the sentinel element enters viewport.
 * Uses rootMargin to trigger load before reaching absolute bottom (preloading).
 */

/**
 * Options for the infiniteScroll action
 */
export interface InfiniteScrollOptions {
  /** Whether infinite scroll is enabled (default: true) */
  enabled?: boolean;
  /** Root margin for early triggering (default: '200px') */
  rootMargin?: string;
  /** Intersection threshold 0-1 (default: 0) */
  threshold?: number;
}

/**
 * Default root margin - triggers 200px before element comes into view
 */
const DEFAULT_ROOT_MARGIN = '200px';

/**
 * Default threshold - trigger as soon as any part is visible
 */
const DEFAULT_THRESHOLD = 0;

/**
 * Svelte action for detecting when user scrolls near bottom of content.
 * Attach to a sentinel element at the bottom of your scrollable list.
 *
 * @param node - The sentinel HTML element to observe
 * @param options - Configuration options for the infinite scroll behavior
 * @returns Action methods for destroy and update
 *
 * @example
 * <div
 *   use:infiniteScroll={{ enabled: hasMorePages }}
 *   onloadmore={handleLoadMore}
 *   class="h-1"
 * />
 */
export function infiniteScroll(
  node: HTMLElement,
  options: InfiniteScrollOptions = {}
): { destroy: () => void; update: (options: InfiniteScrollOptions) => void } {
  let enabled = options.enabled ?? true;
  let rootMargin = options.rootMargin ?? DEFAULT_ROOT_MARGIN;
  let threshold = options.threshold ?? DEFAULT_THRESHOLD;
  let observer: IntersectionObserver | null = null;

  /**
   * Callback when intersection changes
   */
  function handleIntersection(entries: IntersectionObserverEntry[]): void {
    const entry = entries[0];

    if (entry.isIntersecting && enabled) {
      // Dispatch custom loadmore event
      const loadmoreEvent = new CustomEvent('loadmore', {
        bubbles: true,
        cancelable: true
      });
      node.dispatchEvent(loadmoreEvent);
    }
  }

  /**
   * Create and start the observer
   */
  function createObserver(): void {
    // Cleanup existing observer if any
    if (observer) {
      observer.disconnect();
    }

    // Only create observer if enabled
    if (!enabled) {
      return;
    }

    // Create new observer with current options
    observer = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin,
      threshold
    });

    // Start observing the sentinel element
    observer.observe(node);
  }

  // Initial setup
  createObserver();

  return {
    /**
     * Clean up observer when element is destroyed
     */
    destroy(): void {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    },

    /**
     * Update options when they change
     */
    update(newOptions: InfiniteScrollOptions): void {
      const newEnabled = newOptions.enabled ?? true;
      const newRootMargin = newOptions.rootMargin ?? DEFAULT_ROOT_MARGIN;
      const newThreshold = newOptions.threshold ?? DEFAULT_THRESHOLD;

      // Check if options have changed
      const optionsChanged =
        newEnabled !== enabled || newRootMargin !== rootMargin || newThreshold !== threshold;

      // Update stored values
      enabled = newEnabled;
      rootMargin = newRootMargin;
      threshold = newThreshold;

      // Recreate observer if options changed
      if (optionsChanged) {
        createObserver();
      }
    }
  };
}
