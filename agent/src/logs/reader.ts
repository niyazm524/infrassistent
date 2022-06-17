import * as TailFile from 'tail-file';
import { bufferedOutput } from '../utils/buffered-output';
import { LogSourceSerialized } from './types';

export function pipeLog(logSource: LogSourceSerialized, writer: (logs: string[]) => Promise<void>) {
  const tail = new TailFile(logSource.location, {
    startPos: logSource.position === null ? 'start' : undefined,
  });
  if (logSource.position) tail.setBytePos(logSource.position);
  const buffered = bufferedOutput<string>([30, 150], writer);
  tail.on('error', (err) => console.warn(err));
  tail.on('line', (line) => buffered.write(line));
  tail.on('ready', (fd) => console.log('All line are belong to us'));

  tail.on('eof', (pos) => console.log('Catched up to the last line'));

  tail.on('skip', (pos) => console.log('myfile.log suddenly got replaced with a large file'));

  tail.on('secondary', (filename) =>
    console.log(`myfile.log is missing. Tailing ${filename} instead`)
  );

  tail.on('restart', (reason) => {
    if (reason == 'PRIMEFOUND') console.log('Now we can finally start tailing. File has appeared');
    if (reason == 'NEWPRIME') console.log('We will switch over to the new file now');
    if (reason == 'TRUNCATE') console.log('The file got smaller. I will go up and continue');
    if (reason == 'CATCHUP')
      console.log(
        'We found a start in an earlier file and are now moving to the next one in the list'
      );
  });
  tail.start();
  return async () => {
    const pos = tail.pos;
    await tail.stop();
    await buffered.flush();
    buffered.close();
    return {
      ...logSource,
      position: pos,
    };
  };
}
