import * as React from "react";
import { computed, action, observable } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import { bind } from "decko";
import { Form, Button, Input, Dropdown } from "semantic-ui-react";

import { Content } from "../../components";
import { OwnUserStore } from "../../../common-ui";
import { Users, RenderingStrategy } from "../../../common";

import * as iconClassic from "./classic.png";
import * as iconModern from "./modern.png";

@external @observer
export class PageSettings extends React.Component {
    @inject private ownUser: OwnUserStore;

    @observable private password = "";
    @observable private repeat = "";
    @observable private selectedStrategy: RenderingStrategy;

    @computed private get renderingStrategy() {
        if (typeof this.selectedStrategy === "undefined") {
            return this.ownUser.user && this.ownUser.user.renderingStrategy;
        }
        return this.selectedStrategy;
    }

    @bind @action private handleSelectStrategy(_, { value }: { value: RenderingStrategy }) {
        this.selectedStrategy = value;
    }
    @bind @action private handlePassword({ target }: React.SyntheticInputEvent) { this.password = target.value; }
    @bind @action private handleRepeat({ target }: React.SyntheticInputEvent) { this.repeat = target.value; }
    @bind private async handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        await this.ownUser.updateUser(this.password || undefined, this.renderingStrategy);
        this.password = "";
        this.repeat = "";
    }

    @computed private get repeatValid() { return this.repeat === this.password; }
    @computed private get passwordValid() { return this.password.length >= 8 || this.password.length === 0; }
    @computed private get allValid() {
        return this.repeatValid && this.passwordValid;
    }

    public render() {
        const { renderingStrategy } = this;
        return (
            <Content>
                <h1>Settings</h1>
                <Form size="large" onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Dropdown
                            selection
                            placeholder="Board Rendering"
                            options={[
                                { text: "Modern", value: RenderingStrategy.MODERN, image: iconModern },
                                { text: "Classic", value: RenderingStrategy.CLASSIC, image: iconClassic },
                            ]}
                            value={this.renderingStrategy}
                            onChange={this.handleSelectStrategy}
                        />
                    </Form.Field>
                    <Form.Field error={!this.passwordValid}>
                        <Input
                            size="large"
                            icon="lock"
                            type="password"
                            iconPosition="left"
                            focus
                            placeholder="Password"
                            value={this.password}
                            onChange={this.handlePassword}
                        />
                    </Form.Field>
                    <Form.Field error={!this.repeatValid}>
                        <Input
                            size="large"
                            icon="repeat"
                            type="password"
                            iconPosition="left"
                            focus
                            placeholder="Repeat"
                            value={this.repeat}
                            onChange={this.handleRepeat}
                        />
                    </Form.Field>
                    <Button disabled={!this.allValid} type="submit" fluid color="green">Change</Button>
                </Form>
            </Content>
        );
    }
}
