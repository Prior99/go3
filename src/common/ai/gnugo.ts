import { spawn } from "child_process";
import { Game, Position } from "..";
import { invokeGtpAI } from "./gtp";
import { Move } from "./ai";

export async function invokeGnuGo(game: Game, level: number): Promise<Move> {
    return new Promise<Move>(async (resolve, reject) => {
        const child = spawn("gnugo", ["--level", `${level}`, "--mode", "gtp"]);
        child.once("error", err => {
            if ((err as any).code === "ENOENT") {
                return reject(new Error("Gnugo executable could not be found."));
            }
            return reject(err);
        });
        try {
            const move = await invokeGtpAI(game, child.stdin, child.stdout);
            return resolve(move);
        } catch (err) {
            reject(err);
        }
    });
}

export async function gnuGoInstalled(): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
        const child = spawn("gnugo", ["--version"]);
        child.once("error", () => resolve(false));
        child.once("close", () => resolve(true));
    });
}
