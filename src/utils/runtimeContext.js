export function getEmbedMode(search = "") {
  const query = typeof search === "string" ? search : "";
  const params = new URLSearchParams(query.startsWith("?") ? query : `?${query}`);
  const embed = params.get("embed");

  return embed === "presentation" ? "presentation" : "";
}

export function getInitialDisplayMode(embedMode = "") {
  return embedMode === "presentation" ? "compact" : "overview";
}
