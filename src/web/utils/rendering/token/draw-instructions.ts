import { Color, GroupStatus } from "../../../../common";

export interface TokenDrawInstructions {
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    color: Color;
    closedTop: boolean;
    closedBottom: boolean;
    closedLeft: boolean;
    closedRight: boolean;
    closedTopLeft: boolean;
    closedBottomLeft: boolean;
    closedTopRight: boolean;
    closedBottomRight: boolean;
    last: boolean;
    preview: boolean;
    status: GroupStatus;
    valid: boolean;
    hovered: boolean;
    locked: boolean;
}
