import * as React from "react";
import { observer } from "mobx-react";
import { Feed, Image } from "semantic-ui-react";
import { external, inject } from "tsdi";
import { formatDistance } from "date-fns";
import { History } from "history";
import { bind } from "bind-decorator";

import { FeedItem, FeedEvent } from "../../../../common";
import { routeUser, UsersStore, LoginStore } from "../../../../common-ui";

export interface FeedListEntryNewUserProps {
    readonly item: FeedItem;
}

@observer @external
export class FeedListEntryNewUser extends React.Component<FeedListEntryNewUserProps> {
    @inject private users: UsersStore;
    @inject private login: LoginStore;
    @inject private browserHistory: History;

    @bind
    private toUser() {
        this.browserHistory.push(routeUser.path(this.props.item.user.id));
    }

    public render() {
        const { event, user, game, date } = this.props.item;
        const avatar = this.users.avatarById(user.id);
        const ago = formatDistance(date, new Date());
        const name = user.id === this.login.userId ? "You" : user.name;
        return (
            <Feed.Event>
                <Feed.Label>
                    <Image circular src={avatar} />
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Feed.User onClick={this.toUser}>{name}</Feed.User> joined <Feed.Date>{ago} ago</Feed.Date>
                    </Feed.Summary>
                </Feed.Content>
            </Feed.Event>
        );
    }
}
