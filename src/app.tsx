import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router } from "react-router";
import DevTools from "mobx-react-devtools";
import "style.scss";
import "factories";
import { LoginStore } from "store";
import { ErrorStore } from "store";
import { TSDI, component, factory } from "tsdi";
import { History } from "history";
import { isProductionEnvironment } from "utils/environment";
import { AppContainer } from "ui/app-container";
import { PageLogin, PageDashboard, PageSignup } from "pages";
import { Route, Switch, Redirect } from "react-router-dom";
import { configureController, ControllerOptions } from "hyrest";
import { Users, Tokens } from "controllers";
import * as routes from "routing";

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
