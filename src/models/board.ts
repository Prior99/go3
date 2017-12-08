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
import { User } from "./user";
import { Game } from "./game";
import { Color } from "board-color";
import { DataType, scope, required, is, specify } from "hyrest";
import { turn, world } from "../scopes";

@Entity()
export class Board {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    public readonly id?: string;

    @ManyToOne(() => Game)
    @scope(turn)
    @is().validate(required)
    public game?: Game;

    @OneToOne(() => Board)
    @scope(turn)
    @is()
    public parent?: Board;

    @Column("integer", { nullable: true })
    @scope(turn, world)
    @is(DataType.int)
    public placedAt?: number;

    @Column("integer", { default: 0 })
    @scope(turn, world)
    @is(DataType.int).validate(required)
    public prisonersBlack?: number;

    @Column("integer", { default: 0 })
    @is(DataType.int).validate(required) @scope(turn, world)
    public prisonersWhite?: number;

    @Column("jsonb")
    @scope(turn, world)
    @is().validate(required) @specify(() => String)
    public state?: Color[];

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("integer")
    @is(DataType.int).validate(required) @scope(turn, world)
    public turn?: number;
}
