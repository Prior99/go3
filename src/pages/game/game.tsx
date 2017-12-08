import * as React from "react";
import { requireLogin } from "utils";
import { Content } from "ui";
import { inject, external } from "tsdi";
import { GamesStore } from "store";
import { GamesList } from "ui";
import { observer } from "mobx-react";
import { computed } from "mobx";

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

    public render() {
        return (
            <Content>
                <h1>Game</h1>
            </Content>
        );
    }
}
