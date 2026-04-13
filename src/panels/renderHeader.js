function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDifficultyRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return "1-5";
  }

  const [min, max] = range;
  return `${min ?? 1}-${max ?? 5}`;
}

function formatSummary(state = {}) {
  const filters = state.filters || {};
  const pieces = [
    filters.category ? `分类：${filters.category}` : "分类：全部",
    filters.relation ? `关系：${filters.relation}` : "关系：全部",
    `难度：${formatDifficultyRange(filters.difficultyRange)}`,
    filters.keyword ? `关键词：${filters.keyword}` : "关键词：全部"
  ];

  return pieces.join(" · ");
}

export function createHeaderMarkup(state = {}, meta = {}) {
  const summary = state.summary || formatSummary(state);
  const stats = [
    meta.totalNodes ? `${meta.totalNodes} 个知识点` : "知识点待加载",
    meta.totalLinks ? `${meta.totalLinks} 条关系` : "关系待加载",
    meta.visibleNodes === 0 || meta.visibleNodes ? `当前显示 ${meta.visibleNodes} 个` : null
  ].filter(Boolean);

  return `
    <div class="app-header__brand">
      <p class="app-eyebrow">课程知识图谱</p>
      <h1>数据结构与算法交互分析</h1>
    </div>
    <div class="app-header__meta">
      <div class="summary-card">
        <span class="summary-card__label">当前筛选</span>
        <p class="summary-card__value">${escapeHtml(summary)}</p>
      </div>
      <ul class="summary-stats" aria-label="数据概览">
        ${stats.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="header-actions">
        <button type="button" class="action-button" data-action="reset-filters">重置筛选</button>
        <button type="button" class="action-button action-button--ghost" data-action="toggle-theme">
          主题切换
        </button>
      </div>
    </div>
  `;
}

export function renderHeader(container, state = {}, meta = {}) {
  if (!container) {
    return;
  }

  container.innerHTML = createHeaderMarkup(state, meta);
}
