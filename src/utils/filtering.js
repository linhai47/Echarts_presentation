function matchesKeyword(node, keyword) {
  if (!keyword) {
    return true;
  }

  const haystack = [
    node.id,
    node.name,
    node.title,
    node.label,
    node.description,
    node.summary,
    node.keyword
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(keyword.toLowerCase());
}

function matchesDifficulty(node, difficultyRange) {
  if (!Array.isArray(difficultyRange)) {
    return true;
  }

  const [min, max] = difficultyRange;
  if (typeof min !== "number" || typeof max !== "number") {
    return true;
  }

  const difficulty = node.difficulty ?? node.difficultyLevel ?? node.level;
  if (typeof difficulty !== "number") {
    return true;
  }

  return difficulty >= min && difficulty <= max;
}

export function filterGraphData(nodes, links, filters) {
  const baseNodes = nodes.filter((node) => {
    const categoryOk = !filters.category || node.category === filters.category;
    const keywordOk = matchesKeyword(node, filters.keyword);
    const difficultyOk = matchesDifficulty(node, filters.difficultyRange);

    return categoryOk && keywordOk && difficultyOk;
  });

  const allowedIds = new Set(baseNodes.map((node) => node.id));
  const relationLinks = links.filter((link) => {
    const relationOk = !filters.relation || link.relation === filters.relation;
    return relationOk && allowedIds.has(link.source) && allowedIds.has(link.target);
  });

  if (filters.relation) {
    const linkedIds = new Set();
    for (const link of relationLinks) {
      linkedIds.add(link.source);
      linkedIds.add(link.target);
    }

    return {
      nodes: baseNodes.filter((node) => linkedIds.has(node.id)),
      links: relationLinks
    };
  }

  const nextLinks = relationLinks;
  return { nodes: baseNodes, links: nextLinks };
}
