import * as React from "react";
import { Card, Button, Form, Image } from "semantic-ui-react";
import { inject, external } from "tsdi";
import { observer } from "mobx-react";
import { computed, action, observable } from "mobx";
import { bind } from "bind-decorator";
import { History } from "history";

import { User, formatRank } from "../../../common";
import { routeGame, routeUser, OwnUserStore, GamesStore, UsersStore } from "../../../common-ui";
import { BoardSizeSelect } from "..";

export interface UserCardProps {
    readonly user: User;
}

@external @observer
export class UserCard extends React.Component<UserCardProps> {
    @inject private ownUser: OwnUserStore;
    @inject private games: GamesStore;
    @inject private browserHistory: History;
    @inject private users: UsersStore;

    @observable private createGameVisible = false;
    @observable private size: number;

    @computed private get followedByCurrentUser() {
        return Boolean(this.ownUser.followershipByFollowingId(this.props.user.id));
    }

    @computed private get followsCurrentUser() {
        return Boolean(this.ownUser.followershipByFollowerId(this.props.user.id));
    }

    @computed private get createGameValid() {
        return Boolean(this.size);
    }

    @computed private get user() { return this.users.byId(this.props.user.id); }
    @computed private get avatar() { return this.user && this.user.avatarUrl; }

    @bind @action private async unfollow() { await this.ownUser.removeFollowing(this.props.user.id); }
    @bind @action private async follow() { await this.ownUser.addFollowing(this.props.user.id); }
    @bind @action private togglePlay() { this.createGameVisible = !this.createGameVisible; }
    @bind @action private handleBoardSize(size: number) { this.size = size; }
    @bind @action private async handleCreateGame(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const game = await this.games.createGame(this.props.user.id, this.size);
        this.browserHistory.push(routeGame.path(game.id));
    }

    @bind private toUser() {
        this.browserHistory.push(routeUser.path(this.props.user.id));
    }

    public render() {
        const { followedByCurrentUser, followsCurrentUser, avatar } = this;
        const { name, rating } = this.props.user;
        const rank = formatRank(rating);
        return (
            <Card>
                <Card.Content>
                    <Image floated="right" size="mini" src={avatar} />
                    <Card.Header><a onClick={this.toUser}>{name}</a></Card.Header>
                    <Card.Meta>{rank}</Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <Button.Group fluid>
                        {
                            this.followedByCurrentUser ? (
                                <Button color="red" icon="remove" onClick={this.unfollow} content="Unfollow" />
                            ) : (
                                <Button color="green" icon="add" onClick={this.follow} content="Follow" />
                            )
                        }
                        <Button color="blue" onClick={this.togglePlay} content="Play" />
                    </Button.Group>
                </Card.Content>
                {
                    this.createGameVisible && (
                        <Card.Content extra>
                            <Form onSubmit={this.handleCreateGame}>
                                <Form.Field>
                                    <BoardSizeSelect size={this.size} onChange={this.handleBoardSize} />
                                </Form.Field>
                                <Button
                                    type="submit"
                                    fluid
                                    disabled={!this.createGameValid}
                                    color="green"
                                    content="Create Game"
                                />
                            </Form>
                        </Card.Content>
                    )
                }
            </Card>
        );
    }
}
