import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Participant } from "./participant";
import { world, gameCreate, turn } from "scopes";
import { is, scope, DataType, oneOf, specify, required, length } from "hyrest";
import { boardSizes } from "board-sizes";
import { formatBoardSize } from "../board-sizes";
import { Color } from "../board-color";
import { Board } from "./board";

@Entity()
export class Game {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, turn) @is()
    public readonly id?: string;

    @CreateDateColumn()
    @scope(world)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world)
    public updated?: Date;

    @Column("integer")
    @scope(gameCreate, world)
    @is(DataType.int).validate(oneOf(...boardSizes))
    public boardSize?: number;

    @OneToMany(() => Participant, participant => participant.game)
    @scope(gameCreate, world)
    @is().validate(length(2, 2), required)
    @specify(() => Participant)
    public participants?: Participant[];

    @OneToMany(() => Board, board => board.game)
    public boards: Board[];

    private getUserByColor(color: Color) {
        return this.participants.find(participant => participant.color === color).user;
    }

    private get blackUser() { return this.getUserByColor(Color.BLACK); }
    private get whiteUser() { return this.getUserByColor(Color.WHITE); }

    public get description() {
        return `${this.blackUser.name} vs ${this.whiteUser.name} on a ${formatBoardSize(this.boardSize)} board.`;
    }

    public get currentBoard() {
        return this.boards[this.boards.length - 1];
    }
}
