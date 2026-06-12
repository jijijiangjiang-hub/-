import test from 'node:test';
import assert from 'node:assert/strict';

import { getScrollLineFocusState } from '../src/utils/scrollFocus.ts';

test('scroll focus starts with only the first writing line emphasized', () => {
  const firstLine = getScrollLineFocusState(0, 7, 0);
  const secondLine = getScrollLineFocusState(1, 7, 0);
  const lastLine = getScrollLineFocusState(6, 7, 0);

  assert.equal(firstLine.isFocusLine, true);
  assert.equal(firstLine.emphasis, 1);
  assert.equal(firstLine.opacity, 1);
  assert.ok(secondLine.opacity < 0.65);
  assert.ok(lastLine.opacity < 0.3);
});

test('scroll focus moves the emphasized writing line through the page', () => {
  const previousLine = getScrollLineFocusState(2, 7, 0.5);
  const activeLine = getScrollLineFocusState(3, 7, 0.5);
  const distantLine = getScrollLineFocusState(0, 7, 0.5);

  assert.equal(activeLine.isFocusLine, true);
  assert.equal(activeLine.emphasis, 1);
  assert.ok(activeLine.fontWeight > previousLine.fontWeight);
  assert.ok(activeLine.translateY < previousLine.translateY);
  assert.ok(previousLine.opacity > distantLine.opacity);
  assert.ok(previousLine.opacity < activeLine.opacity);
});
