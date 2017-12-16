import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required } from "hyrest";

import { Color, colors } from "../board-color";
import { world, gameCreate } from "../scopes";

import { User, Game } from ".";

@Entity()
export class Participant {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    @is()
    public readonly id?: string;

    @CreateDateColumn()
    @scope(world)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world)
    public updated?: Date;

    @ManyToOne(() => Game, game => game.participants)
    @scope(world) @specify(() => Game)
    public game?: Game;

    @ManyToOne(() => User, user => user.participations)
    @scope(world, gameCreate) @is().validate(required) @specify(() => User)
    public user?: User;

    @Column("varchar", { length: 5 })
    @scope(world, gameCreate)
    @is().validate(oneOf(...colors), required)
    public color?: Color;

    @Column("bool", { nullable: true })
    @scope(world)
    @is()
    public winner?: boolean;
}
