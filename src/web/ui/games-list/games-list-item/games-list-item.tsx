import * as React from "react";
import { Menu, Table, Label, Segment, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { computed } from "mobx";
import { History } from "history";
import { bind } from "bind-decorator";
import { formatDistance } from "date-fns";

import { Color, formatBoardSize, oppositeColor, formatRank } from "../../../../utils";
import { Game } from "../../../../models";
import { routeGame } from "../../../routing";
import { PreviewBoard } from "../..";
import * as css from "./games-list-item.scss";
import { GamesStore, LoginStore } from "../../../store";

export interface GamesListItemProps {
    readonly game: Game;
}

@observer @external
export class GamesListItem extends React.Component<GamesListItemProps> {
    @inject private browserHistory: History;
    @inject private login: LoginStore;

    @bind private handleClick() {
        this.browserHistory.push(routeGame.path(this.props.game.id));
    }

    public render() {
        const { game } = this.props;
        if (!game) {
            return null;
        }
        const { currentBoard: board, whiteUser, blackUser } = game;
        if (!board) {
            return null;
        }
        const otherUser = game.getOpponent(this.login.userId);
        return (
            <Segment onClick={this.handleClick} padded={false} className={css.listItem}>
                {
                    board.currentColor === game.getColorForUser(this.login.userId) && (
                        <Label ribbon="right" color="red" className={css.label}>Your Turn</Label>
                    )
                }
                <div className={css.flexContainer}>
                    <div className={css.boardContainer}>
                        <PreviewBoard board={board} />
                    </div>
                    <div className={css.info}>
                        <div className={css.name}>Turn</div>
                        <div className={css.value}>{board.turn}</div>
                        <div className={css.name}>Last turn</div>
                        <div className={css.value}>{formatDistance(board.created, new Date())} ago</div>
                        <div className={css.name}>Opponent</div>
                        <div className={css.value}>{otherUser.name} ({formatRank(otherUser.rating)})</div>
                    </div>
                </div>
            </Segment>
    );
    }
}
