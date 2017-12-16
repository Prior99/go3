import * as React from "react";
import { observer } from "mobx-react";
import { Table } from "semantic-ui-react";

import { requireLogin } from "../../utils";
import { Content, GamesList, UserStats } from "../../ui";
import { inject, external } from "tsdi";
import { GamesStore, OwnUserStore } from "../../store";
import * as css from "./dashboard.scss";

@requireLogin @external @observer
export class PageDashboard extends React.Component {
    @inject private games: GamesStore;
    @inject private ownUser: OwnUserStore;

    public render() {
        if (!this.ownUser.user) {
            return null;
        }
        const { user } = this.ownUser;
        const { id, name, email, created } = user;
        return (
            <Content>
                <h1>Dashboard</h1>
                <UserStats userId={this.ownUser.user.id} />
                <Table>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Name</Table.Cell>
                            <Table.Cell>{name}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Email</Table.Cell>
                            <Table.Cell>{email}</Table.Cell>
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
            </Content>
        );
    }
}
