import * as React from "react";
import { observer } from "mobx-react";

import { requireLogin } from "../../utils";
import { Content, FeedList } from "../../ui";
import { inject, external } from "tsdi";
import { GamesStore, OwnUserStore } from "../../store";

@requireLogin @external @observer
export class PageFeed extends React.Component {
    @inject private games: GamesStore;
    @inject private ownUser: OwnUserStore;

    public render() {
        if (!this.ownUser.user) {
            return null;
        }
        const { user } = this.ownUser;
        const { id, name, email, created } = user;
        return (
            <Content>
                <h1>Feed</h1>
                <FeedList />
            </Content>
        );
    }
}
