import fs from 'fs/promises';

export async function pathExists(src: string): Promise<boolean> {
  try {
    await fs.access(src);
    return true;
  } catch (err) {
    return false;
  }
}
