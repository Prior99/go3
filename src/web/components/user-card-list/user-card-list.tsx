import * as React from "react";
import { Card } from "semantic-ui-react";

import { User } from "../../../common";
import { UserCard } from "../";

export interface UserCardListProps {
    readonly users: User[];
    readonly children?: JSX.Element;
}

export class UserCardList extends React.Component<UserCardListProps> {
    public render() {
        return (
            <Card.Group>
                {this.props.users.map(user => <UserCard user={user} key={user.id} />)}
                {this.props.children}
            </Card.Group>
        );
    }
}
