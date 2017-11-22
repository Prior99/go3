import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne,
    OneToOne,
    BaseEntity,
} from "typeorm";
import { User } from "./user";
import { Game } from "./game";
import { Color } from "board-color";

@Entity()
export class Board extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @ManyToOne(() => Game)
    public game: Game;

    @OneToOne(() => Board)
    public parent: Board;

    @Column("integer", { nullable: true })
    public placedAt: number;

    @Column("integer", { default: 0 })
    public prisonersOpponent: number;

    @Column("integer", { default: 0 })
    public prisonersChallenger: number;

    @Column("jsonb")
    public state: Color[];

    @Column("timestamp with time zone")
    public created: Date;

    @Column("timestamp with time zone")
    public updated: Date;

    @Column("integer")
    public turn: number;
}
