import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const presentationHtml = readFileSync(new URL("../presentation.html", import.meta.url), "utf8");
const presentationCss = readFileSync(new URL("../assets/presentation.css", import.meta.url), "utf8");

describe("presentation 动效节奏", () => {
  it("会提供进度条和方向感脚本状态", () => {
    expect(presentationHtml).toContain('class="presentation-progress"');
    expect(presentationHtml).toContain('id="progress-bar"');
    expect(presentationHtml).toContain("container.dataset.direction");
    expect(presentationHtml).toContain("progressBar.style.width");
  });

  it("会为幻灯片和关键内容提供克制的过渡动画", () => {
    expect(presentationCss).toContain("--ease-out");
    expect(presentationCss).toContain(".presentation-container[data-direction=\"next\"] .slide");
    expect(presentationCss).toContain(".presentation-container[data-direction=\"prev\"] .slide");
    expect(presentationCss).toContain(".slide.active .slide__inner > *");
    expect(presentationCss).toContain(".presentation-progress__bar");
  });

  it("会为减少动态偏好提供无动画兜底", () => {
    expect(presentationCss).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
