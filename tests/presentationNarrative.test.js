import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const presentationHtml = readFileSync(new URL("../presentation.html", import.meta.url), "utf8");
const presentationCss = readFileSync(new URL("../assets/presentation.css", import.meta.url), "utf8");

describe("presentation 演讲型重写", () => {
  it("会把工具对比页改成演讲式双栏而不是数据表格", () => {
    expect(presentationHtml).toContain("差别不在能不能画图");
    expect(presentationHtml).toContain("而在能不能让人探索");
    expect(presentationHtml).not.toContain("comparison-table__head");
    expect(presentationHtml).not.toContain("Matplotlib (静态绘图库)");
  });

  it("会把 Demo 页的观察重点压缩成三条核心动作", () => {
    expect(presentationHtml).toContain("点击节点：进入局部分析");
    expect(presentationHtml).toContain("点击辅图：反向驱动主图");
    expect(presentationHtml).toContain("颜色与大小：同时编码难度和重要度");
    expect(presentationHtml).not.toContain("点击柱状图：主图和其他辅图按模块筛选");
    expect(presentationHtml).not.toContain("深浅色切换：UI 与 ECharts 主题的无缝联动");
  });

  it("会把总结页收成单列结论并整体放大排版等级", () => {
    expect(presentationHtml).toContain('class="closing-grid');
    expect(presentationHtml).not.toContain("后续扩展方向");
    expect(presentationCss).toContain("--h2-size: 56px");
    expect(presentationCss).toContain("--p-size: 20px");
  });
});
