import { Color, GroupStatus } from "../../../../common";
import * as DrawColor from "color";

import { ColorScheme } from "./color-scheme";

export const defaultColorScheme = new ColorScheme({
    color: new Map([
        [Color.WHITE, DrawColor.rgb(220, 220, 220)],
        [Color.BLACK, DrawColor.rgb(20, 20, 20)],
    ]),
    last: DrawColor.rgb(80, 80, 255),
    status: new Map([
        [GroupStatus.ALIVE, DrawColor.rgb(80, 255, 80)],
        [GroupStatus.UNDECIDED, DrawColor.rgb(255, 255, 80)],
        [GroupStatus.DEAD, DrawColor.rgb(255, 80, 80)],
    ]),
});
