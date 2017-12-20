import {
    PrimaryGeneratedColumn,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { is, scope, specify, required, uuid } from "hyrest";

import { world, followershipCreate } from "../scopes";

import { User } from ".";

@Entity()
export class Followership {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    @is().validate(uuid)
    public readonly id?: string;

    @CreateDateColumn()
    @scope(world) @specify(() => Date)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world) @specify(() => Date)
    public updated?: Date;

    @ManyToOne(() => User, user => user.following)
    @scope(world, followershipCreate) @is().validate(required) @specify(() => User)
    public follower?: User;

    @ManyToOne(() => User, user => user.followers)
    @scope(world, followershipCreate) @is().validate(required) @specify(() => User)
    public followed?: User;
}
