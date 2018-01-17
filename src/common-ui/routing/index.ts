import * as React from "react";
import * as pathToRegexp from "path-to-regexp";

export interface BasicRoute {
    path: (...args: string[]) => string;
    pattern: string;
}

export interface UnauthorizedRoute extends BasicRoute {
    unauthorized: true;
    navbar?: false;
}

export interface AuthorizedRoute extends BasicRoute {
    unauthorized?: false;
    navbar?: false;
}

export interface AuthorizedNavbarRoute extends BasicRoute {
    unauthorized?: false;
    navbar: true;
    icon: string;
    title: string;
}

export type Route = AuthorizedRoute | AuthorizedNavbarRoute | UnauthorizedRoute;

export const routeLogin: Route = {
    path: () => "/login",
    pattern: "/login",
    unauthorized: true,
};

export const routeSignup: Route = {
    path: () => "/signup",
    pattern: "/signup",
    unauthorized: true,
};

export const routeDashboard: Route = {
    path: () => "/dashboard",
    pattern: "/dashboard",
    navbar: true,
    title: "Dashboard",
    icon: "dashboard",
};

export const routeGames: Route = {
    path: () => "/games",
    pattern: "/games",
    navbar: true,
    title: "Games",
    icon: "list layout",
};

export const routeCreateGame: Route = {
    path: () => "/create-game",
    pattern: "/create-game",
    navbar: true,
    title: "Create Game",
    icon: "add",
};

export const routeGame: Route = {
    path: (id: string) => `/game/${id}`,
    pattern: "/game/:id",
};

export const routeFollow: Route = {
    path: () => "/follow",
    pattern: "/follow",
    navbar: true,
    title: "Following / Followers",
    icon: "group",
};

export const routeUser: Route = {
    path: (id: string) => `/user/${id}`,
    pattern: "/user/:id",
};

export const routeSettings: Route = {
    path: () => "/settings",
    pattern: "/settings",
    navbar: true,
    title: "Settings",
    icon: "setting",
};

export const routes: Route[] = [
    routeLogin,
    routeSignup,
    routeDashboard,
    routeCreateGame,
    routeGame,
    routeGames,
    routeFollow,
    routeUser,
    routeSettings,
];

export function getRoute(url: string) {
    return routes.find(({ pattern }) => Boolean(pathToRegexp(pattern).exec(url)));
}
