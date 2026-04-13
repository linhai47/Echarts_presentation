import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getEmbedMode, getInitialDisplayMode } from "../src/utils/runtimeContext.js";

describe("presentation embed mode", () => {
  it("会识别 presentation 嵌入模式并默认启用紧凑显示", () => {
    expect(getEmbedMode("?embed=presentation")).toBe("presentation");
    expect(getInitialDisplayMode("presentation")).toBe("compact");
    expect(getInitialDisplayMode("")).toBe("overview");
  });

  it("会让演示页通过 embed 参数加载系统界面", () => {
    const html = readFileSync(new URL("../presentation.html", import.meta.url), "utf8");

    expect(html).toContain('src="./index.html?embed=presentation&v=20260413-presentation-embed"');
  });

  it("会提供 presentation 嵌入模式专用的布局收缩样式", () => {
    const css = readFileSync(new URL("../assets/styles.css", import.meta.url), "utf8");

    expect(css).toContain('body[data-embed="presentation"]');
    expect(css).toContain('body[data-embed="presentation"] #graph-chart');
    expect(css).toContain('body[data-embed="presentation"] #bar-chart');
  });
});
