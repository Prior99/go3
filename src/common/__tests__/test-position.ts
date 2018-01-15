import { formatPosition, parsePosition } from "..";

[
    { position: { col: 0, row: 0 }, size: 5, formatted: "A5" },
    { position: { col: 1, row: 1 }, size: 5, formatted: "B4" },
    { position: { col: 2, row: 2 }, size: 5, formatted: "C3" },
    { position: { col: 4, row: 4 }, size: 5, formatted: "E1" },
    { position: { col: 1, row: 3 }, size: 5, formatted: "B2" },
    { position: { col: 6, row: 4 }, size: 13, formatted: "G9" },
    { position: { col: 7, row: 4 }, size: 13, formatted: "H9" },
    { position: { col: 8, row: 4 }, size: 13, formatted: "J9" },
    { position: { col: 9, row: 4 }, size: 13, formatted: "K9" },
    { position: { col: 10, row: 4 }, size: 13, formatted: "L9" },
    { position: { col: 11, row: 4 }, size: 13, formatted: "M9" },
    { position: { col: 12, row: 4 }, size: 13, formatted: "N9" },
].forEach(({ position, size, formatted }) => {
    const { col, row } = position;
    test(`formatPosition formats ${col},${row} on a ${size}x${size} board as ${formatted}`, () => {
        expect(formatPosition(position, size)).toEqual(formatted);
    });
    test(`parsePosition parses ${formatted} as ${col},${row} on a ${size}x${size} board`, () => {
        expect(formatPosition(position, size)).toEqual(formatted);
    });
});
