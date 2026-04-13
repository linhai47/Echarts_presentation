import { RELATION_COLORS } from "../config.js";
import { buildRelationPieData } from "../utils/chartData.js";
import { getChartThemeTokens } from "../utils/theme.js";

function resolveChartInstance(container) {
  if (!container || typeof window === "undefined" || !window.echarts) {
    return null;
  }

  return window.echarts.getInstanceByDom(container) || window.echarts.init(container);
}

function createChartTitle(tokens) {
  return {
    text: "关系构成",
    subtext: "当前范围内的边类型占比",
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

export function createPieOption({ links = [], activeRelation = "", theme = "dark" }) {
  const tokens = getChartThemeTokens(theme);
  const data = buildRelationPieData(links);
  const seriesData = data.seriesData.filter((item) => item.value > 0);

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
        const name = params?.name || "";
        const value = params?.value ?? 0;
        const suffix = activeRelation && name === activeRelation ? "，当前筛选" : "";
        return `${name}：${value}${suffix}`;
      }
    },
    series: [
      {
        type: "pie",
        radius: ["38%", "72%"],
        center: ["50%", "62%"],
        avoidLabelOverlap: true,
        selectedMode: "single",
        data: seriesData.map((item) => ({
          ...item,
          itemStyle: {
            color: RELATION_COLORS[item.name] || tokens.accent,
            opacity: activeRelation && item.name !== activeRelation ? tokens.inactiveOpacity : 1,
            borderColor: activeRelation && item.name === activeRelation ? tokens.accentStrong : tokens.border,
            borderWidth: activeRelation && item.name === activeRelation ? 2 : 1
          },
          selected: Boolean(activeRelation && item.name === activeRelation),
          selectedOffset: 12
        })),
        label: {
          color: tokens.text,
          formatter: "{b}\n{d}%"
        },
        labelLine: {
          lineStyle: {
            color: tokens.axisLine
          }
        },
        emphasis: {
          scale: true,
          itemStyle: {
            shadowBlur: 12,
            shadowColor: tokens.hoverShadow
          }
        }
      }
    ]
  };
}

export function createPieChartController(container, handlers = {}) {
  const chart = resolveChartInstance(container);

  if (!chart) {
    return null;
  }

  const onRelationClick = typeof handlers.onRelationClick === "function" ? handlers.onRelationClick : null;
  const handleClick = (params) => {
    if (!onRelationClick || !params?.name) {
      return;
    }

    onRelationClick(params.name);
  };

  chart.on("click", handleClick);

  return {
    update(optionPayload) {
      chart.setOption(createPieOption(optionPayload), true);
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
