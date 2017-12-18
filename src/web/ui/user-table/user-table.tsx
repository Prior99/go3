import * as React from "react";
import { Table } from "semantic-ui-react";
import { observer } from "mobx-react";

import { User } from "../../../models";

export interface UserTableProps {
    readonly user: User;
}

@observer
export class UserTable extends React.Component<UserTableProps> {
    public render() {
        const { name, created, id, email } = this.props.user;
        const guardedEmail = email ? email : "Hidden";
        return (
            <Table>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Name</Table.Cell>
                        <Table.Cell>{name}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Email</Table.Cell>
                        <Table.Cell>{guardedEmail}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Joined</Table.Cell>
                        <Table.Cell>{created.toLocaleDateString()}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Id</Table.Cell>
                        <Table.Cell>{id}</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        );
    }
}
