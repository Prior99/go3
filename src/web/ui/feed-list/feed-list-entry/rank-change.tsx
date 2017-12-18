import * as React from "react";
import { observer } from "mobx-react";
import { Feed, Image } from "semantic-ui-react";
import { external, inject } from "tsdi";
import { formatDistance } from "date-fns";
import { History } from "history";
import { bind } from "bind-decorator";

import { FeedItem, FeedEvent } from "../../../../models";
import { routeUser } from "../../../routing";
import { UsersStore, OwnUserStore } from "../../../store";
import { Rank } from "../../../../utils";

export interface FeedListEntryRankChangeProps {
    readonly item: FeedItem;
}

@observer @external
export class FeedListEntryRankChange extends React.Component<FeedListEntryRankChangeProps> {
    @inject private users: UsersStore;
    @inject private ownUser: OwnUserStore;
    @inject private browserHistory: History;

    @bind
    private toUser() {
        this.browserHistory.push(routeUser.path(this.props.item.user.id));
    }

    public render() {
        const { event, user, game, date } = this.props.item;
        const avatar = this.users.avatarById(user.id);
        const ago = formatDistance(date, new Date());
        const participant = game.participants.find(current => current.user.id === user.id);
        const oldRank = new Rank(participant.rating);
        const newRank = new Rank(game.newRating(user.id));
        const gained = newRank.greaterThan(oldRank);
        const name = user.id === this.ownUser.user.id ? "You" : user.name;
        return (
            <Feed.Event>
                <Feed.Label>
                    <Image circular src={avatar} />
                </Feed.Label>
                <Feed.Content>
                    {
                        gained ? (
                            <Feed.Summary>
                                <Feed.User>{name}</Feed.User>{" "}
                                gained a rank from {oldRank.format()} to {newRank.format()}{" "}
                                <Feed.Date>{ago} ago</Feed.Date>
                            </Feed.Summary>
                        ) : (
                            <Feed.Summary>
                                <Feed.User onClick={this.toUser}>{name}</Feed.User>{" "}
                                lost a rank from {oldRank.format()} to {newRank.format()}{" "}
                                <Feed.Date>{ago} ago</Feed.Date>
                            </Feed.Summary>
                        )
                    }
                </Feed.Content>
            </Feed.Event>
        );
    }
}
