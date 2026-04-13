export async function loadDashboardData() {
  const [nodesRes, linksRes] = await Promise.all([
    fetch("./data/nodes.json"),
    fetch("./data/links.json")
  ]);

  if (!nodesRes.ok) {
    throw new Error(`nodes.json 加载失败: ${nodesRes.status} ${nodesRes.statusText}`);
  }

  if (!linksRes.ok) {
    throw new Error(`links.json 加载失败: ${linksRes.status} ${linksRes.statusText}`);
  }

  return {
    nodes: await nodesRes.json(),
    links: await linksRes.json()
  };
}
