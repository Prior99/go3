import * as React from "react";
import { LoginStore } from "store";
import * as css from "./login.scss";
import { Link } from "react-router-dom";
import { routeSignup } from "routing";
import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";
import { inject, external } from "tsdi";
import bind from "bind-decorator";
import { RequestStatus } from "request-status";
import { Input, Button, Form } from "semantic-ui-react";
import { Content } from "ui";

@external @observer
export class PageLogin extends React.Component {
    @inject private login: LoginStore;

    @observable private email = "";
    @observable private password = "";

    @bind @action private handleEmail({ target }: React.SyntheticInputEvent) { this.email = target.value; }
    @bind @action private handlePassword({ target }: React.SyntheticInputEvent) { this.password = target.value; }
    @bind private handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        this.login.login(this.email, this.password);
    }

    public render() {
        return (
            <Content>
                <h1>Go 3</h1>
                <Form size="large" onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Input
                            size="large"
                            icon="user"
                            iconPosition="left"
                            focus
                            placeholder="Email"
                            value={this.email}
                            onChange={this.handleEmail}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Input
                            size="large"
                            icon="lock"
                            type="password"
                            iconPosition="left"
                            focus
                            placeholder={"Password"}
                            value={this.password}
                            onChange={this.handlePassword}
                        />
                    </Form.Field>
                    <Button type="submit" fluid color="green">Login</Button>
                </Form>
                <p>Don't have an account? Signup <Link to={routeSignup.path()}>here</Link>.</p>
            </Content>
        );
    }
}
