function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return [1, 5];
  }

  const [rawMin, rawMax] = range;
  const min = Number.isFinite(Number(rawMin)) ? Number(rawMin) : 1;
  const max = Number.isFinite(Number(rawMax)) ? Number(rawMax) : 5;

  return [Math.max(1, Math.min(min, 5)), Math.max(1, Math.min(max, 5))];
}

function createOptionsMarkup(items, selectedValue, placeholder) {
  const safePlaceholder = escapeHtml(placeholder);
  const selected = selectedValue ?? "";

  return `
    <option value="">${safePlaceholder}</option>
    ${items
      .map(
        (item) => `
          <option value="${escapeHtml(item)}" ${item === selected ? "selected" : ""}>
            ${escapeHtml(item)}
          </option>
        `
      )
      .join("")}
  `;
}

function getDisplayModeLabel(displayMode) {
  return displayMode === "compact" ? "紧凑模式" : "概览模式";
}

export function createControlsMarkup(state = {}, options = {}) {
  const filters = state.filters || {};
  const categories = options.categories || [];
  const relations = options.relations || [];
  const [minDifficulty, maxDifficulty] = normalizeRange(filters.difficultyRange);

  return `
    <div class="panel-section__head">
      <p class="app-eyebrow">侧栏控制</p>
      <h2>筛选与显示</h2>
    </div>

    <label class="control-field">
      <span class="control-field__label">搜索知识点</span>
      <input
        type="search"
        class="control-input"
        data-field="keyword"
        value="${escapeHtml(filters.keyword || "")}"
        placeholder="输入名称、摘要或关键词"
      />
    </label>

    <label class="control-field">
      <span class="control-field__label">知识点分类</span>
      <select class="control-select" data-field="category">
        ${createOptionsMarkup(categories, filters.category || "", "全部分类")}
      </select>
    </label>

    <label class="control-field">
      <span class="control-field__label">关系类型</span>
      <select class="control-select" data-field="relation">
        ${createOptionsMarkup(relations, filters.relation || "", "全部关系")}
      </select>
    </label>

    <div class="control-grid control-grid--range">
      <label class="control-field">
        <span class="control-field__label">最低难度</span>
        <input
          type="number"
          class="control-input"
          data-field="difficultyMin"
          min="1"
          max="5"
          step="1"
          value="${minDifficulty}"
        />
      </label>
      <label class="control-field">
        <span class="control-field__label">最高难度</span>
        <input
          type="number"
          class="control-input"
          data-field="difficultyMax"
          min="1"
          max="5"
          step="1"
          value="${maxDifficulty}"
        />
      </label>
    </div>

    <button type="button" class="display-mode-button" data-action="toggle-display-mode">
      显示模式：${getDisplayModeLabel(state.displayMode)}
    </button>
  `;
}

export function renderControls(container, state = {}, options = {}) {
  if (!container) {
    return;
  }

  container.innerHTML = createControlsMarkup(state, options);
}
