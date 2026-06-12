export type ScrollLineFocusState = {
  emphasis: number;
  opacity: number;
  scale: number;
  translateY: number;
  fontWeight: number;
  blur: number;
  isFocusLine: boolean;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getScrollLineFocusState(
  rowIndex: number,
  lineCount: number,
  progress: number,
): ScrollLineFocusState {
  const safeLineCount = Math.max(1, lineCount);
  const safeRowIndex = clamp(rowIndex, 0, safeLineCount - 1);
  const focusPosition = safeLineCount === 1 ? 0 : clamp(progress) * (safeLineCount - 1);
  const distance = Math.abs(safeRowIndex - focusPosition);
  const emphasis = clamp(1 - distance / 0.92);
  const context = clamp(1 - distance / 2.35);
  const isFocusLine = distance < 0.42;

  return {
    emphasis,
    opacity: isFocusLine ? 1 : clamp(0.18 + emphasis * 0.72 + context * 0.1),
    scale: 0.92 + emphasis * 0.16 + context * 0.04,
    translateY: 8 - emphasis * 20,
    fontWeight: Math.round(380 + emphasis * 380 + context * 70),
    blur: Number(((1 - emphasis) * 1.1).toFixed(2)),
    isFocusLine,
  };
}
