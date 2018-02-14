import { Color, GroupStatus } from "../../../../common";
import * as DrawColor from "color";

export class ColorScheme {
    public color: Map<Color, DrawColor>;
    public last: DrawColor;
    public status: Map<GroupStatus, DrawColor>;

    constructor(original: ColorScheme) {
        this.color = original.color;
        this.last = original.last;
        this.status = original.status;
    }
}
