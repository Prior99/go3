import * as React from "react";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { bind } from "bind-decorator";

import { Content, UserStats, UserCharts, UserTable } from "../../ui";
import { UsersStore } from "../../store";

export interface PageUserProps {
    readonly match: {
        readonly params: {
            readonly id: string;
        };
    };
}

@external @observer
export class PageUser extends React.Component<PageUserProps> {
    @inject private users: UsersStore;

    private get id() { return this.props.match.params.id; }
    @computed private get user() { return this.users.byId(this.id); }

    public render() {
        const { user } = this;
        if (!user) {
            return null;
        }
        const { name, id } = user;
        return (
            <Content>
                <h1>{name}</h1>
                <br />
                <UserStats userId={id} />
                <br />
                <UserTable user={user} />
                <br />
                <UserCharts userId={id} />
            </Content>
        );
    }
}
