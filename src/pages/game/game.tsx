import * as React from "react";
import { requireLogin } from "utils";
import { Content } from "ui";
import { inject, external } from "tsdi";
import { GamesStore } from "store";
import { GamesList, Board } from "ui";
import { observer } from "mobx-react";
import { computed, action } from "mobx";
import { bind } from "bind-decorator";

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
                <h1>Game</h1>
                <p>{game.description}</p>
                {
                    game.boards && game.boards.length > 0 &&
                    <Board
                        state={this.boardState}
                        size={game.boardSize}
                        onPlace={this.place}
                    />
                }
            </Content>
        );
    }
}
