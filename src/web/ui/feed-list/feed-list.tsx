import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Feed } from "semantic-ui-react";

import { FeedStore } from "../../store";
import { FeedListEntry } from "./feed-list-entry";

@external @observer
export class FeedList extends React.Component {
    @inject private feed: FeedStore;

    public render() {
        return (
            <Feed>
                {this.feed.all.map((item, index) => <FeedListEntry item={item} key={index} />)}
            </Feed>
        );
    }
}
