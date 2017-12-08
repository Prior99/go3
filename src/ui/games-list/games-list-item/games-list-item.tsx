import * as React from "react";
import { List } from "semantic-ui-react";
import { Game } from "models";
import { observer } from "mobx-react";

export interface GamesListItemProps {
    readonly game: Game;
}

@observer
export class GamesListItem extends React.Component<GamesListItemProps> {
    public render() {
        const { participants, boardSize } = this.props.game;
        return (
            <List.Item>
            {boardSize}
            </List.Item>
        );
    }
}
