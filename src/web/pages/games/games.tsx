import * as React from "react";
import { observer } from "mobx-react";
import { Statistic, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { requireLogin } from "../../utils";
import { Content, GamesList } from "../../ui";
import { inject, external } from "tsdi";
import { GamesStore, OwnUserStore } from "../../store";
import { routeCreateGame } from "../../routing";

@requireLogin @external @observer
export class PageGames extends React.Component {
    @inject private games: GamesStore;
    @inject private ownUser: OwnUserStore;

    public render() {
        return (
            <Content>
                <h1>Games</h1>
                {
                    this.ownUser.userStats && (
                        <Statistic.Group>
                            <Statistic label="Active" value={this.ownUser.userStats.active} />
                            <Statistic label="Completed" value={this.ownUser.userStats.inactive} />
                        </Statistic.Group>
                    )
                }
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
