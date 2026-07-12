/** basePath на GitHub Pages — определяется из URL, без env на клиенте */
export function getAppBasePath(): string {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/^(\/feeding-managment)(?=\/|$)/);
  return match?.[1] ?? "";
}

export function appPath(path: string): string {
  const base = getAppBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `${base}${withSlash}`;
}

/** Полная перезагрузка — надёжнее client navigation на GitHub Pages */
export function navigateToAppPath(path: string): void {
  window.location.assign(appPath(path));
}
