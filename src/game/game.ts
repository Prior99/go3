import { Board } from "models";
import { Color } from "board-color";

export enum ValidationResult {
    OKAY = "okay",
    TURN = "turn",
    OCCUPIED = "occupied",
}

export function getNextColor(board: Board) {
    return board.turn % 2 === 0 ? Color.BLACK : Color.WHITE;
}

export function getColor(board: Board, at: number): Color {
    return board.state[at];
}

export function validateTurn(board: Board, secondLastBoard: Board, color: Color, placedAt: number): ValidationResult {
    if (getNextColor(board) !== color) {
        return ValidationResult.TURN;
    }
    if (getColor(board, placedAt) !== Color.EMPTY) {
        return ValidationResult.OCCUPIED;
    }
    return ValidationResult.OKAY;
}
