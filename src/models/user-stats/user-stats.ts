import { is, DataType, scope, specify } from "hyrest";
import { computed } from "mobx";

import { world } from "../../scopes";
import { WinLossChartDataPoint } from "./win-loss-chart-data-point";

export class UserStats {
    @scope(world)
    @is(DataType.int)
    public wins?: number;

    @scope(world)
    @is(DataType.int)
    public losses?: number;

    @scope(world)
    @is(DataType.int)
    public ties?: number;

    @scope(world)
    @is(DataType.int)
    public active?: number;

    @computed public get inactive() {
        return this.wins + this.losses + this.ties;
    }

    @computed public get total() {
        return this.active + this.inactive;
    }

    @scope(world)
    @is(DataType.int)
    public following?: number;

    @scope(world)
    @is(DataType.int)
    public uniqueOpponents?: number;

    @scope(world)
    @is() @specify(() => WinLossChartDataPoint)
    public winLossChart?: WinLossChartDataPoint[];
}
