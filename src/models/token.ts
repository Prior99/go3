import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { is, DataType, email, required, length, scope, specify, only, transform } from "hyrest";

import { login, signup, owner } from "../scopes";
import { hash } from "../utils";

import { User, Participant } from ".";

@Entity()
export class Token {
    @PrimaryGeneratedColumn("uuid")
    @scope(owner)
    public id?: string;

    @ManyToOne(() => User, user => user.tokens)
    @scope(login, owner) @is() @specify(() => User)
    public user?: User;

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted?: Date;
}
