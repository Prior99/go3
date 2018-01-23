import { Color, GroupStatus } from "../../../../common";

import { ColorScheme } from "./color-scheme";

export const defaultColorScheme = new ColorScheme({
    color: new Map([
        [Color.WHITE, "rgb(220, 220, 220)"],
        [Color.BLACK, "rgb(20, 20, 20)"],
    ]),
    last: "rgb(80, 80, 255)",
    status: new Map([
        [GroupStatus.ALIVE, "rgb(80, 255, 80)"],
        [GroupStatus.UNDECIDED, "rgb(255, 255, 80)"],
        [GroupStatus.DEAD, "rgb(255, 80, 80)"],
    ]),
});
