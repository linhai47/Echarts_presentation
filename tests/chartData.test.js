import { describe, expect, it } from "vitest";
import {
  buildCategoryBarData,
  buildFocusNodeDetailData,
  buildDifficultyScatterData,
  buildRelationPieData
} from "../src/utils/chartData.js";

describe("chartData", () => {
  it("会按固定分类顺序统计柱状图数据", () => {
    const result = buildCategoryBarData([
      { id: "a", category: "树结构" },
      { id: "b", category: "树结构" },
      { id: "c", category: "图结构" },
      { id: "d", category: "自定义分类" }
    ]);

    expect(result.categories.slice(0, 3)).toEqual(["线性结构", "树结构", "图结构"]);
    expect(result.categories).toContain("自定义分类");
    expect(result.seriesData[result.categories.indexOf("树结构")]).toBe(2);
    expect(result.seriesData[result.categories.indexOf("图结构")]).toBe(1);
    expect(result.seriesData[result.categories.indexOf("自定义分类")]).toBe(1);
  });

  it("会计算散点图所需的 difficulty、degree 和点大小", () => {
    const result = buildDifficultyScatterData(
      [
        { id: "a", name: "节点A", difficulty: 2, importance: 5 },
        { id: "b", name: "节点B", difficulty: 4, importance: 1 }
      ],
      [
        { source: "a", target: "b", relation: "先修" },
        { source: "b", target: "a", relation: "相关" }
      ]
    );

    expect(result.total).toBe(2);
    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toMatchObject({
      id: "a",
      difficulty: 2,
      degree: 1,
      importance: 5
    });
    expect(result.points[0].symbolSize).toBeGreaterThan(result.points[1].symbolSize);
  });

  it("会按关系类型统计饼图数据", () => {
    const result = buildRelationPieData([
      { source: "a", target: "b", relation: "先修" },
      { source: "b", target: "c", relation: "先修" },
      { source: "c", target: "d", relation: "相关" },
      { source: "d", target: "e", relation: "自定义" }
    ]);

    const names = result.seriesData.map((item) => item.name);
    expect(names.slice(0, 4)).toEqual(["先修", "包含", "应用到", "相关"]);
    expect(result.seriesData.find((item) => item.name === "先修")?.value).toBe(2);
    expect(result.seriesData.find((item) => item.name === "相关")?.value).toBe(1);
    expect(result.seriesData.find((item) => item.name === "自定义")?.value).toBe(1);
  });

  it("会按去重后的邻居数计算聚焦节点连接度", () => {
    const result = buildFocusNodeDetailData(
      [
        { id: "a", name: "节点A", category: "树结构", difficulty: 2, importance: 4 },
        { id: "b", name: "节点B", category: "图结构", difficulty: 3, importance: 2 },
        { id: "c", name: "节点C", category: "查找", difficulty: 4, importance: 1 }
      ],
      [
        { source: "a", target: "b", relation: "先修" },
        { source: "a", target: "b", relation: "相关" },
        { source: "c", target: "a", relation: "包含" },
        { source: "b", target: "a", relation: "相关" }
      ],
      "a"
    );

    expect(result?.relationCount).toBe(2);
    expect(result?.relationLinkCount).toBe(4);
    expect(result?.relations).toHaveLength(4);
  });
});
