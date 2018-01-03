import * as React from "react";
import { observer } from "mobx-react";
import { observable, action, computed } from "mobx";
import { Form, Button, Card, Menu } from "semantic-ui-react";
import { bind } from "decko";

import { requireLogin, OwnUserStore  } from "../../../common-ui";
import { Content, UserCardList, UserSelect } from "../../components";
import { inject, external } from "tsdi";

enum PageFollowTab {
    FOLLOWERS = "followers",
    FOLLOWING = "following",
}

@requireLogin @external @observer
export class PageFollow extends React.Component {
    @inject private ownUser: OwnUserStore;

    @observable private userId: string;
    @observable private tab = PageFollowTab.FOLLOWING;

    @bind @action private handleUserId(userId: string) { this.userId = userId; }

    @bind private async handleAddFollowing(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        await this.ownUser.addFollowing(this.userId);
    }

    @bind private handleTab(_, { name }) {
        this.tab = name === "Following" ? PageFollowTab.FOLLOWING :
            name === "Followers" ? PageFollowTab.FOLLOWERS :
            undefined;
    }

    @computed private get followingUsers() {
        const { allFollowing } = this.ownUser;
        if (!allFollowing) {
            return [];
        }
        return allFollowing.map(followership => followership.followed);
    }

    @computed private get followerUsers() {
        const { allFollowers } = this.ownUser;
        if (!allFollowers) {
            return [];
        }
        return allFollowers.map(followership => followership.follower);
    }

    public render() {
        const { user } = this.ownUser;
        if (!user) {
            return null;
        }
        const { followerUsers, followingUsers } = this;
        return (
            <Content>
                <Menu tabular>
                    <Menu.Item
                        name="Following"
                        active={this.tab === PageFollowTab.FOLLOWING}
                        onClick={this.handleTab}
                    />
                    <Menu.Item
                        name="Followers"
                        active={this.tab === PageFollowTab.FOLLOWERS}
                        onClick={this.handleTab}
                    />
                </Menu>
                {
                    this.tab === PageFollowTab.FOLLOWING ? (
                        <UserCardList users={followingUsers}>
                            <Card>
                                <Card.Content>
                                    <Card.Header>Follow</Card.Header>
                                    <Form onSubmit={this.handleAddFollowing}>
                                        <Form.Field>
                                            <UserSelect onChange={this.handleUserId} userId={this.userId} />
                                        </Form.Field>
                                        <Button type="submit" fluid color="green">Follow</Button>
                                    </Form>
                                </Card.Content>
                            </Card>
                        </UserCardList>
                    ) : this.tab === PageFollowTab.FOLLOWERS ? (
                        <UserCardList users={followerUsers} />
                    ) : null
                }
            </Content>
        );
    }
}
