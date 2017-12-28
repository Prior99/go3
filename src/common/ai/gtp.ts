import { ReadLine, createInterface } from "readline";
import { Board, formatPosition, parsePosition, Position, Game, Color } from "..";
import { bind } from "bind-decorator";

import { Action, Move } from "./ai";
import { oppositeColor } from "..";

function getPayload(response: string): string {
    if (response.substr(0, 2) !== "= ") { return; }
    return response.substr(2, response.length).trim();
}

function getError(response: string): Error {
    if (response.substr(0, 2) !== "? ") { return; }
    return new Error(`GTP client reported an error: "${response.substr(2, response.length).trim()}"`);
}

export async function invokeGtpAI(
    game: Game,
    input: NodeJS.WritableStream,
    output: NodeJS.ReadableStream,
): Promise<Move> {
    const client = new Gtp(input, output, game.boardSize);
    await client.replayGame(game);
    const move = await client.genMove(game.currentBoard.currentColor);
    await client.close();
    return move;
}

export class Gtp {
    private input: NodeJS.WritableStream;
    private output: ReadLine;
    private boardSize: number;

    constructor(input: NodeJS.WritableStream, output: NodeJS.ReadableStream, boardSize: number) {
        this.input = input;
        this.output = createInterface(output);
        output.setEncoding("utf8");
        this.boardSize = boardSize;
    }

    @bind private readBoolean(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.output.once("line", data => {
                const error = getError(data);
                if (error) { return reject(error); }
                const payload = getPayload(data);
                if (!payload) { return reject(new Error(`Malformatted boolean: "${data}".`)); }
                switch (payload) {
                    case "true": return resolve(true);
                    case "false": return resolve(false);
                    default: return reject(new Error("Unexpected response."));
                }
            });
        });
    }

    @bind private readMove(): Promise<Move> {
        return new Promise((resolve, reject) => {
            this.output.once("line", data => {
                const error = getError(data);
                if (error) { return reject(error); }
                const payload = getPayload(data);
                if (!payload) { return reject(new Error(`Malformatted move: "${data}"`)); }
                if (payload.toLowerCase() === "pass") { return resolve({ action: Action.PASS }); }
                if (payload.toLowerCase() === "resign") { return resolve({ action: Action.RESIGN }); }
                return resolve({
                    action: Action.PLACE,
                    position: parsePosition(payload, this.boardSize),
                });
            });
        });
    }

    @bind private readEmpty(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.output.once("line", data => {
                const error = getError(data);
                if (error) { return reject(error); }
                const payload = getPayload(data);
                if (payload !== "") { return reject(new Error(`Malformatted empty response: "${data}"`)); }
                resolve();
            });
        });
    }

    @bind private async knownCommand(command: string) {
        this.write("known_command", command);
        return await this.readBoolean();
    }

    @bind private write(command: string, ...args: any[]) {
        this.input.write([command, ...args].join(" "));
        this.input.write("\n");
    }

    @bind private async execute(command: string, ...args: any[]) {
        this.write(command, ...args);
    }

    @bind public async play(board: Board) {
        const { placedAt, currentColor, size } = board;
        const formattedPosition = formatPosition(board.toPos(board.placedAt), size);
        await this.execute("play", oppositeColor(currentColor), formattedPosition);
        await this.readEmpty();
    }

    @bind public async setBoardsize() {
        await this.execute("boardsize", this.boardSize);
        await this.readEmpty();
    }

    @bind public async replayGame(game: Game) {
        await this.setBoardsize();
        for (let board of game.boards) {
            if (board.placedAt === null) {
                continue;
            }
            await this.play(board);
        }
    }

    @bind public async genMove(color: Color) {
        await this.execute("genmove", color);
        const move = await this.readMove();
        return move;
    }

    @bind public close(): Promise<undefined> {
        this.execute("quit");
        this.input.end();
        return new Promise((resolve, reject) => {
            this.output.once("close", () => resolve());
        });
    }
}
