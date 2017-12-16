import {
    PrimaryGeneratedColumn,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { is, scope, specify, required } from "hyrest";

import { world, friendshipCreate } from "../scopes";

import { User } from ".";

@Entity()
export class Friendship {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    @is()
    public readonly id?: string;

    @CreateDateColumn()
    @scope(world) @specify(() => Date)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world) @specify(() => Date)
    public updated?: Date;

    @ManyToOne(() => User, user => user.friends)
    @scope(world, friendshipCreate) @is().validate(required) @specify(() => User)
    public from?: User;

    @ManyToOne(() => User, user => user.friendOf)
    @scope(world, friendshipCreate) @is().validate(required) @specify(() => User)
    public to?: User;
}
