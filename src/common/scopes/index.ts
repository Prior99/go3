import { createScope } from "hyrest";

export const login = createScope();
export const signup = createScope().include(login);
export const world = createScope();
export const owner = createScope().include(world);
export const gameCreate = createScope();
export const turn = createScope();
export const followershipCreate = createScope();
export const userUpdate = createScope();
