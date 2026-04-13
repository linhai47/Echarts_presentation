import { CATEGORY_ORDER, RELATION_TYPES } from "../config.js";
import { buildGraphMetrics } from "./metrics.js";

function uniqueOrderedValues(baseOrder, values) {
  const result = [];
  const seen = new Set();

  for (const value of baseOrder) {
    if (seen.has(value)) {
      continue;
    }

    seen.add(value);
    result.push(value);
  }

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    result.push(value);
  }

  return result;
}

function toFiniteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getSymbolSize(importance) {
  const level = Math.max(1, Math.min(5, toFiniteNumber(importance, 3)));
  return 4 + level * 6;
}

export function buildCategoryBarData(nodes = [], options = {}) {
  const categories = uniqueOrderedValues(
    Array.isArray(options.categoryOrder) ? options.categoryOrder : CATEGORY_ORDER,
    nodes.map((node) => node?.category).filter(Boolean)
  );

  const counts = new Map(categories.map((category) => [category, 0]));

  for (const node of nodes) {
    const category = node?.category;
    if (!category) {
      continue;
    }

    counts.set(category, (counts.get(category) || 0) + 1);
  }

  const seriesData = categories.map((category) => counts.get(category) || 0);

  return {
    categories,
    seriesData,
    max: Math.max(1, ...seriesData),
    total: nodes.length
  };
}

export function buildDifficultyScatterData(nodes = [], links = [], options = {}) {
  const metrics = buildGraphMetrics(nodes, links);
  const points = nodes.map((node) => {
    const metricNode = metrics.nodeMap.get(node.id) || {};
    const difficulty = toFiniteNumber(node?.difficulty ?? node?.difficultyLevel ?? node?.level, 3);
    const degree = metricNode.degree ?? 0;
    const importance = toFiniteNumber(node?.importance, difficulty);

    return {
      id: node.id,
      name: node?.name || node?.id || "",
      category: node?.category || "",
      difficulty,
      degree,
      importance,
      symbolSize: getSymbolSize(importance)
    };
  });

  const maxDegree = points.reduce((max, item) => Math.max(max, item.degree), 1);
  const maxDifficulty = points.reduce((max, item) => Math.max(max, item.difficulty), 1);

  return {
    points,
    maxDegree,
    maxDifficulty,
    total: points.length,
    focusNodeId: options.focusNodeId || ""
  };
}

export function buildRelationPieData(links = [], options = {}) {
  const relationTypes = uniqueOrderedValues(
    Array.isArray(options.relationTypes) ? options.relationTypes : RELATION_TYPES,
    links.map((link) => link?.relation).filter(Boolean)
  );

  const counts = new Map(relationTypes.map((relation) => [relation, 0]));

  for (const link of links) {
    const relation = link?.relation || "未分类";
    if (!counts.has(relation)) {
      counts.set(relation, 0);
      relationTypes.push(relation);
    }

    counts.set(relation, (counts.get(relation) || 0) + 1);
  }

  const seriesData = relationTypes.map((relation) => ({
    name: relation,
    value: counts.get(relation) || 0
  }));

  return {
    seriesData,
    total: links.length
  };
}

export function buildFocusNodeDetailData(nodes = [], links = [], focusNodeId = "") {
  if (!focusNodeId) {
    return null;
  }

  const node = nodes.find((item) => item?.id === focusNodeId);
  if (!node) {
    return null;
  }

  const nodeMap = new Map(nodes.map((item) => [item.id, item]));
  const relatedLinks = links.filter((link) => link.source === focusNodeId || link.target === focusNodeId);
  const relatedNodeIds = new Set();

  const relations = relatedLinks.map((link) => {
    const isSource = link.source === focusNodeId;
    const relatedId = isSource ? link.target : link.source;
    const relatedNode = nodeMap.get(relatedId);

    if (relatedId) {
      relatedNodeIds.add(relatedId);
    }

    return {
      id: relatedId,
      name: relatedNode?.name || relatedId,
      category: relatedNode?.category || "",
      relation: link.relation,
      direction: isSource ? "后继" : "前置"
    };
  });

  return {
    ...node,
    difficulty: node.difficulty ?? 3,
    importance: node.importance ?? node.difficulty ?? 3,
    relations,
    relationCount: relatedNodeIds.size,
    relationLinkCount: relatedLinks.length
  };
}
