import * as React from "react";
import { Sidebar, Menu, Icon } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";

import { SidebarStore, OwnUserStore, LoginStore } from "../../store";
import { Errors } from "..";
import * as css from "./style.scss";

@external @observer
export class AppBar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private ownUser: OwnUserStore;
    @inject private login: LoginStore;

    @computed private get sidebarButtonVisible() { return !this.sidebar.alwaysOpen && this.login.loggedIn; }

    public render() {
        return (
            <Menu color="green" inverted className={css.appBar} attached>
                <Menu.Menu position={"left" as "right"}>
                    {
                        this.sidebarButtonVisible &&
                        <Menu.Item
                            icon="bars"
                            onClick={this.sidebar.toggleVisibility}
                        />
                    }
                    <Menu.Item content="Go3" />
                </Menu.Menu>
                <Menu.Menu position="right">
                    {
                        this.ownUser.user &&
                        <Menu.Item>
                            <Icon name="user" />
                            {this.ownUser.user.email}
                        </Menu.Item>
                    }
                </Menu.Menu>
            </Menu>
        );
    }
}
