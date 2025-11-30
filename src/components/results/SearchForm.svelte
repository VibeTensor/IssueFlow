<!--
  SearchForm Component
  Issue #35 - Extracted from ResultsList.svelte

  Search form with repository URL input, GitHub token input,
  and real-time URL validation with debouncing.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { validateRepoUrl } from '../../lib/github-graphql';
  import type { ValidationState } from '../../lib/types/results';

  interface Props {
    repoUrl: string;
    token: string;
    loading: boolean;
    isAuthenticated: boolean;
    onSearch: () => void;
    onUrlChange: (url: string) => void;
    onTokenChange: (token: string) => void;
    onShowHelp: () => void;
  }

  let {
    repoUrl,
    token,
    loading,
    isAuthenticated,
    onSearch,
    onUrlChange,
    onTokenChange,
    onShowHelp
  }: Props = $props();

  // Local state for validation
  let validationState = $state<ValidationState['state']>('idle');
  let validationMessage = $state('');
  let validationTimeout: number | null = null;
  let repoUrlInput: HTMLInputElement;

  /**
   * Handle repository URL input with debounced validation
   */
  function handleRepoUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newUrl = target.value;
    onUrlChange(newUrl);

    // Clear previous timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // If empty, reset to idle immediately
    if (!newUrl.trim()) {
      validationState = 'idle';
      validationMessage = '';
      return;
    }

    // Debounce validation by 300ms
    validationTimeout = window.setTimeout(() => {
      const result = validateRepoUrl(newUrl);
      validationState = result.state;
      validationMessage = result.message || '';
    }, 300);
  }

  /**
   * Handle token input change
   */
  function handleTokenInput(event: Event) {
    const target = event.target as HTMLInputElement;
    onTokenChange(target.value);
  }

  /**
   * Handle Enter key in repo URL input
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      onSearch();
    }
  }

  // Auto-focus the repository URL input on mount and cleanup timeout
  onMount(() => {
    if (repoUrlInput) {
      repoUrlInput.focus();
    }
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  });

  // Derived: can submit form (also checks validation state)
  let canSubmit = $derived(!loading && repoUrl.trim().length > 0 && validationState !== 'invalid');
</script>

<div class="sketch-card p-4 md:p-6 lg:p-8 mb-8">
  <div class="space-y-6">
    <!-- Repository URL Input -->
    <div>
      <label for="repoUrl" class="block text-base font-bold text-white mb-3">
        Repository URL
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-6 w-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </div>
        <input
          id="repoUrl"
          bind:this={repoUrlInput}
          type="text"
          value={repoUrl}
          placeholder="https://github.com/facebook/react"
          class="sketch-input w-full pl-14 pr-12 py-4 text-base text-white rounded-lg outline-none bg-slate-800/80 placeholder-slate-500 {validationState === 'valid' ? 'border-green-500/50' : validationState === 'invalid' ? 'border-red-500/50' : ''}"
          oninput={handleRepoUrlInput}
          onkeydown={handleKeydown}
          aria-describedby="repoUrl-hint"
          aria-invalid={validationState === 'invalid'}
        />
        <!-- Validation Icon -->
        {#if validationState === 'valid'}
          <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        {:else if validationState === 'invalid'}
          <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        {/if}
      </div>
      <!-- Validation Hint Text -->
      {#if validationMessage}
        <p
          id="repoUrl-hint"
          class="text-sm mt-2 flex items-center gap-2 {validationState === 'valid' ? 'text-green-400' : 'text-red-400'}"
          role={validationState === 'invalid' ? 'alert' : undefined}
        >
          {validationMessage}
        </p>
      {/if}
    </div>

    <!-- Token Input -->
    <div>
      <label for="token" class="block text-base font-bold text-white mb-3">
        {#if isAuthenticated}
          <span class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>GitHub Token</span>
            <span class="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-700/80 px-2.5 py-1 rounded-full sketch-badge w-fit">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="whitespace-nowrap">Authenticated (5000 req/hr)</span>
            </span>
          </span>
        {:else}
          GitHub Token <span class="text-slate-400 text-sm font-normal">(Optional)</span>
        {/if}
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <input
          id="token"
          type="password"
          value={token}
          placeholder={isAuthenticated ? "••••••••••••••••••••" : "ghp_xxxxxxxxxxxx"}
          class="sketch-input w-full pl-14 pr-4 py-4 text-base text-white rounded-lg outline-none bg-slate-800/80 placeholder-slate-500"
          oninput={handleTokenInput}
        />
      </div>
      {#if !isAuthenticated}
        <p class="text-sm text-slate-400 mt-2 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Works without token (60 req/hr). Stored locally for your privacy.</span>
        </p>
      {/if}
    </div>

    <!-- Search Button -->
    <button
      onclick={onSearch}
      disabled={!canSubmit}
      class="sketch-button w-full bg-slate-700 text-white py-5 px-8 rounded-lg font-bold text-lg hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
    >
      {#if loading}
        <span class="flex items-center justify-center gap-3">
          <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Searching...</span>
        </span>
      {:else}
        <span class="flex items-center justify-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Find Unassigned Issues (No PRs)</span>
        </span>
      {/if}
    </button>
  </div>
</div>
