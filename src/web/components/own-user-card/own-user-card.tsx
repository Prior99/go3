import * as React from "react";
import { Card, Image } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { bind } from "bind-decorator";
import { History } from "history";

import { User, formatRank } from "../../../common";
import { routeUser, OwnUserStore, GamesStore, UsersStore, LoginStore } from "../../../common-ui";
import { Infos, InfoName, InfoValue } from "..";
import * as css from "./own-user-card.scss";

@external @observer
export class OwnUserCard extends React.Component {
    @inject private ownUser: OwnUserStore;
    @inject private browserHistory: History;
    @inject private users: UsersStore;
    @inject private login: LoginStore;

    @computed private get avatar() { return this.ownUser.user && this.ownUser.user.avatarUrl; }

    @bind private toUser() { this.browserHistory.push(routeUser.path(this.login.userId)); }

    public render() {
        const { user, userStats } = this.ownUser;
        if (!user || !userStats) {
            return null;
        }
        const { name, rating } = user;
        const { avatar } = this;
        const rank = formatRank(rating);
        return (
            <Card>
                <Image onClick={this.toUser} className={css.avatar} src={avatar} />
                <Card.Content>
                    <Card.Header><a onClick={this.toUser}>{name}</a></Card.Header>
                    <Card.Meta>{rank}</Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <div className={css.info}>
                        <Infos>
                            <InfoName>Games</InfoName>
                            <InfoValue>{userStats.total}</InfoValue>
                            <InfoName>Active</InfoName>
                            <InfoValue>{userStats.active}</InfoValue>
                            <InfoName>Completed</InfoName>
                            <InfoValue>{userStats.inactive}</InfoValue>
                            <InfoName>Opponents</InfoName>
                            <InfoValue>{userStats.uniqueOpponents}</InfoValue>
                        </Infos>
                    </div>
                </Card.Content>
                <Card.Content extra>
                    <div className={css.info}>
                        <Infos>
                            <InfoName>Tie</InfoName>
                            <InfoValue>{userStats.ties}</InfoValue>
                            <InfoName>Won</InfoName>
                            <InfoValue>{userStats.wins}</InfoValue>
                            <InfoName>Lost</InfoName>
                            <InfoValue>{userStats.losses}</InfoValue>
                        </Infos>
                    </div>
                </Card.Content>
                <Card.Content extra>
                    <div className={css.info}>
                        <Infos>
                            <InfoName>Followers</InfoName>
                            <InfoValue>{userStats.followers}</InfoValue>
                            <InfoName>Following</InfoName>
                            <InfoValue>{userStats.following}</InfoValue>
                        </Infos>
                    </div>
                </Card.Content>
            </Card>
        );
    }
}
