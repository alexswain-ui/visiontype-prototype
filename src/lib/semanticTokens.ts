import tokensCss from '../styles/tokens.css?raw';

/** One semantic colour token with its value in each theme, read straight from tokens.css. */
export interface SemanticToken {
  name: string;
  light: string;
  dark: string;
}

export interface TokenGroup {
  group: string;
  tokens: SemanticToken[];
}

function readBlock(selector: string): Map<string, string> {
  const start = tokensCss.indexOf(selector);
  const body = tokensCss.slice(tokensCss.indexOf('{', start) + 1, tokensCss.indexOf('}', start));
  const values = new Map<string, string>();
  for (const match of body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) values.set(match[1], match[2].trim());
  return values;
}

const light = readBlock(':root, [data-theme="light"]');
const dark = readBlock('[data-theme="dark"]');

/** Semantic tokens only (the theme blocks), grouped by their first word. Palette tokens are never included. */
export const semanticTokenGroups: TokenGroup[] = (() => {
  const groups = new Map<string, SemanticToken[]>();
  for (const [name, lightValue] of light) {
    const group = name.slice(2).split('-')[0];
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push({ name, light: lightValue, dark: dark.get(name) ?? '' });
  }
  return [...groups].map(([group, tokens]) => ({ group, tokens }));
})();
