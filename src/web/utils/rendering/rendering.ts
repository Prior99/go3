import { component, inject, TSDI } from "tsdi";

import { OwnUserStore } from "../../../common-ui";

import { BoardDrawInstructions,  BoardRenderingStrategy, BoardClassic } from "./board";
import { TokenDrawInstructions, TokenRenderingStrategy, TokenClassic, TokenModern } from "./token";

@component
export class Rendering {
    @inject private ownUser: OwnUserStore;
    @inject private tsdi: TSDI;

    public get tokenRenderingStrategy(): TokenRenderingStrategy {
        const { renderingStrategy } = this.ownUser.user;
        switch (renderingStrategy) {
            case "modern": return this.tsdi.get(TokenModern);
            case "classic": return this.tsdi.get(TokenClassic);
            default: throw new Error(`Unknown rendering strategy: "${renderingStrategy}"`);
        }
    }

    public get boardRenderingStrategy(): BoardRenderingStrategy {
        return this.tsdi.get(BoardClassic);
    }

    public drawToken(instructions: TokenDrawInstructions) {
        this.tokenRenderingStrategy.draw(instructions);
    }

    public drawBoard(instructions: BoardDrawInstructions) {
        this.boardRenderingStrategy.draw(instructions);
    }
}
