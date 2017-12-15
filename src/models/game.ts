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
        const description =
            `${this.blackUser.name} vs ${this.whiteUser.name} on a ${formatBoardSize(this.boardSize)} board.`;
        if (!this.currentBoard) {
            return description;
        }
        return `${description} Game is at turn ${this.turn}. It's ${this.currentBoard.currentColor}'s turn.`;
    }

    @computed public get turn() { return this.currentBoard ? this.currentBoard.turn : 0; }

    @computed public get currentBoard() { return this.boards ? this.boards[this.boards.length - 1] : undefined; }

    public turnValid(index: number) {
        if (this.currentBoard.at(index) !== Color.EMPTY) {
            return "Already occupied.";
        }
        const tempBoard = this.currentBoard.mockPlace(index);
        const nextBoard = this.currentBoard.place(index);
        if (nextBoard.equal(this.boards[this.boards.length - 2])) {
            return "Can not repeat a Ko.";
        }
        const group = Array.from(tempBoard.groupAt(index));
        if (tempBoard.freedoms(group) > 0) {
            return;
        }
        const enemyNeighbours = tempBoard.neighboursOfColor(index, oppositeColor(this.currentBoard.currentColor));
        const killedNeighbours =
            !enemyNeighbours.some(neighbour => tempBoard.freedoms(Array.from(tempBoard.groupAt(neighbour))) === 0);
        if (killedNeighbours) {
            return "Cannot commit suicide.";
        }
        return;
    }

    @computed public get consecutivePasses() {
        let passes = 0;
        let lastBoard: Board;
        for (let board of this.boards.reverse()) {
            if (lastBoard) {
                if (board.equal(lastBoard)) {
                    passes++;
                } else {
                    return passes;
                }
            }
            lastBoard = board;
        }
        return passes;
    }

    @computed public get over() {
        return this.participants.some(participant => participant.winner !== null && participant.winner !== undefined); // tslint:disable-line
    }
}
