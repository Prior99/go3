import * as React from "react";
import { Menu, Table, Label, Segment, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { computed } from "mobx";
import { History } from "history";
import { bindAll } from "lodash-decorators";
import { formatDistance } from "date-fns";

import { Game, Color, formatBoardSize, oppositeColor, formatRank } from "../../../../common";
import { PreviewBoard, Infos, InfoName, InfoValue } from "../..";
import * as css from "./games-list-item.scss";
import { routeGame, GamesStore, LoginStore } from "../../../../common-ui";

export interface GamesListItemProps {
    readonly game: Game;
    readonly mini?: boolean;
}

@observer @external
@bindAll()
export class GamesListItem extends React.Component<GamesListItemProps> {
    @inject private browserHistory: History;
    @inject private login: LoginStore;

    private handleClick() {
        this.browserHistory.push(routeGame.path(this.props.game.id));
    }

    public render() {
        const { game, mini } = this.props;
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
                    {
                        !mini && (
                            <div className={css.boardContainer}>
                                <PreviewBoard board={board} />
                            </div>
                        )
                    }
                    <div className={css.info}>
                        <Infos>
                            <InfoName>Turn</InfoName>
                            <InfoValue>{board.turn}</InfoValue>
                            <InfoName>Last turn</InfoName>
                            <InfoValue>{formatDistance(board.created, new Date())} ago</InfoValue>
                            <InfoName>Opponent</InfoName>
                            <InfoValue>{otherUser.name} ({formatRank(otherUser.rating)})</InfoValue>
                        </Infos>
                    </div>
                </div>
            </Segment>
    );
    }
}
