import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const presentationHtml = readFileSync(new URL("../presentation.html", import.meta.url), "utf8");
const presentationCss = readFileSync(new URL("../assets/presentation.css", import.meta.url), "utf8");

describe("presentation Demo 主舞台强化", () => {
  it("会把第六屏改成带 stage 顶部信息和轻量 cue rail 的结构", () => {
    expect(presentationHtml).toContain('class="demo-stage__meta"');
    expect(presentationHtml).toContain("Live");
    expect(presentationHtml).toContain("Interactive");
    expect(presentationHtml).toContain("Linked Views");
    expect(presentationHtml).toContain('class="demo-cue"');
    expect(presentationHtml).not.toContain('class="demo-layout__notes"');
  });

  it("会为第六屏提供更像舞台的专用样式", () => {
    expect(presentationCss).toContain(".demo-stage");
    expect(presentationCss).toContain(".demo-stage__head");
    expect(presentationCss).toContain(".demo-cue");
    expect(presentationCss).toContain(".demo-layout__frame::after");
  });
});
