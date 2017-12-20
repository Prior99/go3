import * as React from "react";
import { observer } from "mobx-react";

import { WinLossLineChart, WinLossPieChart } from "..";
import * as css from "./user-charts.scss";

export interface UserChartsProps {
    readonly userId: string;
}

@observer
export class UserCharts extends React.Component<UserChartsProps> {
    public render() {
        const { userId } = this.props;
        return (
            <div className={css.chartsContainer}>
                <div className={css.lineContainer}>
                    <WinLossLineChart userId={userId} />
                </div>
                <div className={css.pieContainer}>
                    <WinLossPieChart userId={userId} />
                </div>
            </div>
        );
    }
}
