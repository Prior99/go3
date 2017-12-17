import * as React from "react";
import { Card } from "semantic-ui-react";

import { User } from "../../../models";
import { UserCard } from "../";

export interface UserCardListProps {
    readonly users: User[];
}

export class UserCardList extends React.Component<UserCardListProps> {
    public render() {
        return (
            <Card.Group>
                {this.props.users.map(user => <UserCard user={user} key={user.id} />)}
            </Card.Group>
        );
    }
}
