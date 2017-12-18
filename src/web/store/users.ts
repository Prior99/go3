import { observable, computed, action } from "mobx";
import { bind } from "bind-decorator";
import { History } from "history";
import { component, inject } from "tsdi";

import { Users } from "../../controllers";
import { User, UserStats } from "../../models";

import { LoginStore, OwnUserStore } from ".";

@component
export class UsersStore {
    @inject private usersController: Users;

    @observable private users: Map<string, User> = new Map();
    @observable private userStats: Map<string, UserStats> = new Map();
    @observable private avatars: Map<string, string> = new Map();
    @observable public loading = false;

    @bind @action
    public async searchUsers(search: string) {
        this.loading = true;
        const users = await this.usersController.findUsers(search);
        users.forEach(user => {
            this.users.set(user.id, user);
        });
        this.loading = false;
        return users;
    }

    @computed
    public get all(): User[] {
        return Array.from(this.users.values());
    }

    @bind @action
    public async load(id: string) {
        const existing = this.byId(id);
        if (existing) {
            return existing;
        }
        const user = await this.usersController.getUser(id);
        this.users.set(user.id, user);
        return user;
    }

    @bind
    public byId(id: string) {
        const user = this.users.get(id);
        if (!user) { this.load(id); }
        return user;
    }

    @bind @action
    public async loadStats(id: string) {
        const stats = await this.usersController.getUserStats(id);
        this.userStats.set(id, stats);
        return stats;
    }

    @bind @action
    public async loadAvatar(id: string) {
        const avatar = await this.usersController.getUserAvatar(id);
        this.avatars.set(id, avatar);
        return avatar;
    }

    @bind
    public statsById(id: string) {
        const stats = this.userStats.get(id);
        if (!stats) { this.loadStats(id); }
        return stats;
    }

    @bind
    public avatarById(id: string) {
        const avatar = this.avatars.get(id);
        if (!avatar) { this.loadAvatar(id); }
        return avatar;
    }
}
