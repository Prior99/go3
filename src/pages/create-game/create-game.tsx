import * as React from "react";
import { observable, action } from "mobx";
import { bind } from "bind-decorator";
import { observer } from "mobx-react";
import { requireLogin } from "utils";
import { Content, UserSelect, BoardSizeSelect } from "ui";
import { Button, Form } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { GamesStore } from "../../store";

@requireLogin @observer @external
export class PageCreateGame extends React.Component {
    @inject private gamesStore: GamesStore;

    @observable private userId: string;
    @observable private size: number;

    @bind @action private handleUserId(userId: string) { this.userId = userId; }
    @bind @action private handleBoardSize(size: number) { this.size = size; }
    @bind private async handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        await this.gamesStore.createGame(this.userId, this.size);
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
                    <Button type="submit" fluid color="green">Create Game</Button>
                </Form>
            </Content>
        );
    }
}
