import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { inject, external } from "tsdi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { bindAll } from "lodash-decorators";

import { UsersStore } from "../../../common-ui";

export interface WinLossLineChartProps {
    readonly userId?: string;
}

@external @observer
@bindAll()
export class WinLossLineChart extends React.Component<WinLossLineChartProps> {
    @inject private users: UsersStore;

    @computed private get userStats() { return this.users.statsById(this.props.userId); }

    private xAxisTickFormatter(index: number) {
        return format(this.userStats.winLossChart[index].date, "YYYY-MM-DD");
    }

    public render() {
        const { userStats } = this;
        if (!userStats) {
            return null;
        }
        return (
            <ResponsiveContainer width="100%" height={250}>
                <LineChart
                    data={userStats.winLossChart}
                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                >
                    <XAxis tickFormatter={this.xAxisTickFormatter}/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="1 3"/>
                    <Tooltip/>
                    <Legend />
                    <Line type="monotone" dataKey="wins" stroke="#21ba45" />
                    <Line type="monotone" dataKey="losses" stroke="#db2828" />
                    <Line type="monotone" dataKey="ties" stroke="#fbbd08" />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}
