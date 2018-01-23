import { Color, GroupStatus } from "../../../../common";

export class ColorScheme {
    public color: Map<Color, string>;
    public last: string;
    public status: Map<GroupStatus, string>;

    constructor(original: ColorScheme) {
        this.color = original.color;
        this.last = original.last;
        this.status = original.status;
    }
}
