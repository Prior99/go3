import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { observable } from "mobx";
import { bind } from "bind-decorator";
import { Menu } from "semantic-ui-react";

import { requireLogin } from "../../utils";
import { Content, GamesList, FeedList, OwnUserCard } from "../../ui";
import { GamesStore, LoginStore } from "../../store";
import * as css from "./dashboard.scss";

enum PageDashboardTab {
    FEED = "feed",
}

@requireLogin @observer @external
export class PageDashboard extends React.Component {
    @inject private games: GamesStore;
    @inject private login: LoginStore;

    @observable private tab = PageDashboardTab.FEED;

    @bind private handleTab(_, { name }) {
        this.tab = name === "Feed" ? PageDashboardTab.FEED :
            undefined;
    }

    public render() {
        return (
            <Content>
                <div className={css.container}>
                    <div className={css.feed}>
                        <Menu tabular>
                            <Menu.Item
                                name="Activities"
                                active={this.tab === PageDashboardTab.FEED}
                                onClick={this.handleTab}
                            />
                        </Menu>
                        {
                            this.tab === PageDashboardTab.FEED ? (
                                <FeedList />
                            ) : null
                        }
                    </div>
                    <div className={css.side}>
                        <OwnUserCard />
                        <GamesList mini games={this.games.all.filter(game => !game.over)}/>
                    </div>
                </div>
            </Content>
        );
    }
}
