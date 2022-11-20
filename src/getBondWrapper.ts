export function getBondWrapper(
  trancheCount: number,
  trancheIndex: number,
): string {
  if (trancheIndex === trancheCount - 1) {
    return 'tranche-z';
  }
  const trancheLetter = 'abcdefghijklmnopqrstuvwxyz'[trancheIndex];
  return `tranche-${trancheLetter}`;
}
