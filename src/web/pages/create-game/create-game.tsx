import * as React from "react";
import { observable, action, computed } from "mobx";
import { bindAll } from "lodash-decorators";
import { observer } from "mobx-react";
import { Button, Form } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { History } from "history";

import { routeGame, requireLogin, GamesStore } from "../../../common-ui";
import { Content, UserSelect, BoardSizeSelect } from "../../components";

@requireLogin @observer @external
@bindAll()
export class PageCreateGame extends React.Component {
    @inject private gamesStore: GamesStore;
    @inject private browserHistory: History;

    @observable private userId: string;
    @observable private size: number;

    @action private handleUserId(userId: string) { this.userId = userId; }
    @action private handleBoardSize(size: number) { this.size = size; }
    private async handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const game = await this.gamesStore.createGame(this.userId, this.size);
        this.browserHistory.push(routeGame.path(game.id));
    }
    @computed private get allValid() {
        return Boolean(this.userId && this.size);
    }

    public render() {
        return (
            <Content>
                <h1>Create new game</h1>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <UserSelect onChange={this.handleUserId} userId={this.userId} />
                    </Form.Field>
                    <Form.Field>
                        <BoardSizeSelect onChange={this.handleBoardSize} size={this.size} />
                    </Form.Field>
                    <Button type="submit" disabled={!this.allValid} fluid color="green">Create Game</Button>
                </Form>
            </Content>
        );
    }
}
