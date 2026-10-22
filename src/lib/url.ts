// 사이트가 하위 경로(예: GitHub Pages의 /blog-1/)에 있을 때도 내부 링크가 맞도록 base를 붙인다.
export function u(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
