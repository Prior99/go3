import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { is, DataType, email, required, length, scope, specify, only, transform } from "hyrest";

import { login, signup, world, owner, gameCreate } from "../scopes";
import { hash } from "../utils";

import { Participant, Token } from ".";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, gameCreate) @is(required)
    public id?: string;

    @is()
        .validate(email, required)
        .validateCtx(ctx => only(signup, value => ctx.validation.emailAvailable(value)))
    @Column("varchar", { length: 200 })
    @scope(owner, login)
    public email?: string;

    @Column("varchar", { length: 200 })
    @is()
        .validate(length(8, 255), required)
    @scope(login)
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
}
