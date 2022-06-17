import { execFile as execCb, spawn } from 'child_process';
import * as util from 'util';

const exec = util.promisify(execCb);

export async function bufferedRun(cmd, args?: string[]) {
  try {
    const { stdout, stderr } = await exec(cmd, args);
    if (!stderr) {
      return { result: true, stdout, stderr };
    }
    return { result: false, stdout, stderr, message: stderr };
  } catch (err) {
    return { result: false, isNodeError: true, message: err?.message };
  }
}
