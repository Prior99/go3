import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required, length, uuid } from "hyrest";
import { computed, observable } from "mobx";
import { bind } from "bind-decorator";

import { world, gameCreate, turn } from "../scopes";
import { boardSizes, formatBoardSize, Color, oppositeColor, newRating, GameResult } from "../utils";

import { Participant, Board } from ".";

@Entity()
export class Game {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, turn) @is().validate(uuid)
    public readonly id?: string;

    @CreateDateColumn()
    @scope(world) @specify(() => Date)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world) @specify(() => Date)
    public updated?: Date;

    @Column("integer")
    @scope(gameCreate, world)
    @is(DataType.int).validate(required, oneOf(...boardSizes))
    public boardSize?: number;

    @OneToMany(() => Participant, participant => participant.game)
    @scope(gameCreate, world)
    @is().validate(length(2, 2), required)
    @specify(() => Participant)
    public participants?: Participant[];

    @OneToMany(() => Board, board => board.game)
    @observable
    public boards: Board[];

    public getUserByColor(color: Color) {
        return this.participants.find(participant => participant.color === color).user;
    }

    @computed public get blackUser() { return this.getUserByColor(Color.BLACK); }
    @computed public get whiteUser() { return this.getUserByColor(Color.WHITE); }
    @computed public get currentUser() { return this.getUserByColor(this.currentBoard.currentColor); }

    public getOpponent(userId: string) {
        if (this.blackUser.id === userId) {
            return this.whiteUser;
        }
        if (this.whiteUser.id === userId) {
            return this.blackUser;
        }
    }

    public getColorForUser(userId: string) {
        if (this.blackUser.id === userId) {
            return Color.BLACK;
        }
        if (this.whiteUser.id === userId) {
            return Color.WHITE;
        }
    }

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
        if (nextBoard.equals(this.boards[this.boards.length - 2])) {
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
                if (board.equals(lastBoard)) {
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
        return this.participants.some(participant => participant.winner !== null && participant.winner !== undefined);
    }

    @computed public get tie() {
        return this.participants.every(participant => participant.winner === false);
    }

    public equals(other: Game) {
        return this.id === other.id &&
            this.participants.every((participant, index) => participant.equals(other.participants[index])) &&
            this.currentBoard.equals(other.currentBoard);
    }

    public getParticipantForUser(userId: string) {
        return this.participants.find(({ user }) => user.id === userId);
    }

    public getResultFor(userId: string) {
        const participant = this.getParticipantForUser(userId);
        const other = this.participants.find(current => current !== participant);
        return participant.winner ? GameResult.WIN :
            other.winner ? GameResult.LOSS : GameResult.TIE;
    }

    public newRating(userId: string) {
        const participant = this.getParticipantForUser(userId);
        const other = this.participants.find(current => current !== participant);
        return newRating(participant.rating, other.rating, this.getResultFor(userId));
    }
}