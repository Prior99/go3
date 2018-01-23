import { BoardDrawInstructions } from "./draw-instructions";

export abstract class BoardRenderingStrategy {
    public abstract draw(instructions: BoardDrawInstructions);
}
