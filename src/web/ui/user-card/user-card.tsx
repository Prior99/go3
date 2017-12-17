import * as React from "react";
import { Card, Button } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed, action } from "mobx";

import { User } from "../../../models";
import { formatRank } from "../../../utils";
import { OwnUserStore } from "../../store";

export interface UserCardProps {
    readonly user: User;
}

@external @observer
export class UserCard extends React.Component<UserCardProps> {
    @inject private ownUser: OwnUserStore;

    @computed private get followedByCurrentUser() {
        return Boolean (this.ownUser.followershipByFollowingId(this.props.user.id));
    }

    @computed private get followsCurrentUser() {
        return Boolean (this.ownUser.followershipByFollowerId(this.props.user.id));
    }

    public render() {
        const { followedByCurrentUser, followsCurrentUser } = this;
        const { name, rating } = this.props.user;
        const rank = formatRank(rating);
        return (
            <Card>
                <Card.Content>
                    <Card.Header>{name}</Card.Header>
                    <Card.Meta>{rank}</Card.Meta>
                </Card.Content>
                <Card.Content extra>
                {
                    this.followedByCurrentUser ? (
                        <Button basic color="red" icon="remove">Unfollow</Button>
                    ) : (
                        <Button basic color="green" icon="add">Follow</Button>
                    )
                }
                </Card.Content>
            </Card>
        );
    }
}
