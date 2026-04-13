import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const presentationHtml = readFileSync(new URL("../presentation.html", import.meta.url), "utf8");
const presentationCss = readFileSync(new URL("../assets/presentation.css", import.meta.url), "utf8");

describe("presentation 封面高级化", () => {
  it("会把封面改成左文右图并移除旧的标签列表", () => {
    expect(presentationHtml).toContain('class="cover__kicker"');
    expect(presentationHtml).toContain('class="cover__visual"');
    expect(presentationHtml).toContain('class="cover-orbit"');
    expect(presentationHtml).not.toContain('class="tag-list"');
  });

  it("会提供精简的 meta 条和封面专用信号样式", () => {
    expect(presentationHtml).toContain('class="cover__meta-strip"');
    expect(presentationHtml).toContain("核心信号");
    expect(presentationCss).toContain(".slide--cover");
    expect(presentationCss).toContain(".cover__visual");
    expect(presentationCss).toContain(".cover-orbit__ring--outer");
    expect(presentationCss).toContain(".cover__meta-strip");
  });
});
