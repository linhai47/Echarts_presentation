export function buildGraphMetrics(nodes, links) {
  const nodeMap = new Map(
    nodes.map((node) => [
      node.id,
      {
        ...node,
        inDegree: 0,
        outDegree: 0,
        degree: 0,
        neighborIds: new Set()
      }
    ])
  );

  const relationCountByType = {};

  for (const link of links) {
    const source = nodeMap.get(link.source);
    const target = nodeMap.get(link.target);

    if (source) {
      source.outDegree += 1;
      if (link.target) {
        source.neighborIds.add(link.target);
      }
    }

    if (target) {
      target.inDegree += 1;
      if (link.source) {
        target.neighborIds.add(link.source);
      }
    }

    const relationType = link.relation || "未分类";
    relationCountByType[relationType] = (relationCountByType[relationType] || 0) + 1;
  }

  for (const node of nodeMap.values()) {
    node.degree = node.neighborIds.size;
    node.neighborIds = [...node.neighborIds];
  }

  return {
    nodeMap,
    relationCountByType,
    totalLinks: links.length
  };
}
