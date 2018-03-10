import * as React from "react";
import { observer } from "mobx-react";
import { observable, computed, action } from "mobx";
import { inject, external } from "tsdi";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { bindAll } from "lodash-decorators";

import { User } from "../../../common";
import { UsersStore } from "../../../common-ui";

export interface UserSelectProps {
    readonly userId?: string;
    readonly onChange?: (userId: string) => void;
}

@external @observer
@bindAll()
export class UserSelect extends React.Component<UserSelectProps> {
    @inject private users: UsersStore;

    @observable private query: string;

    private search(query: string) {
        this.query = query;
        this.users.searchUsers(query);
    }

    @computed private get userOptions() {
        return this.users.all.map(user => ({
            text: user.name,
            value: user.id,
        }));
    }

    @action private handleSearchChange(_, { searchQuery }: DropdownProps) {
        this.search(searchQuery);
    }

    @action private handleIdChange(_, { value }: DropdownProps) {
        const { onChange } = this.props;
        if (!onChange) { return; }
        onChange(value as string);
    }

    public render() {
        return (
            <Dropdown
                placeholder="Username"
                value={this.props.userId}
                onChange={this.handleIdChange}
                onSearchChange={this.handleSearchChange}
                search
                selection
                loading={this.users.loading}
                options={this.userOptions}
            />
        );
    }
}
