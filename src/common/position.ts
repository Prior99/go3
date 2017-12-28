export interface Position {
    col: number;
    row: number;
}

const charCodeA = "A".charCodeAt(0);
const charCodeI = "I".charCodeAt(0);

export function formatPosition({ col, row }: Position, size: number) {
    let charCode = col + charCodeA;
    if (charCode >= charCodeI) {
        charCode++;
    }
    const colLetter = String.fromCharCode(charCode);
    const adjustedRow = size - row;
    return `${colLetter}${adjustedRow}`;
}

export function parsePosition(notation: string, size: number): Position {
    let charCode = notation.charCodeAt(0);
    if (charCode > charCodeI) {
        charCode--;
    }
    const col = charCode - charCodeA;
    const row = size - Number(notation.substr(1, notation.length));
    return { col, row };
}
