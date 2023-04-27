export function maxLevelDepth(count: number, p: number) {
    const base = Math.min(Math.ceil(1 / p), 3);
    const exp = Math.log(count) / Math.log(base);
    return Math.max(Math.ceil(exp), 1);
}

export function randomLevelDepth(
    count: number,
    p = 0.25,
    random = Math.random
) {
    let level = 1;
    const maxLevel = maxLevelDepth(count, p);
    while (random() < p && level < maxLevel) {
        level++;
    }
    return level;
}

export function insert(x: any): any {
    return null;
}
