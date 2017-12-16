import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed, action } from "mobx";
import { inject, external } from "tsdi";
import { Statistic } from "semantic-ui-react";
import { bind } from "bind-decorator";
import { differenceInDays } from "date-fns";

import { User } from "../../../models";
import { UsersStore } from "../../store";

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
        const { wins, losses, ties, uniqueOpponents, friends, inactive } = userStats;
        return [
            <Statistic label="Games" value={inactive} key="games" />,
            <Statistic label="Won" value={wins} key="wins" />,
            <Statistic label="Lost" value={losses} key="losses" />,
            <Statistic label="Tie" value={ties} key="tie" />,
            <Statistic label="Opponents" value={uniqueOpponents} key="opponents" />,
            <Statistic label="Friends" value={friends} key="friends"/>,
        ];
    }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { created } = user;
        return (
            <Statistic.Group>
                <Statistic label="Days" value={differenceInDays(new Date(), created)} />
                {this.renderUserStatsStatistics()}
            </Statistic.Group>
        );
    }
}
