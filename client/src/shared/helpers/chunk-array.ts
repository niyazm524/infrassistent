export function chunkArray<T extends any>(
  array: T[],
  chunkSize = 3
): Array<T[]> {
  const chunks: Array<T[]> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}
