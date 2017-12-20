import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Feed } from "semantic-ui-react";

import { FeedStore } from "../../../common-ui";
import { FeedListEntry } from "./feed-list-entry";
import * as css from "./feed-list.scss";

@external @observer
export class FeedList extends React.Component {
    @inject private feed: FeedStore;

    public render() {
        return (
            <Feed className={css.feed}>
                {this.feed.all.map((item, index) => <FeedListEntry item={item} key={index} />)}
            </Feed>
        );
    }
}
