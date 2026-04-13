import { CATEGORY_COLORS } from "../config.js";
import { buildCategoryBarData } from "../utils/chartData.js";
import { getChartThemeTokens } from "../utils/theme.js";

function resolveChartInstance(container) {
  if (!container || typeof window === "undefined" || !window.echarts) {
    return null;
  }

  return window.echarts.getInstanceByDom(container) || window.echarts.init(container);
}

function createChartTitle(tokens) {
  return {
    text: "模块分布",
    subtext: "当前范围内的知识点数量",
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

export function createBarOption({ nodes = [], categoryOrder = [], activeCategory = "", theme = "dark" }) {
  const tokens = getChartThemeTokens(theme);
  const data = buildCategoryBarData(nodes, { categoryOrder });

  return {
    backgroundColor: tokens.chartBackground,
    title: createChartTitle(tokens),
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      backgroundColor: tokens.tooltipBackground,
      borderColor: tokens.tooltipBorder,
      textStyle: {
        color: tokens.text
      },
      extraCssText: "border-radius: 12px; padding: 8px 10px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);",
      formatter(params) {
        const item = Array.isArray(params) ? params[0] : params;
        const category = item?.name || "";
        const value = item?.value ?? 0;
        const isActive = activeCategory && category === activeCategory ? "，当前筛选" : "";
        return `${category}：${value}${isActive}`;
      }
    },
    grid: {
      top: 64,
      right: 18,
      bottom: 24,
      left: 36,
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: data.categories,
      axisLabel: {
        color: tokens.textMuted
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: "value",
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
      }
    },
    series: [
      {
        type: "bar",
        data: data.seriesData.map((value, index) => ({
          value,
          itemStyle: {
            color: CATEGORY_COLORS[data.categories[index]] || tokens.accent,
            opacity: activeCategory && data.categories[index] !== activeCategory ? tokens.inactiveOpacity : 1,
            borderColor: activeCategory && data.categories[index] === activeCategory ? tokens.accentStrong : "transparent",
            borderWidth: activeCategory && data.categories[index] === activeCategory ? 2 : 0
          }
        })),
        barMaxWidth: 36,
        emphasis: {
          itemStyle: {
            opacity: 1
          }
        },
        itemStyle: {
          borderRadius: [6, 6, 0, 0]
        }
      }
    ]
  };
}

export function createBarChartController(container, handlers = {}) {
  const chart = resolveChartInstance(container);

  if (!chart) {
    return null;
  }

  const onCategoryClick = typeof handlers.onCategoryClick === "function" ? handlers.onCategoryClick : null;
  const handleClick = (params) => {
    if (!onCategoryClick || !params?.name) {
      return;
    }

    onCategoryClick(params.name);
  };

  chart.on("click", handleClick);

  return {
    update(optionPayload) {
      chart.setOption(createBarOption(optionPayload), true);
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
