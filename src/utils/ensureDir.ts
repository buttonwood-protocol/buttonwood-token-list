import fs from 'fs/promises';

export async function ensureDir(src: string): Promise<void> {
    try {
        await fs.mkdir(src, { recursive: true });
    } catch (err) {
        // it probably exists
    }
}
