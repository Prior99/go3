import * as React from "react";
import { observer } from "mobx-react";

import { requireLogin } from "../../utils";
import { Content, GamesList, UserStats, UserTable, UserCharts } from "../../ui";
import { inject, external } from "tsdi";
import { OwnUserStore } from "../../store";

@requireLogin @external @observer
export class PageDashboard extends React.Component {
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
                <UserStats userId={id} />
                <UserCharts userId={id} />
                <UserTable user={user} />
            </Content>
        );
    }
}
