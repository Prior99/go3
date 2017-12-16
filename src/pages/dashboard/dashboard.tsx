import * as React from "react";
import { observer } from "mobx-react";

import { requireLogin } from "../../utils";
import { Content, GamesList } from "../../ui";
import { inject, external } from "tsdi";
import { GamesStore } from "../../store";

import * as css from "./dashboard.scss";

@requireLogin @external @observer
export class PageDashboard extends React.Component {
    @inject private games: GamesStore;

    public render() {
        return (
            <Content>
                <h1>Games</h1>
                <GamesList games={this.games.all}/>
            </Content>
        );
    }
}
