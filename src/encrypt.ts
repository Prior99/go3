import { createHmac } from "crypto";

const SECRET = "Eech3ahm";

export function hash(value: string) {
    return createHmac("sha256", SECRET).update(value).digest("hex");
}
