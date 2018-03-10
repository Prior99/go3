import { observable, computed, action } from "mobx";
import { bindAll } from "lodash-decorators";
import { component, initialize, inject } from "tsdi";

import { FeedItem, Feed } from "../../common";

@component @bindAll()
export class FeedStore {
    @inject private feed: Feed;

    @observable private feedItems: FeedItem[] = [];

    @initialize @action
    public async loadFeed() {
        this.feedItems = await this.feed.getFeed();
    }

    @computed public get all() {
        return this.feedItems;
    }
}
