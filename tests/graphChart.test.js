import { describe, expect, it } from "vitest";
import { createGraphOption } from "../src/charts/graphChart.js";

describe("createGraphOption", () => {
  it("会把难度、重要度和关系类型编码进图表 option", () => {
    const option = createGraphOption({
      nodes: [
        {
          id: "n1",
          name: "数组基础",
          category: "线性结构",
          difficulty: 1,
          importance: 5
        },
        {
          id: "n2",
          name: "链表基础",
          category: "线性结构",
          difficulty: 4,
          importance: 1
        }
      ],
      links: [
        {
          source: "n1",
          target: "n2",
          relation: "先修"
        }
      ],
      categoryMap: new Map([["线性结构", "#6ed0ff"]]),
      difficultyRange: [1, 5],
      focusNodeId: "n1",
      theme: "light"
    });

    expect(option.series[0].type).toBe("graph");
    expect(option.visualMap[0].min).toBe(1);
    expect(option.visualMap[0].max).toBe(5);
    expect(option.backgroundColor).toBeDefined();
    expect(option.tooltip.backgroundColor).toBeDefined();
    expect(option.series[0].data[0].itemStyle.borderWidth).toBe(4);
    expect(option.series[0].data[1].itemStyle.opacity).toBeLessThan(1);
    expect(option.series[0].data[0].value).toBe(1);
    expect(option.series[0].data[0].symbolSize).toBeGreaterThan(option.series[0].data[1].symbolSize);
    expect(option.series[0].data[0].itemStyle.color).toBeUndefined();
    expect(option.series[0].data[0].itemStyle.borderColor).toBeDefined();
    expect(option.series[0].links[0].lineStyle.color).toBeDefined();
  });

  it("会在 tooltip 里保留分类信息而不干扰 visualMap", () => {
    const option = createGraphOption({
      nodes: [
        {
          id: "n1",
          name: "数组基础",
          category: "线性结构",
          difficulty: 3,
          importance: 3
        }
      ],
      links: [],
      categoryMap: new Map([["线性结构", "#6ed0ff"]]),
      difficultyRange: [1, 5]
    });

    const tooltip = option.tooltip.formatter({
      dataType: "node",
      data: {
        name: "数组基础",
        category: "线性结构",
        value: 3,
        importance: 3
      }
    });

    expect(tooltip).toContain("分类：线性结构");
    expect(tooltip).toContain("难度：3");
  });

  it("会在紧凑模式下收紧主图标签密度和力导向参数", () => {
    const option = createGraphOption({
      nodes: [
        {
          id: "n1",
          name: "数组基础",
          category: "线性结构",
          difficulty: 3,
          importance: 3
        },
        {
          id: "n2",
          name: "链表基础",
          category: "线性结构",
          difficulty: 4,
          importance: 4
        }
      ],
      links: [
        {
          source: "n1",
          target: "n2",
          relation: "相关"
        }
      ],
      categoryMap: new Map([["线性结构", "#6ed0ff"]]),
      difficultyRange: [1, 5],
      focusNodeId: "n1",
      displayMode: "compact"
    });

    expect(option.series[0].label.show).toBe(false);
    expect(option.series[0].data[0].label.show).toBe(true);
    expect(option.series[0].data[1].label.show).toBe(false);
    expect(option.series[0].force.repulsion).toBe(180);
    expect(option.series[0].force.edgeLength).toEqual([48, 96]);
  });
});
