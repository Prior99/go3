import * as React from "react";
import * as css from "./dashboard.scss";
import { requireLogin } from "utils";
import { Content } from "ui";
import { inject, external } from "tsdi";
import { GamesStore } from "store";
import { GamesList } from "ui";
import { observer } from "mobx-react";

@requireLogin @external @observer
export class PageDashboard extends React.Component {
    @inject private games: GamesStore;

    public render() {
        return (
            <Content>
                <GamesList games={this.games.all}/>
            </Content>
        );
    }
}
