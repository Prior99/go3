import * as React from "react";
import { observer } from "mobx-react";
import { Feed, Image } from "semantic-ui-react";
import { external, inject } from "tsdi";
import { formatDistance } from "date-fns";
import { History } from "history";
import { bind } from "bind-decorator";
import { computed } from "mobx";

import { FeedItem, FeedEvent } from "../../../../models";
import { UsersStore, LoginStore } from "../../../store";
import { routeUser } from "../../../routing";
import * as css from "./game-over.scss";

export interface FeedListEntryGameOverProps {
    readonly item: FeedItem;
}

@observer @external
export class FeedListEntryGameOver extends React.Component<FeedListEntryGameOverProps> {
    @inject private users: UsersStore;
    @inject private login: LoginStore;
    @inject private browserHistory: History;

    @computed private get winner() {
        return this.props.item.game.participants.find(participant => participant.user !== this.loser).user;
    }

    @computed private get loser() {
        return this.props.item.game.participants.find(participant => !participant.winner).user;
    }

    @bind
    private toWinner() {
        this.browserHistory.push(routeUser.path(this.winner.id));
    }

    @bind
    private toLoser() {
        this.browserHistory.push(routeUser.path(this.loser.id));
    }

    public render() {
        const { event, user, game, date } = this.props.item;
        const duration = formatDistance(game.created, date);
        const ago = formatDistance(date, new Date());
        const ownId = this.login.userId;
        const { winner, loser } = this;
        return (
            <Feed.Event>
                <Feed.Label className={css.multiAvatarGroup}>
                    {
                        game.participants.map(participant => {
                            return (
                                <Image
                                    className={css.multiAvatar}
                                    circular
                                    src={this.users.avatarById(participant.user.id)}
                                    key={participant.user.id}
                                />
                            );
                        })
                    }
                </Feed.Label>
                <Feed.Content>
                    {
                        game.tie ? (
                            <Feed.Summary>
                                <Feed.User onClick={this.toWinner}>
                                    {winner.id === ownId ? "You" : winner.name}
                                </Feed.User> and{" "}
                                <Feed.User onClick={this.toLoser}>
                                    {loser.id === ownId ? "you" : loser.name}
                                </Feed.User> had a tie{" "}
                                after {duration}{" "}<Feed.Date>{ago} ago</Feed.Date>
                            </Feed.Summary>
                        ) : (
                            <Feed.Summary>
                                <Feed.User onClick={this.toWinner}>
                                    {winner.id === ownId ? "You" : winner.name}
                                </Feed.User> beat{" "}
                                <Feed.User onClick={this.toLoser}>
                                    {loser.id === ownId ? "you" : loser.name}
                                </Feed.User> after {duration}{" "}
                                <Feed.Date>{ago} ago</Feed.Date>
                            </Feed.Summary>
                        )
                    }
                </Feed.Content>
            </Feed.Event>
        );
    }
}

