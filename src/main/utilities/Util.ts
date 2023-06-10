
export function splitSentences(s: string): string[] {
    return s.split(/(?<=[.?!;])\s+(?=\p{Lu})/u);
}