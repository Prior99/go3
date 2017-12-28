import { invokeGnuGo } from "./gnugo";
import { Game, Position } from "..";

export enum Action {
    PLACE = "place",
    PASS = "pass",
    RESIGN = "resign",
}

export interface Move {
    action: Action;
    position?: Position;
}

export async function invokeAI(game: Game): Promise<Move> {
    const { ai, aiLevel } = game.currentUser;
    if (!ai) { return undefined; }
    switch (ai) {
        case "gnugo": {
            return await invokeGnuGo(game, aiLevel);
        }
        default: {
            throw new Error(`Unknown AI: "${ai}"`);
        }
    }
}
