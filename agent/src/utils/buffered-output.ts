export function bufferedOutput<T>(
  [size, maxSize] = [50, 150],
  writer: (els: T[]) => Promise<void>
) {
  let buffer: T[] = [];
  let writing = false;
  let lastWrite = 0;
  const write = (el: T) => {
    buffer.push(el);
    if (buffer.length > size) {
      flush();
    }
    lastWrite = Date.now();
  };

  const flush = () => {
    if (writing) return;
    writing = true;
    const writtenSize = Math.min(buffer.length, maxSize);
    return writer(buffer.slice(0, writtenSize)).then(() => {
      buffer = buffer.slice(writtenSize);
      console.log(`Pending: ${writtenSize}, buffered: ${buffer.length}`);
      writing = false;
    });
  };

  const interval = setInterval(() => {
    if (buffer.length && Date.now() - lastWrite > 1000 * 10000) flush();
  }, 7500);

  const close = () => {
    clearInterval(interval);
    const length = buffer.length;
    buffer = [];
    return length;
  };

  return { write, close, flush };
}
