import * as React from "react";
import { observer } from "mobx-react";

import { FeedItem, FeedEvent } from "../../../../models";
import { FeedListEntryNewUser } from "./new-user";
import { FeedListEntryGameOver } from "./game-over";
import { FeedListEntryRankChange } from "./rank-change";

export interface FeedListEntryProps {
    readonly item: FeedItem;
}

@observer
export class FeedListEntry extends React.Component<FeedListEntryProps> {
    public render() {
        const { item } = this.props;
        switch (item.event) {
            case FeedEvent.GAME_OVER: return <FeedListEntryGameOver item={item} />;
            case FeedEvent.NEW_USER: return <FeedListEntryNewUser item={item} />;
            case FeedEvent.RANK_CHANGE: return <FeedListEntryRankChange item={item} />;
            default: return null;
        }
    }
}
