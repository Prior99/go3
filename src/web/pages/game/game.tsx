import * as React from "react";
import { computed, action } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { bind } from "bind-decorator";
import { Segment } from "semantic-ui-react";

import { requireLogin, GamesStore  } from "../../../common-ui";
import { Content, Board, GameHistory, GameStatus } from "../../components";
import * as css from "./game.scss";

export interface PageGameProps {
    readonly match: {
        readonly params: {
            readonly id: string;
        };
    };
}

@requireLogin @external @observer
export class PageGame extends React.Component<PageGameProps> {
    @inject private games: GamesStore;

    private get id() { return this.props.match.params.id; }
    @computed private get game() { return this.games.byId(this.id); }
    @computed private get boardState() {
        return this.game.currentBoard ? this.game.currentBoard.state : undefined;
    }

    @bind @action private async place(index: number) {
        await this.games.turn(this.game, index);
    }

    public render() {
        const game = this.games.byId(this.id);
        if (!game || !game.currentBoard) {
            return <Content>Loading</Content>;
        }
        return (
            <Content>
                <div className={css.container}>
                    <div className={css.game}>
                        <GameStatus />
                        <div >
                            {
                                game.boards && game.boards.length > 0 &&
                                <Segment className={css.boardContainer}>
                                    <Board
                                        game={game}
                                        onPlace={this.place}
                                    />
                                </Segment>
                            }
                        </div>
                    </div>
                    <div className={css.sidebar}>
                        <GameHistory />
                    </div>
                </div>
            </Content>
        );
    }
}
