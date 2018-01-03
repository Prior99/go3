import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed, action } from "mobx";
import { inject, external } from "tsdi";
import { PieChart, Pie, Sector, RechartsFunction } from "recharts";
import { bind } from "decko";

import { UsersStore } from "../../../common-ui";
import { ActiveShape } from "./active-shape";

export interface WinLossPieChartProps {
    readonly userId: string;
}

@external @observer
export class WinLossPieChart extends React.Component<WinLossPieChartProps> {
    @inject private users: UsersStore;

    @observable private activeIndex = 0;

    @computed private get userStats() { return this.users.statsById(this.props.userId); }

    @computed private get data() {
        const { userStats } = this;
        if (!userStats) {
            return;
        }
        const { wins, losses, ties, active } = userStats;
        return [
            { result: "Won", value: wins, fill: "#21ba45" },
            { result: "Lost", value: losses, fill: "#db2828" },
            { result: "Tie", value: ties, fill: "#fbbd08" },
        ];
    }

    @bind @action
    private doPieEnter(_, index: number) {
        this.activeIndex = index;
    }

    public render() {
        const { data, activeIndex } = this;
        if (!data) {
            return null;
        }
        return (
            <PieChart width={500} height={300}>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={ActiveShape}
                    data={data}
                    cx={250}
                    cy={150}
                    innerRadius={80}
                    outerRadius={110}
                    onMouseEnter={this.doPieEnter as RechartsFunction}
                    dataKey="value"
                />
            </PieChart>
        );
    }
}
