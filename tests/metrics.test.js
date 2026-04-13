import { afterEach, describe, expect, it, vi } from "vitest";
import { loadDashboardData } from "../src/data/loadData.js";
import { buildGraphMetrics } from "../src/utils/metrics.js";

describe("buildGraphMetrics", () => {
  it("能计算节点度数和关系统计", () => {
    const result = buildGraphMetrics(
      [{ id: "a" }, { id: "b" }],
      [{ source: "a", target: "b", relation: "先修" }]
    );

    expect(result.nodeMap.get("a").outDegree).toBe(1);
    expect(result.nodeMap.get("b").inDegree).toBe(1);
    expect(result.nodeMap.get("a").degree).toBe(1);
    expect(result.nodeMap.get("b").degree).toBe(1);
  });

  it("多条关系边不会重复放大 degree", () => {
    const result = buildGraphMetrics(
      [{ id: "a" }, { id: "b" }, { id: "c" }],
      [
        { source: "a", target: "b", relation: "先修" },
        { source: "a", target: "b", relation: "相关" },
        { source: "a", target: "c", relation: "包含" }
      ]
    );

    expect(result.nodeMap.get("a").outDegree).toBe(3);
    expect(result.nodeMap.get("b").inDegree).toBe(2);
    expect(result.nodeMap.get("a").degree).toBe(2);
    expect(result.nodeMap.get("b").degree).toBe(1);
    expect(result.nodeMap.get("c").degree).toBe(1);
  });
});

describe("loadDashboardData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("在资源加载失败时抛出清晰错误", async () => {
    const nodesRes = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: vi.fn()
    };
    const linksRes = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue([])
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(nodesRes).mockResolvedValueOnce(linksRes)
    );

    await expect(loadDashboardData()).rejects.toThrow("nodes.json 加载失败");
  });
});
