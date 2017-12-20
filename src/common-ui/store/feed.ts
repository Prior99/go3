import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { component, initialize, inject } from "tsdi";

import { FeedItem, Feed } from "../../common";

@component
export class FeedStore {
    @inject private feed: Feed;

    @observable private feedItems: FeedItem[] = [];

    @initialize @bind @action
    public async loadFeed() {
        this.feedItems = await this.feed.getFeed();
    }

    @computed public get all() {
        return this.feedItems;
    }
}
