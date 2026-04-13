# ECharts Presentation

一个基于 **Apache ECharts** 的课程汇报型可视化项目，包含两部分：

- `index.html`：知识关系交互分析看板
- `presentation.html`：PPT 风格的演示页面

项目以“数据结构与算法知识关系”为主题载体，重点展示 ECharts 在 **关系图表达、视觉映射、多图联动、动态更新、主题切换** 等方面的能力，而不是实现一个完整的知识图谱后端系统。

## 项目亮点

- `Graph` 主视图：使用关系网络展示知识点之间的前置、包含和关联关系
- 多图联动：主图、柱状图、散点图、饼图围绕统一状态联动更新
- 可视化编码：节点颜色表示难度，节点大小表示重要度
- 交互式演示：支持点击聚焦、模块筛选、关系筛选、主题切换、显示模式切换
- 演讲页包装：提供独立的 `presentation.html`，适合课堂汇报和答辩展示
- 纯前端运行：使用本地 JSON 数据，无需后端即可完整演示

## 页面说明

### 1. 交互分析看板

入口：`index.html`

主要区域：

- 顶部头部区：项目标题、筛选摘要、数据概览、主题切换、重置筛选
- 左侧控制区：关键词搜索、分类筛选、关系筛选、难度筛选、显示模式切换
- 中部主图区：ECharts `graph` 关系网络
- 右侧详情区：当前聚焦知识点的局部分析
- 底部联动图区：模块分布柱状图、难度与连接度散点图、关系构成饼图

### 2. 演示汇报页

入口：`presentation.html`

特点：

- 8 屏结构，适合现场演讲
- 风格偏 `Vercel` 式简约技术演示
- 将 `index.html` 作为核心 Demo 嵌入演示流程
- 突出 ECharts 相比静态绘图库的交互优势

## 技术栈

- HTML5
- CSS3
- JavaScript ES Modules
- [Apache ECharts](https://echarts.apache.org/)
- Vitest

## 目录结构

```text
.
├─ assets/
│  ├─ presentation.css
│  └─ styles.css
├─ data/
│  ├─ links.json
│  └─ nodes.json
├─ docs/
│  ├─ ai-handoff-ui-ux.md
│  ├─ presentation-html-complete-guide.md
│  └─ plans/
├─ src/
│  ├─ app.js
│  ├─ config.js
│  ├─ charts/
│  ├─ data/
│  ├─ panels/
│  ├─ state/
│  └─ utils/
├─ tests/
├─ index.html
├─ presentation.html
├─ package.json
└─ README.md
```

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.x

### 1. 安装依赖

```bash
npm install
```

说明：

- 页面运行本身不依赖打包器
- `npm install` 主要用于安装 Vitest 测试依赖

### 2. 启动本地静态服务

方式一：使用仓库自带脚本

```bash
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:8000/
```

方式二：手动指定端口

```bash
python -m http.server 4173
```

然后访问：

- 看板页面：`http://127.0.0.1:4173/index.html`
- 演示页面：`http://127.0.0.1:4173/presentation.html`

> 注意：不要直接双击 `html` 文件打开。项目通过 `fetch()` 读取本地 JSON，必须在静态服务器下运行。

### 3. 运行测试

```bash
npm test
```

## 交互能力

### 主图

- 点击节点：进入局部分析
- 点击空白：取消当前聚焦
- 拖拽节点：调整局部布局
- 缩放和平移：浏览更大的网络结构

### 辅图

- 点击柱状图：按模块筛选
- 点击散点图：聚焦对应知识点
- 点击饼图：按关系类型筛选

### 全局控制

- 重置筛选：恢复默认状态
- 主题切换：深色 / 浅色主题切换
- 显示模式切换：概览模式 / 紧凑模式

## 设计思路

### 统一状态驱动

项目通过一个轻量级 store 管理全局状态，核心状态包括：

- 分类筛选
- 关系类型筛选
- 难度区间筛选
- 关键词搜索
- 当前聚焦节点
- 当前主题
- 当前显示模式

渲染入口会先过滤数据，再统一驱动头部、面板和图表更新。

### 关系网络 + 多视图联动

项目不是单纯展示一张图，而是通过：

- 主 `graph` 网络图
- 模块分布柱状图
- 难度与连接度散点图
- 关系构成饼图

把一个主题组织成完整的交互分析看板。

### 演示页与 Demo 分离

为了适配课程汇报，项目把“核心系统”和“讲述外壳”拆开：

- `index.html` 负责真实交互
- `presentation.html` 负责演讲节奏与内容铺垫

## 关键文件

### 页面入口

- [`index.html`](index.html)
- [`presentation.html`](presentation.html)

### 应用主控

- [`src/app.js`](src/app.js)
- [`src/state/store.js`](src/state/store.js)

### 图表实现

- [`src/charts/graphChart.js`](src/charts/graphChart.js)
- [`src/charts/barChart.js`](src/charts/barChart.js)
- [`src/charts/scatterChart.js`](src/charts/scatterChart.js)
- [`src/charts/pieChart.js`](src/charts/pieChart.js)

### 面板与交互

- [`src/panels/renderHeader.js`](src/panels/renderHeader.js)
- [`src/panels/renderControls.js`](src/panels/renderControls.js)
- [`src/panels/renderDetailPanel.js`](src/panels/renderDetailPanel.js)

### 数据与工具

- [`src/data/loadData.js`](src/data/loadData.js)
- [`src/utils/filtering.js`](src/utils/filtering.js)
- [`src/utils/chartData.js`](src/utils/chartData.js)
- [`src/utils/metrics.js`](src/utils/metrics.js)
- [`src/utils/theme.js`](src/utils/theme.js)
- [`src/utils/runtimeContext.js`](src/utils/runtimeContext.js)

## 文档

如果你要继续重构 UI、改布局、替换图表或把项目交给其他 AI，建议先读：

- [`docs/ai-handoff-ui-ux.md`](docs/ai-handoff-ui-ux.md)
- [`docs/presentation-html-complete-guide.md`](docs/presentation-html-complete-guide.md)

## 测试范围

当前测试主要覆盖：

- 数据过滤逻辑
- 图表 option 构造
- 指标计算逻辑
- 详情面板渲染
- 演示页结构与交互节奏
- 演示页嵌入模式与封面结构

测试文件位于 [`tests/`](tests) 目录。

## 适合继续扩展的方向

- 节点搜索建议与高亮
- 多层邻域展开 / 折叠
- 学习路径推荐视图
- 图数据库或后端 API 接入
- 更丰富的主题和课堂演示模式

## 说明

本项目主要用于课程展示、交互演示和前端可视化实践。  
如果你打算进一步发布、改造或二次开发，建议先统一 README、文档、测试和演示素材，再进行公共发布。
