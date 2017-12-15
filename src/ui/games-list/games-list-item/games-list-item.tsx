import * as React from "react";
import { Menu, Table } from "semantic-ui-react";
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
                    <div className={css.firstTable}>
                        <Table basic>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Turn</Table.HeaderCell>
                                    <Table.HeaderCell>Last turn</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>{board.turn}</Table.Cell>
                                    <Table.Cell>{game.created.toLocaleString()}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                    <div className={css.secondTable}>
                        <Table definition basic>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell></Table.HeaderCell>
                                    <Table.HeaderCell>Black</Table.HeaderCell>
                                    <Table.HeaderCell>White</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>Prisoners</Table.Cell>
                                    <Table.Cell>{board.prisonersBlack}</Table.Cell>
                                    <Table.Cell>{board.prisonersWhite}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>Score</Table.Cell>
                                    <Table.Cell>{board.getScore(Color.BLACK)}</Table.Cell>
                                    <Table.Cell>{board.getScore(Color.WHITE)}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            </Menu.Item>
        );
    }
}
