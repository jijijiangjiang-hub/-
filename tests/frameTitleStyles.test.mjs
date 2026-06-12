import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

test('frame titles use oversized floral lettering', () => {
  const frameTitleRule = css.match(/\.frame-title-label\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';

  assert.match(frameTitleRule, /font-family:[^;]*(STXingkai|Segoe Script|Brush Script MT)/);
  assert.match(frameTitleRule, /font-size:\s*clamp\(2\./);
  assert.match(frameTitleRule, /animation:\s*frameTitleFloat/);
});

test('frame titles include branch-like floating ornaments', () => {
  assert.match(css, /\.frame-title-label::before,\s*\n\.frame-title-label::after/);
  assert.match(css, /@keyframes\s+frameTitleFloat/);
});
