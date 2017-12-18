import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed } from "mobx";
import { inject, external } from "tsdi";
import { Statistic, Segment } from "semantic-ui-react";
import { differenceInDays } from "date-fns";

import { User } from "../../../models";
import { UsersStore } from "../../store";
import { formatRankShort } from "../../../utils";

export interface UserStatsProps {
    readonly userId?: string;
}

@external @observer
export class UserStats extends React.Component<UserStatsProps> {
    @inject private users: UsersStore;

    @computed private get user() { return this.users.byId(this.props.userId); }
    @computed private get userStats() { return this.users.statsById(this.props.userId); }

    private renderUserStatsStatistics() {
        const { userStats } = this;
        if (!userStats) {
            return null;
        }
        const { wins, losses, ties, uniqueOpponents, followers, following, inactive } = userStats;
        return [
            <Statistic inverted label="Opponents" value={uniqueOpponents} key="opponents" />,
            <Statistic inverted label="Following" value={following} key="following"/>,
            <Statistic inverted label="Followers" value={followers} key="followers"/>,
            <Statistic inverted label="Games" value={inactive} key="games" />,
            <Statistic inverted label="Won" value={wins} key="wins" color="green" />,
            <Statistic inverted label="Lost" value={losses} key="losses" color="red" />,
            <Statistic inverted label="Tie" value={ties} key="tie" color="yellow" />,
        ];
    }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { created } = user;
        return (
            <Segment inverted>
                <Statistic.Group size="small" inverted style={{ justifyContent: "space-around" }}>
                    <Statistic inverted label="Days" value={differenceInDays(new Date(), created)} />
                    <Statistic inverted label="Rank" value={formatRankShort(user.rating)} />
                    {this.renderUserStatsStatistics()}
                </Statistic.Group>
            </Segment>
        );
    }
}
