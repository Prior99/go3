import * as React from "react";
import * as ReactDOM from "react-dom";
import DevTools from "mobx-react-devtools";
import { TSDI, component, factory } from "tsdi";
import { History } from "history";
import { Route, Switch, Redirect } from "react-router-dom";
import { Router } from "react-router";
import { configureController, ControllerOptions } from "hyrest";

import { Users, Tokens, Games } from "../controllers";
import { isProductionEnvironment } from "../utils";
import { PageLogin, PageDashboard, PageSignup, PageCreateGame, PageGame } from "./pages";
import { AppContainer } from "./ui";
import * as routes from "./routing";
import "./global.scss";
import "./factories";
import { LoginStore, ErrorStore } from "./store";

declare var baseUrl: string;

export const pages = [
    {
        route: routes.routeLogin,
        component: PageLogin,
    },
    {
        route: routes.routeSignup,
        component: PageSignup,
    },
    {
        route: routes.routeDashboard,
        component: PageDashboard,
    },
    {
        route: routes.routeCreateGame,
        component: PageCreateGame,
    },
    {
        route: routes.routeGame,
        component: PageGame,
    },
];

export function App() {
    return (
        <AppContainer>
            <Switch>
                <Redirect exact from="/" to="/login" />
                {
                    pages
                        .map((page, index) => (
                            <Route
                                key={index}
                                path={page.route.pattern}
                                component={page.component}
                            />
                        ))
                }
            </Switch>
        </AppContainer>
    );
}

function main() {
    const controllerOptions: ControllerOptions = {
        baseUrl,
        errorHandler: (err) => errors.errors.push({
            message: err.answer ? err.answer.message : err.message ? err.message : "Unknown error.",
        }),
        authorizationProvider: (headers: Headers) => {
            const loginStore = tsdi.get(LoginStore);
            if (loginStore.loggedIn) {
                headers.append("authorization", `Bearer ${loginStore.authToken}`);
            }
        },
    };

    configureController([
        Users,
        Tokens,
        Games,
    ], controllerOptions);

    const tsdi: TSDI = new TSDI();
    tsdi.enableComponentScanner();

    ReactDOM.render(
        <div>
            <Router history={tsdi.get("history")}>
                <App />
            </Router>
            {!isProductionEnvironment() && <DevTools />}
        </div>,
        document.getElementById("root"),
    );

    const errors = tsdi.get(ErrorStore);
}

main();
