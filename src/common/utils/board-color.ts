export enum Color {
    EMPTY = "empty",
    BLACK = "black",
    WHITE = "white",
}

export const colors = ["black", "white"];

export function oppositeColor(color: Color) {
    if (color === Color.BLACK) {
        return Color.WHITE;
    }
    return Color.BLACK;
}
