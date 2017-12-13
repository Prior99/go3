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
import { Color, oppositeColor } from "../board-color";
import { Board } from "./board";
import { computed, observable } from "mobx";
import { bind } from "bind-decorator";

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

    @computed public get blackUser() { return this.getUserByColor(Color.BLACK); }
    @computed public get whiteUser() { return this.getUserByColor(Color.WHITE); }
    @computed public get currentUser() { return this.getUserByColor(this.currentBoard.currentColor); }

    @computed public get description() {
        if (!this.currentBoard) {
            return "Loading board.";
        }
        return `${this.blackUser.name} vs ${this.whiteUser.name} on a ${formatBoardSize(this.boardSize)} board. ` +
            `Game is at turn ${this.turn}. It's ${this.currentBoard.currentColor}'s turn.`;
    }

    @computed public get turn() { return this.currentBoard ? this.currentBoard.turn : 0; }

    @computed public get currentBoard() { return this.boards ? this.boards[this.boards.length - 1] : undefined; }

    public turnValid(index: number) {
        if (this.currentBoard.at(index) !== Color.EMPTY) {
            return "Already occupied.";
        }
        const nextBoard = this.currentBoard.mockPlace(index);
        if (nextBoard.equal(this.currentBoard.parent)) {
            return "Can not repeat a Ko.";
        }
        const group = Array.from(nextBoard.groupAt(index));
        if (nextBoard.freedoms(group) > 0) {
            return;
        }
        const enemyNeighbours = nextBoard.neighboursOfColor(index, oppositeColor(this.currentBoard.currentColor));
        if (!enemyNeighbours.some(neighbour => nextBoard.freedoms(Array.from(nextBoard.groupAt(neighbour))) === 0)) {
            return "Cannot commit suicide.";
        }
        return;
    }
}
