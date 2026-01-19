<!--
  ClusterView Component
  Issue #154 - Topic Cluster Visualization

  Displays issues as a force-directed graph grouped by label clusters.
  Features:
  - D3 force simulation for layout
  - Zoom and pan controls
  - Click cluster to focus
  - Hover for issue details
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { GitHubIssue } from '../../lib/github-graphql';
  import {
    clusterIssuesByLabel,
    calculateClusterPositions,
    getNodesInCluster,
    getNodesBoundingBox,
    type ClusterNode,
    type Cluster,
    type ClusterData
  } from '../../lib/clustering-utils';

  interface Props {
    /** Array of issues to visualize */
    issues: GitHubIssue[];
    /** Container width (default: 800) */
    width?: number;
    /** Container height (default: 600) */
    height?: number;
    /** Callback when a node is clicked */
    onNodeClick?: (issue: GitHubIssue) => void;
  }

  let { issues, width = 800, height = 600, onNodeClick }: Props = $props();

  // DOM references
  let svgElement: SVGSVGElement;
  let containerElement: HTMLDivElement;

  // D3 selections and simulation
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let simulation: d3.Simulation<ClusterNode, undefined>;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

  // State
  let clusterData = $state<ClusterData>({ clusters: [], nodes: [] });
  let hoveredNode = $state<ClusterNode | null>(null);
  let selectedCluster = $state<string | null>(null);

  // Derived: clusters with positions
  let positionedClusters = $derived(calculateClusterPositions(clusterData.clusters, width, height));

  // Node radius based on comment count
  function getNodeRadius(node: ClusterNode): number {
    const baseRadius = 8;
    const comments = node.issue.comments?.totalCount ?? 0;
    return baseRadius + Math.min(comments, 10) * 0.5;
  }

  // Initialize D3 visualization
  function initializeVisualization() {
    if (!svgElement) return;

    // Process issues into cluster data
    clusterData = clusterIssuesByLabel(issues);

    if (clusterData.nodes.length === 0) return;

    // Clear previous content
    d3.select(svgElement).selectAll('*').remove();

    // Setup SVG
    svg = d3.select(svgElement);

    // Create zoom behavior
    zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create main group for zoom/pan
    g = svg.append('g');

    // Get cluster positions
    const clusters = calculateClusterPositions(clusterData.clusters, width, height);
    const clusterMap = new Map(clusters.map((c) => [c.name, c]));

    // Initialize node positions near their cluster center
    for (const node of clusterData.nodes) {
      const cluster = clusterMap.get(node.cluster);
      if (cluster) {
        node.x = cluster.x! + (Math.random() - 0.5) * 100;
        node.y = cluster.y! + (Math.random() - 0.5) * 100;
      } else {
        node.x = width / 2 + (Math.random() - 0.5) * 100;
        node.y = height / 2 + (Math.random() - 0.5) * 100;
      }
    }

    // Create force simulation
    simulation = d3
      .forceSimulation<ClusterNode>(clusterData.nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        'collision',
        d3.forceCollide<ClusterNode>().radius((d) => getNodeRadius(d) + 4)
      )
      .force(
        'x',
        d3.forceX<ClusterNode>((d) => clusterMap.get(d.cluster)?.x ?? width / 2).strength(0.3)
      )
      .force(
        'y',
        d3.forceY<ClusterNode>((d) => clusterMap.get(d.cluster)?.y ?? height / 2).strength(0.3)
      );

    // Draw cluster labels
    const clusterLabels = g
      .selectAll('.cluster-label')
      .data(clusters)
      .join('g')
      .attr('class', 'cluster-label')
      .attr('transform', (d) => `translate(${d.x}, ${d.y! - 60})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        focusOnCluster(d.name);
      });

    clusterLabels
      .append('rect')
      .attr('x', -40)
      .attr('y', -12)
      .attr('width', 80)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('fill', (d) => `#${d.color}40`)
      .attr('stroke', (d) => `#${d.color}`)
      .attr('stroke-width', 1.5);

    clusterLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => `#${d.color}`)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text((d) => (d.name.length > 10 ? d.name.slice(0, 10) + '...' : d.name));

    clusterLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.8em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text((d) => `${d.count} issue${d.count !== 1 ? 's' : ''}`);

    // Draw nodes
    const nodes = g
      .selectAll('.node')
      .data(clusterData.nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => `#${d.color}`)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        hoveredNode = d;
        d3.select(event.target).attr('stroke', '#fff').attr('stroke-width', 3);
      })
      .on('mouseleave', (event) => {
        hoveredNode = null;
        d3.select(event.target).attr('stroke', '#1e293b').attr('stroke-width', 2);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onNodeClick) {
          onNodeClick(d.issue);
        }
      })
      .call(
        d3
          .drag<SVGCircleElement, ClusterNode>()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    // Update positions on simulation tick
    simulation.on('tick', () => {
      nodes.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
    });

    // Click on background to reset zoom
    svg.on('click', () => {
      selectedCluster = null;
      resetZoom();
    });
  }

  // Drag handlers
  function dragStarted(event: d3.D3DragEvent<SVGCircleElement, ClusterNode, ClusterNode>) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGCircleElement, ClusterNode, ClusterNode>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event: d3.D3DragEvent<SVGCircleElement, ClusterNode, ClusterNode>) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  // Focus on a specific cluster
  function focusOnCluster(clusterName: string) {
    selectedCluster = clusterName;
    const nodesInCluster = getNodesInCluster(clusterData.nodes, clusterName);

    if (nodesInCluster.length === 0) return;

    const bounds = getNodesBoundingBox(nodesInCluster, 80);

    // Calculate zoom transform to fit cluster
    const scale = Math.min((0.9 * width) / bounds.width, (0.9 * height) / bounds.height, 2);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }

  // Reset zoom to initial state
  function resetZoom() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  }

  // Zoom controls
  function zoomIn() {
    svg.transition().duration(300).call(zoom.scaleBy, 1.5);
  }

  function zoomOut() {
    svg.transition().duration(300).call(zoom.scaleBy, 0.67);
  }

  // Reinitialize when issues change
  $effect(() => {
    if (issues && issues.length > 0 && svgElement) {
      initializeVisualization();
    }
  });

  // Cleanup on destroy
  onDestroy(() => {
    if (simulation) {
      simulation.stop();
    }
  });

  onMount(() => {
    if (issues && issues.length > 0) {
      initializeVisualization();
    }
  });
</script>

<div class="cluster-view-container" bind:this={containerElement}>
  <!-- Zoom Controls -->
  <div class="zoom-controls">
    <button type="button" onclick={zoomIn} aria-label="Zoom in" title="Zoom in">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
      </svg>
    </button>
    <button type="button" onclick={zoomOut} aria-label="Zoom out" title="Zoom out">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M8 11h6" />
      </svg>
    </button>
    <button type="button" onclick={resetZoom} aria-label="Reset zoom" title="Reset view">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  </div>

  <!-- Cluster Legend -->
  <div class="cluster-legend">
    <div class="legend-title">Clusters</div>
    {#each positionedClusters as cluster (cluster.name)}
      <button
        type="button"
        class="legend-item"
        class:selected={selectedCluster === cluster.name}
        onclick={() => focusOnCluster(cluster.name)}
      >
        <span class="legend-color" style="background-color: #{cluster.color}"></span>
        <span class="legend-name">{cluster.name}</span>
        <span class="legend-count">{cluster.count}</span>
      </button>
    {/each}
  </div>

  <!-- SVG Canvas -->
  <svg bind:this={svgElement} {width} {height} viewBox="0 0 {width} {height}" class="cluster-svg">
  </svg>

  <!-- Tooltip -->
  {#if hoveredNode}
    <div class="tooltip" style="opacity: 1">
      <div class="tooltip-title">#{hoveredNode.issue.number}</div>
      <div class="tooltip-body">{hoveredNode.issue.title}</div>
      <div class="tooltip-meta">
        <span style="color: #{hoveredNode.color}">{hoveredNode.cluster}</span>
        <span>{hoveredNode.issue.comments?.totalCount ?? 0} comments</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .cluster-view-container {
    position: relative;
    width: 100%;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 12px;
    border: 1px solid rgba(71, 85, 105, 0.4);
    overflow: hidden;
  }

  .cluster-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Zoom Controls */
  .zoom-controls {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
  }

  .zoom-controls button {
    width: 32px;
    height: 32px;
    padding: 6px;
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 6px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .zoom-controls button:hover {
    background: rgba(51, 65, 85, 0.9);
    color: white;
    border-color: rgba(100, 116, 139, 0.6);
  }

  .zoom-controls button svg {
    width: 100%;
    height: 100%;
  }

  /* Cluster Legend */
  .cluster-legend {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(71, 85, 105, 0.4);
    border-radius: 8px;
    padding: 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    min-width: 140px;
  }

  .legend-title {
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 4px 6px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .legend-item:hover {
    background: rgba(51, 65, 85, 0.5);
  }

  .legend-item.selected {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
  }

  .legend-color {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-name {
    flex: 1;
    font-size: 11px;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .legend-count {
    font-size: 10px;
    color: #64748b;
    background: rgba(51, 65, 85, 0.5);
    padding: 1px 5px;
    border-radius: 9999px;
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 8px;
    padding: 10px 12px;
    max-width: 280px;
    z-index: 20;
    pointer-events: none;
  }

  .tooltip-title {
    font-size: 12px;
    font-weight: 700;
    color: #14b8a6;
    margin-bottom: 4px;
  }

  .tooltip-body {
    font-size: 12px;
    color: #e2e8f0;
    line-height: 1.4;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tooltip-meta {
    display: flex;
    gap: 8px;
    font-size: 10px;
    color: #94a3b8;
  }

  /* Scrollbar for legend */
  .cluster-legend::-webkit-scrollbar {
    width: 4px;
  }

  .cluster-legend::-webkit-scrollbar-track {
    background: transparent;
  }

  .cluster-legend::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.4);
    border-radius: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .cluster-legend {
      max-width: 120px;
      font-size: 10px;
    }

    .zoom-controls button {
      width: 28px;
      height: 28px;
    }

    .tooltip {
      max-width: 200px;
    }
  }
</style>
