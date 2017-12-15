import * as React from "react";
import { Menu } from "semantic-ui-react";
import { Game } from "models";
import { observer } from "mobx-react";
import { formatBoardSize } from "board-sizes";
import { Color } from "board-color";
import { external, inject } from "tsdi";
import { computed } from "mobx/lib/mobx";
import { History } from "history";
import { routeGame } from "routing";
import { bind } from "bind-decorator";
import * as css from "./games-list-item.scss";
import { PreviewBoard } from "ui";

export interface GamesListItemProps {
    readonly game: Game;
}

@observer @external
export class GamesListItem extends React.Component<GamesListItemProps> {
    @inject private browserHistory: History;

    @bind private handleClick() {
        this.browserHistory.push(routeGame.path(this.props.game.id));
    }

    public render() {
        const { game } = this.props;
        if (!game) {
            return null; // tslint:disable-line
        }
        const { currentBoard: board, whiteUser, blackUser } = game;
        if (!board) {
            return null; // tslint:disable-line
        }
        return (
            <Menu.Item onClick={this.handleClick}>
                <h3>{whiteUser.name} vs {blackUser.name}</h3>
                <div className={css.flexContainer}>
                    <div className={css.boardContainer}>
                        <PreviewBoard board={board} />
                    </div>
                    <div className={css.textContainer}>
                        <p><b>Turn:</b> {board.turn}</p>
                        <p><b>Prisoners white:</b> {board.prisonersWhite}</p>
                        <p><b>Score white:</b> {board.getScore(Color.WHITE)}</p>
                        <p><b>Prisoners black:</b> {board.prisonersBlack}</p>
                        <p><b>Score black:</b> {board.getScore(Color.BLACK)}</p>
                        <p><b>Date:</b> {board.created}</p>
                    </div>
                </div>
            </Menu.Item>
        );
    }
}
