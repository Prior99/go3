import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user";
import { Game } from "./game";
import { Color } from "board-color";
import { world, gameCreate } from "scopes";
import { is, scope, DataType, oneOf, specify, required } from "hyrest";

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

    @OneToMany(() => Game, game => game.participants)
    @scope(world)
    public game?: Game;

    @OneToMany(() => User, user => user.participations)
    @scope(world, gameCreate)
    @is().validate(required)
    public user?: User;

    @Column("varchar", { length: 5 })
    @scope(world, gameCreate)
    @is().validate(required)
    public color?: Color;
}
