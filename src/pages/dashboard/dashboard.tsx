import * as React from "react";
import * as css from "./dashboard.scss";
import { requireLogin } from "utils";
import { Content } from "ui";

@requireLogin
export class PageDashboard extends React.Component {
    public render() {
        return (
            <Content>
            </Content>
        );
    }
}
