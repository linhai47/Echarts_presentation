import { buildDifficultyScatterData } from "../utils/chartData.js";
import { getChartThemeTokens } from "../utils/theme.js";

function resolveChartInstance(container) {
  if (!container || typeof window === "undefined" || !window.echarts) {
    return null;
  }

  return window.echarts.getInstanceByDom(container) || window.echarts.init(container);
}

function createChartTitle(tokens) {
  return {
    text: "难度与连接度",
    subtext: "横轴表示难度，纵轴表示连接度，气泡大小表示重要度",
    left: 16,
    top: 10,
    textStyle: {
      color: tokens.text,
      fontSize: 15,
      fontWeight: 700
    },
    subtextStyle: {
      color: tokens.textMuted,
      fontSize: 11
    }
  };
}

export function createScatterOption({ nodes = [], links = [], focusNodeId = "", theme = "dark" }) {
  const tokens = getChartThemeTokens(theme);
  const data = buildDifficultyScatterData(nodes, links, { focusNodeId });

  return {
    backgroundColor: tokens.chartBackground,
    title: createChartTitle(tokens),
    tooltip: {
      trigger: "item",
      backgroundColor: tokens.tooltipBackground,
      borderColor: tokens.tooltipBorder,
      textStyle: {
        color: tokens.text
      },
      extraCssText: "border-radius: 12px; padding: 8px 10px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);",
      formatter(params) {
        const point = params?.data || {};
        return [
          point.name || "未命名知识点",
          `难度：${point.difficulty ?? "未设置"}`,
          `连接度：${point.degree ?? 0}`,
          `重要度：${point.importance ?? "未设置"}`
        ].join("<br/>");
      }
    },
    grid: {
      top: 64,
      right: 36,
      bottom: 24,
      left: 36,
      containLabel: true
    },
    xAxis: {
      type: "value",
      name: "难度",
      min: 1,
      max: 5,
      interval: 1,
      axisLabel: {
        color: tokens.textMuted
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: tokens.splitLine,
          type: "dashed"
        }
      },
      nameTextStyle: {
        color: tokens.textMuted
      }
    },
    yAxis: {
      type: "value",
      name: "连接度",
      minInterval: 1,
      axisLabel: {
        color: tokens.textMuted
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: tokens.splitLine,
          type: "dashed"
        }
      },
      nameTextStyle: {
        color: tokens.textMuted
      }
    },
    series: [
      {
        type: "scatter",
        data: data.points.map((point) => ({
          value: [point.difficulty, point.degree],
          id: point.id,
          name: point.name,
          category: point.category,
          difficulty: point.difficulty,
          degree: point.degree,
          importance: point.importance,
          symbolSize: focusNodeId && point.id === focusNodeId ? point.symbolSize + 8 : point.symbolSize,
          itemStyle: {
            color: tokens.categoryColors[point.category] || tokens.accent,
            opacity: focusNodeId && point.id !== focusNodeId ? tokens.inactiveOpacity : 0.75,
            borderColor: focusNodeId && point.id === focusNodeId ? tokens.text : tokens.categoryColors[point.category] || tokens.accent,
            borderWidth: focusNodeId && point.id === focusNodeId ? 3 : 1,
            shadowBlur: focusNodeId && point.id === focusNodeId ? 14 : 0,
            shadowColor: tokens.hoverShadow
          },
          label: {
            show: Boolean(focusNodeId && point.id === focusNodeId),
            color: tokens.text,
            fontWeight: 700,
            formatter: point.name
          }
        })),
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3
          }
        }
      }
    ]
  };
}

export function createScatterChartController(container, handlers = {}) {
  const chart = resolveChartInstance(container);

  if (!chart) {
    return null;
  }

  const onNodeClick = typeof handlers.onNodeClick === "function" ? handlers.onNodeClick : null;
  const handleClick = (params) => {
    if (!onNodeClick || !params?.data?.id) {
      return;
    }

    onNodeClick(params.data.id);
  };

  chart.on("click", handleClick);

  return {
    update(optionPayload) {
      chart.setOption(createScatterOption(optionPayload), true);
      chart.resize();
    },
    dispose() {
      chart.off("click", handleClick);
      chart.dispose();
    },
    resize() {
      chart.resize();
    },
    getInstance() {
      return chart;
    }
  };
}
