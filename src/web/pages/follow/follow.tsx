import * as React from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import { Form, Button } from "semantic-ui-react";
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

    public render() {
        const { user, allFollowing, allFollowers } = this.ownUser;
        if (!user || !allFollowing || !allFollowers) {
            return null;
        }
        return (
            <Content>
                <h1>Following</h1>
                <UserCardList users={allFollowing} />
                <Form onSubmit={this.handleAddFollowing}>
                    <Form.Field>
                        <UserSelect onChange={this.handleUserId} userId={this.userId} />
                    </Form.Field>
                    <Button type="submit" fluid color="green">Follow</Button>
                </Form>
                <h1>Followers</h1>
                <UserCardList users={allFollowers} />
            </Content>
        );
    }
}
