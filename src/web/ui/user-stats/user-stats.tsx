import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { inject, external } from "tsdi";
import { Statistic } from "semantic-ui-react";
import { differenceInDays } from "date-fns";

import { User } from "../../../models";
import { UsersStore } from "../../store";
import { formatRank } from "../../../utils";

export interface UserStatsProps {
    readonly userId?: string;
}

@external @observer
export class UserStats extends React.Component<UserStatsProps> {
    @inject private users: UsersStore;

    @computed private get user() {
        const { userId } = this.props;
        const user = this.users.byId(userId);
        if (!user) {
            this.users.load(userId);
        }
        return user;
    }

    @computed private get userStats() {
        const { userId } = this.props;
        const stats = this.users.statsById(userId);
        if (!stats) {
            this.users.loadStats(userId);
        }
        return stats;
    }

    private renderUserStatsStatistics() {
        const { userStats } = this;
        if (!userStats) {
            return null;
        }
        const { wins, losses, ties, uniqueOpponents, following, inactive } = userStats;
        return [
            <Statistic label="Games" value={inactive} key="games" />,
            <Statistic label="Won" value={wins} key="wins" color="green" />,
            <Statistic label="Lost" value={losses} key="losses" color="red" />,
            <Statistic label="Tie" value={ties} key="tie" color="yellow" />,
            <Statistic label="Opponents" value={uniqueOpponents} key="opponents" />,
            <Statistic label="Following" value={following} key="following"/>,
        ];
    }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { created } = user;
        return (
            <Statistic.Group style={{ justifyContent: "space-around" }}>
                <Statistic label="Days" value={differenceInDays(new Date(), created)} />
                <Statistic label="Rank" value={formatRank(user.rating)} />
                {this.renderUserStatsStatistics()}
            </Statistic.Group>
        );
    }
}
