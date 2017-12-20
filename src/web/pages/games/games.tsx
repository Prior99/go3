import * as React from "react";
import { observer } from "mobx-react";
import { Statistic, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { routeCreateGame, requireLogin, GamesStore, OwnUserStore } from "../../../common-ui";
import { Content, GamesList } from "../../components";
import { inject, external } from "tsdi";

@requireLogin @external @observer
export class PageGames extends React.Component {
    @inject private games: GamesStore;
    @inject private ownUser: OwnUserStore;

    public render() {
        return (
            <Content>
                {
                    this.ownUser.userStats && (
                        <Statistic.Group>
                            <Statistic label="Active" value={this.ownUser.userStats.active} />
                            <Statistic label="Completed" value={this.ownUser.userStats.inactive} />
                        </Statistic.Group>
                    )
                }
                <br />
                {
                    this.games.all.length > 0 ? (
                        <GamesList games={this.games.all}/>
                    ) : (
                        <Segment>
                            <p>
                                No active games. <Link to={routeCreateGame.path()}>Create a new game</Link>.
                            </p>
                        </Segment>
                    )
                }
            </Content>
        );
    }
}
