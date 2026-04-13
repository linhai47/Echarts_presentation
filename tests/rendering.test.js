import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHeaderMarkup } from "../src/panels/renderHeader.js";
import { createControlsMarkup } from "../src/panels/renderControls.js";
import { createDetailPanelMarkup } from "../src/panels/renderDetailPanel.js";

describe("rendering", () => {
  it("会输出头部标题和筛选摘要", () => {
    const markup = createHeaderMarkup(
      {
        filters: {
          category: "树结构",
          relation: "先修",
          difficultyRange: [2, 4],
          keyword: "树"
        },
        summary: "分类：树结构 · 关系：先修 · 难度：2-4 · 关键词：树"
      },
      {
        totalNodes: 42,
        totalLinks: 90,
        visibleNodes: 12
      }
    );

    expect(markup).toContain("数据结构与算法交互分析");
    expect(markup).toContain("当前筛选");
    expect(markup).toContain("42 个知识点");
    expect(markup).toContain("当前显示 12 个");
  });

  it("会输出筛选控件和显示模式入口", () => {
    const markup = createControlsMarkup(
      {
        filters: {
          category: "",
          relation: "",
          difficultyRange: [1, 5],
          keyword: ""
        },
        displayMode: "overview"
      },
      {
        categories: ["树结构", "图结构"],
        relations: ["先修", "相关"]
      }
    );

    expect(markup).toContain("搜索知识点");
    expect(markup).toContain("知识点分类");
    expect(markup).toContain("关系类型");
    expect(markup).toContain("最低难度");
    expect(markup).toContain("显示模式：概览模式");
  });

  it("会输出详情面板默认提示", () => {
    const markup = createDetailPanelMarkup({});

    expect(markup).toContain("请选择一个知识点查看局部分析");
    expect(markup).toContain("点击主图区节点");
  });

  it("会让知识点数据携带统一的难度字段", () => {
    const nodes = JSON.parse(readFileSync(new URL("../data/nodes.json", import.meta.url), "utf8"));

    expect(nodes.every((node) => Number.isInteger(node.difficulty) && node.difficulty >= 1 && node.difficulty <= 5)).toBe(true);
    expect(nodes.every((node) => Number.isInteger(node.importance) && node.importance >= 1 && node.importance <= 5)).toBe(true);
    expect(new Set(nodes.map((node) => node.difficulty)).size).toBeGreaterThan(1);
    expect(new Set(nodes.map((node) => node.importance)).size).toBeGreaterThan(1);
  });

  it("会把真实难度和关系统计渲染到详情面板", () => {
    const markup = createDetailPanelMarkup({
      focusNode: {
        id: "n20",
        name: "二分查找",
        category: "查找",
        summary: "掌握有序数组上的折半查找。",
        difficulty: 2,
        importance: 4,
        relationCount: 2,
        relations: [
          { relation: "先修", direction: "前置", name: "顺序查找", id: "n19" },
          { relation: "相关", direction: "后继", name: "哈希查找", id: "n21" }
        ]
      }
    });

    expect(markup).toContain("难度");
    expect(markup).toContain(">2<");
    expect(markup).toContain("重要度");
    expect(markup).toContain("4");
    expect(markup).toContain("顺序查找");
    expect(markup).toContain("哈希查找");
  });

  it("会输出前置、后继和结论分析", () => {
    const markup = createDetailPanelMarkup({
      focusNode: {
        id: "n30",
        name: "图的遍历",
        category: "图结构",
        summary: "掌握 BFS 和 DFS 的基本思路。",
        difficulty: 4,
        importance: 5,
        relationCount: 4,
        relations: [
          { relation: "先修", direction: "前置", name: "队列", id: "n10" },
          { relation: "先修", direction: "前置", name: "栈", id: "n11" },
          { relation: "相关", direction: "后继", name: "最短路径", id: "n31" }
        ]
      }
    });

    expect(markup).toContain("前置知识");
    expect(markup).toContain("后继知识");
    expect(markup).toContain("连接度");
    expect(markup).toContain("一句分析结论");
    expect(markup).toContain("该知识点");
  });

  it("会去除详情面板中的重复关系并把补充关系单独归类", () => {
    const markup = createDetailPanelMarkup({
      focusNode: {
        id: "n40",
        name: "队列",
        category: "线性结构",
        summary: "掌握先进先出的基本结构。",
        difficulty: 2,
        importance: 4,
        relationCount: 4,
        relations: [
          { relation: "先修", direction: "前置", name: "数组基础", id: "n01" },
          { relation: "先修", direction: "前置", name: "栈", id: "n02" },
          { relation: "相关", direction: "前置", name: "栈", id: "n02" },
          { relation: "先修", direction: "后继", name: "广度优先搜索", id: "n03" },
          { relation: "相关", direction: "后继", name: "双端队列", id: "n04" }
        ]
      }
    });

    expect(markup).toContain("前置知识");
    expect(markup).toContain("后继知识");
    expect(markup).toContain("关联知识");
    expect(markup).not.toContain("前置 ·");
    expect(markup).not.toContain("后继 ·");
    expect(markup).toContain("数组基础");
    expect(markup).toContain("广度优先搜索");
    expect(markup).toContain("双端队列");
    expect(markup.split("栈").length - 1).toBe(1);
  });
});
