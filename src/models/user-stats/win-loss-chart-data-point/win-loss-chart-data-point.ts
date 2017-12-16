import { scope, DataType, is, specify } from "hyrest";

import { world } from "../../../scopes";

export class WinLossChartDataPoint {
    constructor(date?: Date) {
        if (date) {
            this.date = date;
        }
    }

    @scope(world)
    @is(DataType.int)
    public wins? = 0;

    @scope(world)
    @is(DataType.int)
    public losses? = 0;

    @scope(world)
    @is(DataType.int)
    public ties? = 0;

    @scope(world) @specify(() => Date)
    public date?: Date;
}
