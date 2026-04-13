import { RELATION_COLORS } from "../config.js";
import { getChartThemeTokens } from "../utils/theme.js";

function clampRange(range) {
  if (!Array.isArray(range) || range.length < 2) {
    return [1, 5];
  }

  const min = Number(range[0]);
  const max = Number(range[1]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [1, 5];
  }

  return min <= max ? [min, max] : [max, min];
}

function getNodeSize(importance) {
  const level = Number.isFinite(Number(importance)) ? Number(importance) : 3;
  return 18 + Math.max(1, Math.min(5, level)) * 4;
}

function getRelationColor(relation) {
  return RELATION_COLORS[relation] || "#6f87b5";
}

function normalizeCategoryMap(categoryMap) {
  if (categoryMap instanceof Map) {
    return Array.from(categoryMap.keys()).map((name) => ({
      name
    }));
  }

  if (Array.isArray(categoryMap)) {
    return categoryMap.map((item) =>
      typeof item === "string"
        ? { name: item }
        : item
    );
  }

  if (categoryMap && typeof categoryMap === "object") {
    return Object.keys(categoryMap).map((name) => ({
      name
    }));
  }

  return [];
}

function resolveChartInstance(container) {
  if (!container || typeof window === "undefined" || !window.echarts) {
    return null;
  }

  return window.echarts.getInstanceByDom(container) || window.echarts.init(container);
}

export function createGraphOption({
  nodes = [],
  links = [],
  categoryMap = [],
  difficultyRange = [1, 5],
  focusNodeId = "",
  theme = "dark",
  displayMode = "overview"
}) {
  const [minDifficulty, maxDifficulty] = clampRange(difficultyRange);
  const categories = normalizeCategoryMap(categoryMap);
  const tokens = getChartThemeTokens(theme);
  const isCompact = displayMode === "compact";

  return {
    backgroundColor: tokens.chartBackground,
    tooltip: {
      trigger: "item",
      backgroundColor: tokens.tooltipBackground,
      borderColor: tokens.tooltipBorder,
      textStyle: {
        color: tokens.text
      },
      extraCssText: "border-radius: 12px; padding: 8px 10px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);",
      formatter(params) {
        if (params?.dataType !== "node") {
          return "";
        }

        const category = params?.data?.category || "未设置";
        const difficulty = params?.data?.value ?? "未设置";
        const importance = params?.data?.importance ?? "未设置";

        return [
          params?.data?.name || "未命名知识点",
          `分类：${category}`,
          `难度：${difficulty}`,
          `重要度：${importance}`
        ].join("<br/>");
      }
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        restore: {}
      }
    },
    visualMap: [
      {
        type: "continuous",
        min: minDifficulty,
        max: maxDifficulty,
        dimension: 0,
        calculable: true,
        inRange: {
          color: tokens.difficultyColors
        }
      }
    ],
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        draggable: true,
        categories,
        data: nodes.map((node) => {
          const difficulty = Number.isFinite(Number(node.difficulty)) ? Number(node.difficulty) : 3;
          const importance = Number.isFinite(Number(node.importance)) ? Number(node.importance) : difficulty;
          const isFocused = Boolean(focusNodeId && node.id === focusNodeId);
          const isDimmed = Boolean(focusNodeId && !isFocused);

          return {
            ...node,
            value: difficulty,
            category: node.category || "",
            symbolSize: getNodeSize(importance),
            itemStyle: {
              borderColor: isFocused ? tokens.accentStrong : tokens.border,
              borderWidth: isFocused ? 4 : 2,
              opacity: isDimmed ? tokens.inactiveOpacity : 1,
              shadowBlur: isFocused ? 18 : 0,
              shadowColor: tokens.hoverShadow
            },
            label: {
              show: !isCompact || isFocused,
              color: tokens.text,
              opacity: isDimmed ? 0.78 : 1
            }
          };
        }),
        links: links.map((link) => {
          const isFocusEdge = Boolean(focusNodeId && (link.source === focusNodeId || link.target === focusNodeId));
          const isDimmed = Boolean(focusNodeId && !isFocusEdge);

          return {
            ...link,
            lineStyle: {
              color: getRelationColor(link.relation),
              width: isFocusEdge ? 3 : 2,
              opacity: isDimmed ? 0.18 : 1
            }
          };
        }),
        force: {
          repulsion: isCompact ? 180 : 220,
          edgeLength: isCompact ? [48, 96] : [60, 120]
        },
        label: {
          show: !isCompact,
          position: "right",
          color: tokens.text
        },
        lineStyle: {
          curveness: 0.1
        },
        emphasis: {
          focus: "adjacency",
          itemStyle: {
            borderWidth: 4
          },
          lineStyle: {
            width: 3
          }
        },
        blur: {
          itemStyle: {
            opacity: tokens.inactiveOpacity
          },
          lineStyle: {
            opacity: 0.12
          }
        }
      }
    ]
  };
}

export function createGraphChartController(container, handlers = {}) {
  const chart = resolveChartInstance(container);

  if (!chart) {
    return null;
  }

  const onNodeClick = typeof handlers.onNodeClick === "function" ? handlers.onNodeClick : null;
  const onBlankClick = typeof handlers.onBlankClick === "function" ? handlers.onBlankClick : null;
  const handleNodeClick = (params) => {
    if (params?.dataType === "node" && onNodeClick) {
      onNodeClick(params.data?.id || params.data?.name || "");
    }
  };
  const handleBlankClick = (event) => {
    if (!event?.target && onBlankClick) {
      onBlankClick();
    }
  };

  chart.on("click", handleNodeClick);
  chart.getZr().on("click", handleBlankClick);

  return {
    update(optionPayload) {
      chart.setOption(createGraphOption(optionPayload), true);
      chart.resize();
    },
    dispose() {
      chart.off("click", handleNodeClick);
      chart.getZr().off("click", handleBlankClick);
      chart.dispose();
    },
    getInstance() {
      return chart;
    }
  };
}
