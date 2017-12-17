import * as React from "react";
import { observer } from "mobx-react";
import { observable, action, computed } from "mobx";
import { Form, Button, Card } from "semantic-ui-react";
import { bind } from "bind-decorator";

import { requireLogin } from "../../utils";
import { Content, UserCardList, UserSelect } from "../../ui";
import { inject, external } from "tsdi";
import { OwnUserStore } from "../../store";

@requireLogin @external @observer
export class PageFollow extends React.Component {
    @inject private ownUser: OwnUserStore;

    @observable private userId: string;

    @bind @action private handleUserId(userId: string) { this.userId = userId; }
    @bind private async handleAddFollowing(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        await this.ownUser.addFollowing(this.userId);
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
        return allFollowers.map(followership => followership.followed);
    }

    public render() {
        const { user } = this.ownUser;
        if (!user) {
            return null;
        }
        const { followerUsers, followingUsers } = this;
        return (
            <Content>
                <h1>Following</h1>
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
                <h1>Followers</h1>
                <UserCardList users={followerUsers} />
            </Content>
        );
    }
}
