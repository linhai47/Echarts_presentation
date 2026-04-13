import { describe, expect, it } from "vitest";
import { createBarOption } from "../src/charts/barChart.js";
import { createScatterOption } from "../src/charts/scatterChart.js";
import { createPieOption } from "../src/charts/pieChart.js";

describe("bottom chart titles", () => {
  it("会为分类柱状图提供标题并预留顶部空间", () => {
    const option = createBarOption({
      nodes: [
        { id: "n1", category: "线性结构" },
        { id: "n2", category: "图结构" }
      ],
      categoryOrder: ["线性结构", "图结构"]
    });

    expect(option.title?.text).toBe("模块分布");
    expect(option.title?.subtext).toContain("知识点数量");
    expect(option.grid?.top).toBeGreaterThanOrEqual(52);
  });

  it("会为难度散点图提供标题并预留顶部空间", () => {
    const option = createScatterOption({
      nodes: [
        { id: "n1", name: "数组基础", category: "线性结构", difficulty: 1, importance: 2 },
        { id: "n2", name: "图的遍历", category: "图结构", difficulty: 4, importance: 5 }
      ],
      links: [{ source: "n1", target: "n2", relation: "相关" }]
    });

    expect(option.title?.text).toBe("难度与连接度");
    expect(option.title?.subtext).toContain("气泡大小表示重要度");
    expect(option.grid?.top).toBeGreaterThanOrEqual(60);
  });

  it("会为关系饼图提供标题并把圆环下移以避开标题区", () => {
    const option = createPieOption({
      links: [
        { source: "n1", target: "n2", relation: "先修" },
        { source: "n2", target: "n3", relation: "相关" }
      ]
    });

    expect(option.title?.text).toBe("关系构成");
    expect(option.title?.subtext).toContain("边类型占比");
    expect(option.series?.[0]?.center?.[1]).toBe("62%");
  });
});
