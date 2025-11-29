<!--
  HelpPopup Component
  Issue #35 - Extracted from ResultsList.svelte

  Modal overlay displaying how-to guide for using IssueFlow.
  Includes step-by-step instructions for GitHub token creation.
-->

<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show, onClose }: Props = $props();

  /**
   * Handle keyboard events - close on Escape
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  // Add/remove event listener for escape key
  onMount(() => {
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      if (show && event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  });
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
    onclick={onClose}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-dialog-title"
  >
    <div
      class="help-popup-scroll sketch-container max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="sticky top-0 bg-slate-900/98 backdrop-blur px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-slate-700 z-10">
        <div class="flex items-center gap-3 md:gap-4 min-w-0">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-slate-700 rounded-lg flex items-center justify-center sketch-icon flex-shrink-0">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 id="help-dialog-title" class="text-xl md:text-2xl lg:text-3xl font-extrabold text-white truncate">How It Works</h2>
        </div>
        <button
          onclick={onClose}
          class="w-10 h-10 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6 bg-slate-900/95">
        <!-- Step 1: Authentication -->
        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">1</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-3 break-words">Choose Authentication (Optional)</h3>
              <p class="text-slate-300 text-xs md:text-sm mb-3 break-words">Without token: 60 req/hr · With token: 5000 req/hr</p>

              <!-- Token Generation Substeps -->
              <div class="bg-slate-800/50 rounded-lg p-3 md:p-4 space-y-3">
                <p class="text-white text-xs md:text-sm font-semibold mb-2">How to create a GitHub token:</p>

                <div class="space-y-2">
                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">1</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Click <a href="https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">this link</a> or the "Create Token" button
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">2</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Authenticate with GitHub (if not logged in)
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">3</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Scroll down and check the <span class="font-semibold text-white">"public_repo"</span> scope (should be auto-selected)
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">4</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Scroll to bottom and click <span class="font-semibold text-green-400">"Generate token"</span>
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">5</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Copy the token (starts with <code class="text-amber-300 text-xs">ghp_</code>)
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">6</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Paste it in the "GitHub Token" field above and save it
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-2 mt-3 pt-3 border-t border-slate-700">
                  <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-amber-300 text-xs break-words">
                    Save your token somewhere safe! GitHub only shows it once.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Enter Repository URL -->
        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">2</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-2 break-words">Enter Repository URL</h3>
              <p class="text-slate-300 text-xs md:text-sm break-words">Format: https://github.com/owner/repository</p>
            </div>
          </div>
        </div>

        <!-- Step 3: Find Issues -->
        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">3</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-2 break-words">Find Issues</h3>
              <p class="text-slate-300 text-xs md:text-sm mb-2">Automatically filters for:</p>
              <ul class="text-slate-300 text-xs md:text-sm space-y-1 ml-4">
                <li class="flex items-start gap-2">
                  <span class="text-slate-400 flex-shrink-0">•</span>
                  <span class="break-words">Open issues</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-slate-400 flex-shrink-0">•</span>
                  <span class="break-words">Unassigned issues</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-slate-400 flex-shrink-0">•</span>
                  <span class="break-words"><strong>With token:</strong> Excludes issues with PRs</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-amber-300 text-xs break-words"><strong>Without token:</strong> PR filtering unavailable</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Step 4: Start Contributing -->
        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">4</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-2 break-words">Start Contributing</h3>
              <p class="text-slate-300 text-xs md:text-sm break-words">Click "View" on any issue to open it on GitHub</p>
            </div>
          </div>
        </div>

        <!-- Privacy Note -->
        <div class="sketch-card p-4 md:p-6 bg-slate-800/40">
          <div class="flex items-start gap-3 md:gap-4">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div class="min-w-0">
              <h3 class="text-base md:text-lg font-bold text-slate-300 mb-2 break-words">Privacy & Security</h3>
              <p class="text-slate-400 text-xs md:text-sm break-words">
                Your GitHub token is stored locally in your browser only. Never sent to any server except GitHub's official API.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-slate-900/98 backdrop-blur px-4 md:px-8 py-4 md:py-6 border-t border-slate-700">
        <button
          onclick={onClose}
          class="w-full bg-slate-700 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg font-bold text-base md:text-lg hover:bg-slate-600 sketch-button"
        >
          Got it! Let's Find Issues
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar for help popup */
  /* Note: 8px width balances aesthetics with usability. Increase if user feedback indicates difficulty grabbing. */
  .help-popup-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.6) transparent;
  }

  .help-popup-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .help-popup-scroll::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.6);
    border-radius: 10px;
    transition: background 0.2s ease;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }

  /* Smooth scrolling */
  .help-popup-scroll {
    scroll-behavior: smooth;
  }
</style>
