import * as fs from 'fs';
import * as path from 'path';
import { Mode } from 'stat-mode';

const getFileType = (
  file: Pick<Mode, 'isFile' | 'isDirectory' | 'isSymbolicLink' | 'isSocket'>
) => {
  if (file.isFile()) return 'file';
  if (file.isDirectory()) return 'directory';
  if (file.isSymbolicLink()) return 'link';
  if (file.isSocket()) return 'socket';
  return 'unknown';
};

export const FilesService = {
  async readDir(dirPath: string) {
    const list = [];
    const files = await fs.promises.opendir(dirPath, { encoding: 'utf-8' });
    for await (const file of files) {
      if (file.name === '.') continue;
      try {
        const stat = await fs.promises.stat(path.resolve(dirPath, file.name));
        const mode = new Mode(stat);
        list.push({
          name: file.name,
          entryType: getFileType(file),
          type: getFileType(mode),
          size: stat.size,
          mode: mode.toString(),
          mtime: stat.mtime,
          ctime: stat.ctime,
        });
      } catch (err: any) {
        list.push({
          name: file.name,
          entryType: getFileType(file),
        });
      }
    }
    return list;
  },
};
