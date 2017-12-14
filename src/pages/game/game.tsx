import * as React from "react";
import { requireLogin } from "utils";
import { Content } from "ui";
import { inject, external } from "tsdi";
import { GamesStore } from "store";
import { GamesList, Board } from "ui";
import { observer } from "mobx-react";
import { computed, action } from "mobx";
import { bind } from "bind-decorator";
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
        if (!game) {
            return <Content>Loading</Content>;
        }
        return (
            <Content>
                <div className={css.container}>
                    <div className={css.game}>
                        <h1>Game</h1>
                        <p>{game.description}</p>
                        <div className={css.boardContainer}>
                        {
                            game.boards && game.boards.length > 0 &&
                            <Board
                                state={this.boardState}
                                size={game.boardSize}
                                onPlace={this.place}
                            />
                        }
                        </div>
                    </div>
                    <div className={css.sidebar}>
                        <h2>Lol</h2>
                        <p>Lorem ipsum dolor sit amed.</p>
                        <p>Edipiscir eunt.</p>
                    </div>
                </div>
            </Content>
        );
    }
}
