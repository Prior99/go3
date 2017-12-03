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

@Entity()
export class Board {
    @PrimaryGeneratedColumn("uuid")
    public readonly id?: string;

    @ManyToOne(() => Game)
    public game?: Game;

    @OneToOne(() => Board)
    public parent?: Board;

    @Column("integer", { nullable: true })
    public placedAt?: number;

    @Column("integer", { default: 0 })
    public prisonersOpponent?: number;

    @Column("integer", { default: 0 })
    public prisonersChallenger?: number;

    @Column("jsonb")
    public state?: Color[];

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("integer")
    public turn?: number;
}
