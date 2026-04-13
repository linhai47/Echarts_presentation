import { describe, expect, it } from "vitest";
import { filterGraphData } from "../src/utils/filtering.js";
import { createStore } from "../src/state/store.js";

describe("filterGraphData", () => {
  it("会按模块和关系类型过滤图数据并收缩到边端点", () => {
    const result = filterGraphData(
      [
        { id: "a", category: "树结构" },
        { id: "b", category: "树结构" },
        { id: "c", category: "树结构" }
      ],
      [
        { source: "a", target: "b", relation: "先修" },
        { source: "b", target: "c", relation: "相关" }
      ],
      { category: "树结构", relation: "先修" }
    );

    expect(result.nodes.map((node) => node.id)).toEqual(["a", "b"]);
    expect(result.links).toEqual([{ source: "a", target: "b", relation: "先修" }]);
  });

  it("会在没有匹配关系边时返回空节点集合", () => {
    const result = filterGraphData(
      [
        { id: "a", category: "树结构" },
        { id: "b", category: "树结构" }
      ],
      [{ source: "a", target: "b", relation: "相关" }],
      { category: "树结构", relation: "先修" }
    );

    expect(result.nodes).toHaveLength(0);
    expect(result.links).toHaveLength(0);
  });

  it("会按关键词过滤节点并同步剔除无关边", () => {
    const result = filterGraphData(
      [
        { id: "a", category: "树结构", name: "二叉树" },
        { id: "b", category: "树结构", name: "链表" },
        { id: "c", category: "图结构", name: "图遍历" }
      ],
      [
        { source: "a", target: "b", relation: "相关" },
        { source: "a", target: "c", relation: "相关" }
      ],
      { keyword: "树", category: "", relation: "" }
    );

    expect(result.nodes.map((node) => node.id)).toEqual(["a"]);
    expect(result.links).toHaveLength(0);
  });

  it("会匹配 summary 字段参与关键词过滤", () => {
    const result = filterGraphData(
      [
        { id: "a", category: "树结构", name: "节点一", summary: "二叉树的基本概念" },
        { id: "b", category: "树结构", name: "节点二", summary: "图的遍历" }
      ],
      [{ source: "a", target: "b", relation: "相关" }],
      { keyword: "二叉树", category: "", relation: "" }
    );

    expect(result.nodes.map((node) => node.id)).toEqual(["a"]);
    expect(result.links).toHaveLength(0);
  });

  it("会按难度范围过滤节点", () => {
    const result = filterGraphData(
      [
        { id: "a", category: "树结构", difficulty: 1 },
        { id: "b", category: "树结构", difficulty: 3 },
        { id: "c", category: "树结构", difficulty: 5 }
      ],
      [{ source: "a", target: "b", relation: "相关" }],
      { difficultyRange: [2, 4], category: "", relation: "", keyword: "" }
    );

    expect(result.nodes.map((node) => node.id)).toEqual(["b"]);
    expect(result.links).toHaveLength(0);
  });
});

describe("createStore", () => {
  it("会浅合并 filters 且返回状态快照", () => {
    const store = createStore({
      filters: {
        category: "",
        relation: "",
        difficultyRange: [1, 5],
        keyword: ""
      },
      focusNodeId: "",
      theme: "dark"
    });

    store.setState({ filters: { category: "树结构" } });

    const state = store.getState();
    expect(state.filters).toEqual({
      category: "树结构",
      relation: "",
      difficultyRange: [1, 5],
      keyword: ""
    });

    state.filters.category = "图结构";
    expect(store.getState().filters.category).toBe("树结构");
  });
});
