import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import {
    is,
    DataType,
    email,
    required,
    length,
    scope,
    specify,
    only,
    transform,
    uuid,
    precompute,
    oneOf,
} from "hyrest";
import * as gravatar from "gravatar-url";

import { login, signup, world, owner, gameCreate, followershipCreate, userUpdate } from "../scopes";
import { hash } from "../utils";

import { Participant, Token, Followership } from ".";

export enum RenderingStrategy {
    MODERN = "modern",
    CLASSIC = "classic",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, gameCreate, followershipCreate) @is().validate(required, uuid)
    public id?: string;

    @is()
        .validate(email, required)
        .validateCtx(ctx => only(signup, value => ctx.validation.emailAvailable(value)))
    @Column("varchar", { length: 200 })
    @scope(owner, login)
    public email?: string;

    @Column("varchar", { length: 200, nullable: true })
    @is()
        .validate(length(8, 255), only(login, required), only(signup, required))
    @scope(login, userUpdate)
    @transform(hash)
    public password?: string;

    @CreateDateColumn()
    @scope(world) @specify(() => Date)
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted?: Date;

    @Column("varchar", { length: 200 })
    @is()
        .validate(length(5, 255), required)
        .validateCtx(ctx => only(signup, value => ctx.validation.nameAvailable(value)))
    @scope(world, signup)
    public name?: string;

    @OneToMany(() => Token, token => token.user)
    @is() @specify(() => Token)
    @scope(owner)
    public tokens?: Token[];

    @OneToMany(() => Participant, participant => participant.user)
    @is() @specify(() => Participant)
    public participations?: Participant[];

    @Column("int", { default: 100 })
    @is(DataType.int)
    @scope(world)
    public rating?: number;

    @OneToMany(() => Followership, followership => followership.follower)
    @is() @specify(() => Followership)
    public following?: Followership[];

    @OneToMany(() => Followership, followership => followership.followed)
    @is() @specify(() => Followership)
    public followers?: Followership[];

    @Column("varchar", { length: 8, nullable: true })
    @scope(world)
    public ai?: string;

    @Column("int", { nullable: true })
    @scope(world)
    public aiLevel?: number;

    @precompute @scope(world)
    public get avatarUrl() {
        if (!this.email) {
            return;
        }
        return gravatar(this.email, { size: 200, default: "identicon" });
    }

    @Column("varchar", { length: 16, default: "classic" })
    @scope(owner, userUpdate) @is().validate(oneOf("modern", "classic"))
    public renderingStrategy?: RenderingStrategy;
}
