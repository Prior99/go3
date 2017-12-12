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
import { computed, observable } from "mobx";

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
    @observable
    public boards: Board[];

    private getUserByColor(color: Color) {
        return this.participants.find(participant => participant.color === color).user;
    }

    @computed private get blackUser() { return this.getUserByColor(Color.BLACK); }
    @computed private get whiteUser() { return this.getUserByColor(Color.WHITE); }

    @computed public get description() {
        return `${this.blackUser.name} vs ${this.whiteUser.name} on a ${formatBoardSize(this.boardSize)} board. ` +
            `Game is at turn ${this.turn}. It's ${this.currentColor}'s turn.`;
    }

    @computed public get turn() { return this.currentBoard ? this.currentBoard.turn : 0; }

    @computed public get currentColor() {
        if (this.turn % 2 === 0) {
            return Color.BLACK;
        }
        return Color.WHITE;
    }

    @computed public get currentBoard() { return this.boards ? this.boards[this.boards.length - 1] : undefined; }
}
