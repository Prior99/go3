import * as React from "react";
import { observer } from "mobx-react";
import { Feed } from "semantic-ui-react";

import { FeedItem } from "../../../../models";

export interface FeedListEntryProps {
    readonly item: FeedItem;
}

@observer
export class FeedListEntry extends React.Component<FeedListEntryProps> {
    public render() {
        return (
            <Feed>
            </Feed>
        );
    }
}
