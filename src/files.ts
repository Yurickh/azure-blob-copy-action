import { promises as Fs } from 'fs'
import * as Path from 'path'

export async function walkFiles(
  rootPath: string,
  callback: (path: string) => Promise<void>,
): Promise<void> {
  async function _walk(dir: string): Promise<void> {
    const files = await Fs.readdir(dir)

    for (const file of files) {
      const path = Path.join(dir, file)
      const stat = await Fs.lstat(path)

      if (stat.isDirectory()) {
        await _walk(path)
      } else {
        await callback(path)
      }
    }
  }

  await _walk(rootPath)
}
