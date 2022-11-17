import fs from 'fs/promises';

export async function loadJson<OutputType>(src: string): Promise<OutputType> {
    const jsonText = await fs.readFile(src, 'utf8');
    return JSON.parse(jsonText) as OutputType;
}
