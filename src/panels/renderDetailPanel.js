function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDifficulty(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "未设置";
}

function createRelationKey(item) {
  if (item?.id) {
    return `id:${item.id}`;
  }

  if (item?.name) {
    return `name:${item.name}`;
  }

  return "unknown";
}

function organizeRelations(relations) {
  const grouped = new Map();

  relations.forEach((item) => {
    const key = createRelationKey(item);
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: item?.id || "",
        name: item?.name || item?.id || "未知知识点",
        hasPredecessorPrerequisite: false,
        hasSuccessorPrerequisite: false,
        relationLabels: []
      });
    }

    const current = grouped.get(key);
    const relationLabel = item?.relation || "相关";

    if (relationLabel === "先修" && item?.direction === "前置") {
      current.hasPredecessorPrerequisite = true;
      return;
    }

    if (relationLabel === "先修" && item?.direction === "后继") {
      current.hasSuccessorPrerequisite = true;
      return;
    }

    if (!current.relationLabels.includes(relationLabel)) {
      current.relationLabels.push(relationLabel);
    }
  });

  const predecessors = [];
  const successors = [];
  const related = [];

  grouped.forEach((item) => {
    if (item.hasPredecessorPrerequisite) {
      predecessors.push({
        id: item.id,
        name: item.name
      });
      return;
    }

    if (item.hasSuccessorPrerequisite) {
      successors.push({
        id: item.id,
        name: item.name
      });
      return;
    }

    if (item.relationLabels.length) {
      related.push({
        id: item.id,
        name: item.name,
        relationLabel: item.relationLabels.join(" / ")
      });
    }
  });

  return { predecessors, successors, related };
}

function renderRelationList(items, emptyText, options = {}) {
  const showRelationLabel = Boolean(options.showRelationLabel);

  if (!items.length) {
    return `<p>${escapeHtml(emptyText)}</p>`;
  }

  return `<ul>${items
    .map(
      (item) => `
        <li>
          ${showRelationLabel ? `<strong>${escapeHtml(item.relationLabel || "关联")}</strong>` : ""}
          <span>${escapeHtml(item.name || item.id || "未知知识点")}</span>
        </li>
      `
    )
    .join("")}</ul>`;
}

function createConclusion(focusNode, predecessors, successors) {
  const relationCount = typeof focusNode.relationCount === "number" ? focusNode.relationCount : predecessors.length + successors.length;
  const importance = Number.isFinite(Number(focusNode.importance)) ? Number(focusNode.importance) : 3;

  if (relationCount >= 4 && importance >= 4) {
    return "该知识点连接度高，适合作为学习网络中的核心枢纽优先掌握。";
  }

  if (predecessors.length > successors.length) {
    return "该知识点更依赖前置知识，建议先补齐前置内容再继续深入。";
  }

  if (successors.length > predecessors.length) {
    return "该知识点更适合作为过渡节点，学完后可以顺势串联后继内容。";
  }

  return "该知识点前后关系相对均衡，适合结合相邻知识点做串联复习。";
}

export function createDetailPanelMarkup(state = {}) {
  const focusNode = state.focusNode;

  if (!focusNode) {
    return `
      <div class="detail-empty">
        <p class="app-eyebrow">详情面板</p>
        <h2>请选择一个知识点查看局部分析</h2>
        <p class="detail-empty__hint">点击主图区节点或散点图聚焦一个知识点。</p>
      </div>
    `;
  }

  const relations = Array.isArray(focusNode.relations) ? focusNode.relations : [];
  const { predecessors, successors, related } = organizeRelations(relations);
  const relationCount = typeof focusNode.relationCount === "number" ? focusNode.relationCount : relations.length;
  const conclusion = createConclusion(focusNode, predecessors, successors);

  return `
    <div class="detail-card">
      <p class="app-eyebrow">当前聚焦</p>
      <h2>${escapeHtml(focusNode.name || focusNode.id || "未命名知识点")}</h2>
      <p class="detail-card__summary">${escapeHtml(focusNode.summary || "暂无摘要")}</p>
      <dl class="detail-metrics">
        <div>
          <dt>分类</dt>
          <dd>${escapeHtml(focusNode.category || "未设置")}</dd>
        </div>
        <div>
          <dt>难度</dt>
          <dd>${escapeHtml(formatDifficulty(focusNode.difficulty))}</dd>
        </div>
        <div>
          <dt>连接度</dt>
          <dd>${escapeHtml(relationCount)}</dd>
        </div>
        <div>
          <dt>重要度</dt>
          <dd>${escapeHtml(formatDifficulty(focusNode.importance))}</dd>
        </div>
      </dl>
      <div class="detail-relations">
        <h3>前置知识</h3>
        ${renderRelationList(predecessors.slice(0, 4), "当前没有可展示的前置知识。")}
      </div>
      <div class="detail-relations">
        <h3>后继知识</h3>
        ${renderRelationList(successors.slice(0, 4), "当前没有可展示的后继知识。")}
      </div>
      <div class="detail-relations">
        <h3>关联知识</h3>
        ${renderRelationList(related.slice(0, 4), "当前没有可展示的补充关联知识。", { showRelationLabel: true })}
      </div>
      <div class="detail-relations">
        <h3>一句分析结论</h3>
        <p>${escapeHtml(conclusion)}</p>
      </div>
    </div>
  `;
}

export function renderDetailPanel(container, state = {}) {
  if (!container) {
    return;
  }

  container.innerHTML = createDetailPanelMarkup(state);
}
