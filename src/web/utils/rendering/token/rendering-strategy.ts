import { TokenDrawInstructions } from "./draw-instructions";

export abstract class TokenRenderingStrategy {
    public abstract draw(instructions: TokenDrawInstructions);
}
