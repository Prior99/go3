import { formatRank } from "../../../utils";
import * as React from "react";
import { Sidebar, Menu, Icon, Dropdown } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { History } from "history";

import { SidebarStore, OwnUserStore, LoginStore, GamesStore } from "../../store";
import { Errors } from "..";
import { routeGame, routeGames, routeDashboard } from "../../routing";
import * as css from "./style.scss";

@external @observer
export class AppBar extends React.Component {
    @inject private sidebar: SidebarStore;
    @inject private ownUser: OwnUserStore;
    @inject private login: LoginStore;
    @inject private games: GamesStore;
    @inject private browserHistory: History;

    @computed private get sidebarButtonVisible() { return !this.sidebar.alwaysOpen && this.login.loggedIn; }

    public render() {
        const { userStats, user } = this.ownUser;
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
                    {
                        userStats && user && [
                            <Menu.Item
                                icon="clock"
                                content={`${userStats.active} Active`}
                                key="active"
                                onClick={() => this.browserHistory.push(routeGames.path())}
                            />,
                            <Dropdown
                                item
                                text={`${this.games.possibleTurns.length} Possible Turns`}
                                key="turns"
                            >
                                <Dropdown.Menu>
                                    <Dropdown.Header>Games</Dropdown.Header>
                                    {
                                        this.games.possibleTurns.map(game => (
                                            <Dropdown.Item
                                                key={game.id}
                                                content={this.games.format(game)}
                                                onClick={() => this.browserHistory.push(routeGame.path(game.id))}
                                            />
                                        ))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>,
                        ]
                    }
                </Menu.Menu>
                <Menu.Menu position="right">
                    {
                        userStats && user && [
                            <Menu.Item
                                icon="group"
                                content={`${userStats.friends} Friends`}
                                key="friends"
                            />,
                            <Menu.Item
                                icon="star"
                                content={formatRank(user.rating)}
                                key="rating"
                                onClick={() => this.browserHistory.push(routeDashboard.path())}
                            />,
                            <Menu.Item
                                icon="user"
                                content={this.ownUser.user.email}
                                key="user"
                            />,
                        ]
                    }
                </Menu.Menu>
            </Menu>
        );
    }
}
