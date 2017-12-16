import { scope, DataType, is } from "hyrest";

import { world } from "../../../scopes";

export class WinLossChartDataPoint {
    @scope(world)
    @is(DataType.int)
    public wins?: number;

    @scope(world)
    @is(DataType.int)
    public losses?: number;

    @scope(world)
    @is(DataType.int)
    public ties?: number;
}
