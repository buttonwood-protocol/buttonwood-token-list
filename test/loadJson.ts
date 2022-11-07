import fs from 'fs/promises';

export async function loadJson(src: string) {
    const jsonText = await fs.readFile(src, 'utf8');
    return JSON.parse(jsonText);
}
