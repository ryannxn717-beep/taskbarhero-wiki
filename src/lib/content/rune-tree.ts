import type { RuneRecord } from './schema';

export interface RuneTreeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface RuneTreeLevel {
  level: number;
  stat: string;
  value: number;
  costItem: number;
  costValue: number;
}

export interface RuneTreeNode {
  key: number;
  x: number;
  y: number;
  name: string;
  icon: string;
  maxLevel: number;
  prevReq: number | null;
  stat: string;
  effect: string;
  levels: RuneTreeLevel[];
  preview: number[];
}

export interface RuneTreeEdge {
  from: number;
  to: number;
}

export interface RuneTreeFeature {
  bounds: RuneTreeBounds;
  startNodes: number[];
  nodes: RuneTreeNode[];
  edges: RuneTreeEdge[];
}

export interface RuneTreePoint {
  x: number;
  y: number;
}

export interface RuneTreeViewport {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

const POSITION_SCALE = 1.6;
const VIEW_PADDING = 120;

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function finite(value: unknown, label: string): number {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be finite; received ${String(value)}`);
  return number;
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value) throw new Error(`${label} must be a non-empty string`);
  return value;
}

export function parseRuneTreeFeature(input: Record<string, unknown>): RuneTreeFeature {
  const boundsInput = record(input.bounds, 'runeTree.bounds');
  const bounds: RuneTreeBounds = {
    minX: finite(boundsInput.minX, 'runeTree.bounds.minX'),
    maxX: finite(boundsInput.maxX, 'runeTree.bounds.maxX'),
    minY: finite(boundsInput.minY, 'runeTree.bounds.minY'),
    maxY: finite(boundsInput.maxY, 'runeTree.bounds.maxY')
  };
  if (bounds.maxX <= bounds.minX || bounds.maxY <= bounds.minY) throw new Error('runeTree bounds must have positive area');
  if (!Array.isArray(input.nodes) || !Array.isArray(input.edges) || !Array.isArray(input.startNodes)) {
    throw new Error('runeTree nodes, edges, and startNodes must be arrays');
  }

  const nodes = input.nodes.map((value, index): RuneTreeNode => {
    const node = record(value, `runeTree.nodes[${index}]`);
    if (!Array.isArray(node.levels) || !Array.isArray(node.preview)) throw new Error(`runeTree node ${index} levels/preview must be arrays`);
    return {
      key: finite(node.key, `runeTree.nodes[${index}].key`),
      x: finite(node.x, `runeTree.nodes[${index}].x`),
      y: finite(node.y, `runeTree.nodes[${index}].y`),
      name: text(node.name, `runeTree.nodes[${index}].name`),
      icon: text(node.icon, `runeTree.nodes[${index}].icon`),
      maxLevel: finite(node.maxLevel, `runeTree.nodes[${index}].maxLevel`),
      prevReq: node.prevReq === null ? null : finite(node.prevReq, `runeTree.nodes[${index}].prevReq`),
      stat: text(node.stat, `runeTree.nodes[${index}].stat`),
      effect: text(node.effect, `runeTree.nodes[${index}].effect`),
      levels: node.levels.map((levelValue, levelIndex) => {
        const level = record(levelValue, `runeTree.nodes[${index}].levels[${levelIndex}]`);
        return {
          level: finite(level.level, `runeTree level ${index}:${levelIndex}`),
          stat: text(level.stat, `runeTree level stat ${index}:${levelIndex}`),
          value: finite(level.value, `runeTree level value ${index}:${levelIndex}`),
          costItem: finite(level.costItem, `runeTree level cost item ${index}:${levelIndex}`),
          costValue: finite(level.costValue, `runeTree level cost ${index}:${levelIndex}`)
        };
      }),
      preview: node.preview.map((entry, previewIndex) => finite(entry, `runeTree preview ${index}:${previewIndex}`))
    };
  });
  const keys = new Set(nodes.map((node) => node.key));
  if (keys.size !== nodes.length) throw new Error(`runeTree has duplicate node keys; nodes=${nodes.length} unique=${keys.size}`);
  const edges = input.edges.map((value, index): RuneTreeEdge => {
    const edge = record(value, `runeTree.edges[${index}]`);
    const parsed = { from: finite(edge.from, `runeTree.edges[${index}].from`), to: finite(edge.to, `runeTree.edges[${index}].to`) };
    if (!keys.has(parsed.from) || !keys.has(parsed.to)) throw new Error(`runeTree edge ${parsed.from}->${parsed.to} references a missing node`);
    return parsed;
  });
  const startNodes = input.startNodes.map((entry, index) => finite(entry, `runeTree.startNodes[${index}]`));
  if (startNodes.some((key) => !keys.has(key))) throw new Error('runeTree startNodes references a missing node');
  return { bounds, startNodes, nodes, edges };
}

export function projectRuneTreeNode(node: Pick<RuneTreeNode, 'x' | 'y'>, bounds: RuneTreeBounds): RuneTreePoint {
  return {
    x: (node.x - bounds.minX) * POSITION_SCALE + VIEW_PADDING,
    y: (node.y - bounds.minY) * POSITION_SCALE + VIEW_PADDING
  };
}

export function runeTreeViewport(bounds: RuneTreeBounds): RuneTreeViewport {
  const width = (bounds.maxX - bounds.minX) * POSITION_SCALE + VIEW_PADDING * 2;
  const height = (bounds.maxY - bounds.minY) * POSITION_SCALE + VIEW_PADDING * 2;
  return { width, height, centerX: width / 2, centerY: height / 2 };
}

export function runeTreeNodeFor(tree: RuneTreeFeature, rune: RuneRecord): RuneTreeNode {
  const node = tree.nodes.find((entry) => String(entry.key) === rune.id);
  if (!node) throw new Error(`runeTree has no node for rune ${rune.id}`);
  return node;
}

export function formatRuneEffect(node: RuneTreeNode, value: number): string {
  return node.effect.replaceAll('{0}', value.toLocaleString('en-US'));
}
