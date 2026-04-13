import { createStore } from "./state/store.js";
import { loadDashboardData } from "./data/loadData.js";
import { CATEGORY_ORDER, CATEGORY_COLORS, RELATION_TYPES } from "./config.js";
import { filterGraphData } from "./utils/filtering.js";
import { renderHeader } from "./panels/renderHeader.js";
import { renderControls } from "./panels/renderControls.js";
import { renderDetailPanel } from "./panels/renderDetailPanel.js";
import { createGraphChartController } from "./charts/graphChart.js";
import { createBarChartController } from "./charts/barChart.js";
import { createScatterChartController } from "./charts/scatterChart.js";
import { createPieChartController } from "./charts/pieChart.js";
import { buildFocusNodeDetailData } from "./utils/chartData.js";
import { getEmbedMode, getInitialDisplayMode } from "./utils/runtimeContext.js";

const runtimeEmbedMode = getEmbedMode(typeof window !== "undefined" ? window.location.search : "");

export const initialState = {
  filters: {
    category: "",
    relation: "",
    difficultyRange: [1, 5],
    keyword: ""
  },
  focusNodeId: "",
  theme: "dark",
  displayMode: getInitialDisplayMode(runtimeEmbedMode)
};

export const store = createStore(initialState);

console.log("ECharts dashboard bootstrap ready");

const dom = {
  header: document.querySelector(".app-header"),
  sidebar: document.querySelector(".app-sidebar"),
  graph: document.querySelector("#graph-chart"),
  detail: document.querySelector("#detail-panel"),
  bottom: {
    bar: document.querySelector("#bar-chart"),
    scatter: document.querySelector("#scatter-chart"),
    pie: document.querySelector("#pie-chart")
  }
};

const runtime = {
  data: {
    nodes: [],
    links: []
  },
  graphChart: null,
  barChart: null,
  scatterChart: null,
  pieChart: null
};

function hasMountedChart(container) {
  if (!container) {
    return true;
  }

  return container.dataset.chartMounted === "true" || Boolean(container.querySelector("canvas, svg, .echarts"));
}

function clampDifficulty(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(1, Math.min(5, number));
}

function formatDifficultyRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return "1-5";
  }

  const [min, max] = range;
  return `${min}-${max}`;
}

function createSummaryText(state) {
  const filters = state.filters || {};

  return [
    filters.category ? `分类：${filters.category}` : "分类：全部",
    filters.relation ? `关系：${filters.relation}` : "关系：全部",
    `难度：${formatDifficultyRange(filters.difficultyRange)}`,
    filters.keyword ? `关键词：${filters.keyword}` : "关键词：全部"
  ].join(" · ");
}

function buildCategoryMap(nodes) {
  const categoryMap = new Map();

  CATEGORY_ORDER.forEach((category) => {
    categoryMap.set(category, CATEGORY_COLORS[category] || null);
  });

  nodes.forEach((node) => {
    if (!node?.category || categoryMap.has(node.category)) {
      return;
    }

    categoryMap.set(node.category, CATEGORY_COLORS[node.category] || null);
  });

  return categoryMap;
}

function ensureAuxCharts() {
  if (dom.bottom.bar && !runtime.barChart) {
    runtime.barChart = createBarChartController(dom.bottom.bar, {
      onCategoryClick: (category) => {
        const state = store.getState();
        const nextCategory = state.filters.category === category ? "" : category;
        store.setState({
          filters: {
            category: nextCategory
          }
        });
      }
    });
  }

  if (dom.bottom.scatter && !runtime.scatterChart) {
    runtime.scatterChart = createScatterChartController(dom.bottom.scatter, {
      onNodeClick: (nodeId) => {
        const state = store.getState();
        const nextFocusNodeId = state.focusNodeId === nodeId ? "" : nodeId;
        store.setState({ focusNodeId: nextFocusNodeId });
      }
    });
  }

  if (dom.bottom.pie && !runtime.pieChart) {
    runtime.pieChart = createPieChartController(dom.bottom.pie, {
      onRelationClick: (relation) => {
        const state = store.getState();
        const nextRelation = state.filters.relation === relation ? "" : relation;
        store.setState({
          filters: {
            relation: nextRelation
          }
        });
      }
    });
  }

  return {
    barChart: runtime.barChart,
    scatterChart: runtime.scatterChart,
    pieChart: runtime.pieChart
  };
}

function ensureGraphChart() {
  if (!dom.graph || runtime.graphChart) {
    return runtime.graphChart;
  }

  runtime.graphChart = createGraphChartController(dom.graph, {
    onNodeClick: (nodeId) => {
      if (nodeId) {
        store.setState({ focusNodeId: nodeId });
      }
    },
    onBlankClick: () => {
      if (store.getState().focusNodeId) {
        store.setState({ focusNodeId: "" });
      }
    }
  });

  return runtime.graphChart;
}

function renderGraphChart(state, filtered) {
  const chart = ensureGraphChart();
  if (!chart) {
    return;
  }

  chart.update({
    nodes: filtered.nodes,
    links: filtered.links,
    categoryMap: buildCategoryMap(filtered.nodes),
    difficultyRange: state.filters?.difficultyRange || [1, 5],
    focusNodeId: state.focusNodeId || "",
    theme: state.theme || "dark",
    displayMode: state.displayMode || "overview"
  });
}

function renderAuxCharts(state, filtered) {
  const charts = ensureAuxCharts();
  if (charts.barChart) {
    charts.barChart.update({
      nodes: filtered.nodes,
      categoryOrder: CATEGORY_ORDER,
      activeCategory: state.filters?.category || "",
      theme: state.theme || "dark"
    });
  }

  if (charts.scatterChart) {
    charts.scatterChart.update({
      nodes: filtered.nodes,
      links: filtered.links,
      focusNodeId: state.focusNodeId || "",
      theme: state.theme || "dark"
    });
  }

  if (charts.pieChart) {
    charts.pieChart.update({
      links: filtered.links,
      activeRelation: state.filters?.relation || "",
      theme: state.theme || "dark"
    });
  }
}

function renderApp() {
  const state = store.getState();
  const filtered = filterGraphData(runtime.data.nodes, runtime.data.links, state.filters);
  const summary = createSummaryText(state);
  const visibleNodeCount = filtered.nodes.length;
  const visibleLinkCount = filtered.links.length;
  const focusNode = resolveFocusNode(state.focusNodeId, filtered.nodes, filtered.links);

  if (state.focusNodeId && !focusNode) {
    store.setState({ focusNodeId: "" });
    return;
  }

  document.body.dataset.theme = state.theme;
  document.body.dataset.displayMode = state.displayMode;
  document.body.dataset.embed = runtimeEmbedMode || "default";

  renderHeader(dom.header, { ...state, summary }, {
    subtitle: "主图、分类柱状图、难度散点图和关系饼图已完成主题联动与筛选联动。",
    totalNodes: runtime.data.nodes.length || null,
    totalLinks: runtime.data.links.length || null,
    visibleNodes: visibleNodeCount
  });

  renderControls(dom.sidebar, state, {
    categories: CATEGORY_ORDER,
    relations: RELATION_TYPES
  });

  renderDetailPanel(dom.detail, { ...state, focusNode });
  renderGraphChart(state, filtered);
  renderAuxCharts(state, filtered);

  if (dom.header) {
    dom.header.setAttribute("data-summary", summary);
  }
  if (dom.detail) {
    dom.detail.setAttribute("aria-live", "polite");
  }

  return { filtered, summary, visibleNodeCount, visibleLinkCount };
}

function resolveFocusNode(focusNodeId, nodes, links) {
  return buildFocusNodeDetailData(nodes, links, focusNodeId);
}

function resetFilters() {
  store.setState({
    filters: {
      category: "",
      relation: "",
      difficultyRange: [1, 5],
      keyword: ""
    },
    focusNodeId: ""
  });
}

function toggleTheme() {
  const state = store.getState();
  store.setState({
    theme: state.theme === "dark" ? "light" : "dark"
  });
}

function toggleDisplayMode() {
  const state = store.getState();
  store.setState({
    displayMode: state.displayMode === "compact" ? "overview" : "compact"
  });
}

function updateFilter(field, value) {
  const state = store.getState();
  const nextFilters = { ...state.filters };

  if (field === "category" || field === "relation" || field === "keyword") {
    nextFilters[field] = value;
  }

  if (field === "difficultyMin" || field === "difficultyMax") {
    const currentRange = Array.isArray(nextFilters.difficultyRange)
      ? [...nextFilters.difficultyRange]
      : [1, 5];
    const min = clampDifficulty(field === "difficultyMin" ? value : currentRange[0], 1);
    const max = clampDifficulty(field === "difficultyMax" ? value : currentRange[1], 5);
    nextFilters.difficultyRange = min <= max ? [min, max] : [max, min];
  }

  store.setState({ filters: nextFilters });
}

function bindHeaderEvents() {
  if (!dom.header) {
    return;
  }

  dom.header.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    if (action === "reset-filters") {
      resetFilters();
    }
    if (action === "toggle-theme") {
      toggleTheme();
    }
  });
}

function bindSidebarEvents() {
  if (!dom.sidebar) {
    return;
  }

  dom.sidebar.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    if (button.dataset.action === "toggle-display-mode") {
      toggleDisplayMode();
    }
  });

  dom.sidebar.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.dataset.field) {
      updateFilter(target.dataset.field, target.value);
    }
  });

  dom.sidebar.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.dataset.field) {
      updateFilter(target.dataset.field, target.value);
    }
  });
}

async function bootstrap() {
  bindHeaderEvents();
  bindSidebarEvents();
  store.subscribe(renderApp);
  window.addEventListener("resize", () => {
    runtime.graphChart?.getInstance()?.resize();
    runtime.barChart?.resize();
    runtime.scatterChart?.resize();
    runtime.pieChart?.resize();
  });

  renderApp();

  try {
    runtime.data = await loadDashboardData();
  } catch (error) {
    console.error("课程数据加载失败", error);
    runtime.data = { nodes: [], links: [] };
  }

  renderApp();
}

bootstrap();
