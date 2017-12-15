import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from "typeorm";
import { User } from "./user";
import { Game } from "./game";
import { Color } from "board-color";
import { DataType, scope, required, is, specify } from "hyrest";
import { turn, world } from "../scopes";
import { bind } from "bind-decorator";
import { computed } from "mobx";
import { oppositeColor } from "../board-color";

export interface Position {
    col: number;
    row: number;
}

@Entity()
export class Board {
    constructor(parent?: Board, index?: number) {
        if (typeof parent !== "undefined") {
            this.parent = parent;
            this.game = parent.game;
            this.state = [...parent.state];
            this.prisonersBlack = parent.prisonersBlack;
            this.prisonersWhite = parent.prisonersWhite;
            this.turn = parent.turn;
            if (typeof index !== "undefined") {
                this.placedAt = index;
                this.state[index] = parent.currentColor;
                this.turn++;
                const enemyNeighbours = this.neighboursOfColor(index, oppositeColor(parent.currentColor));
                const enemyGroups = enemyNeighbours.map(neighbour => Array.from(this.groupAt(neighbour)));
                const killedGroups = enemyGroups.filter(group => this.freedoms(group) === 0);
                const killCount = killedGroups.reduce((result, group) => result + group.length, 0);
                if (parent.currentColor === Color.WHITE) {
                    this.prisonersWhite += killCount;
                } else {
                    this.prisonersBlack += killCount;
                }
                killedGroups.forEach(group => group.forEach(killedIndex => {
                    this.state[killedIndex] = Color.EMPTY;
                }));
            }
        }
    }

    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    public readonly id?: string;

    @ManyToOne(() => Game, game => game.boards)
    @scope(turn)
    @is().validate(required) @specify(() => Game)
    public game?: Game;

    @OneToOne(() => Board) @JoinColumn()
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

    public get size() { return Math.sqrt(this.state.length); }

    public at(at: number): Color {
        return this.state[at];
    }

    @computed public get currentColor() {
        if (this.turn % 2 === 0) {
            return Color.BLACK;
        }
        return Color.WHITE;
    }

    public equal(other: Board) {
        if (!other) {
            return false;
        }
        return this.state.every((value, index) => other.state[index] === value);
    }

    public *groupAt(index: number): IterableIterator<number> {
        const visited = [];
        const queue = [index];
        while (queue.length > 0) {
            const current = queue.pop();
            yield current;
            visited.push(current);
            const unvisitedneighbours = this.neighboursOfSameColor(current)
                .filter(neighbour => !visited.includes(neighbour));
            queue.push(...unvisitedneighbours);
        }
    }

    public freedoms(group: number[]): number {
        return group.reduce((freedoms, index) => {
            return freedoms + this.neighboursOfColor(index, Color.EMPTY).length;
        }, 0);
    }

    public toPos(index: number): Position {
        return {
            col: index % this.size,
            row: Math.floor(index / this.size),
        };
    }

    @bind public toIndex(pos: Position) {
        return pos.col + pos.row * this.size;
    }

    public neighbours(index: number): number[] {
        const { col, row } = this.toPos(index);
        const result = [];
        if (col + 1 < this.size) { result.push({ col: col + 1, row }); }
        if (row + 1 < this.size) { result.push({ col, row: row + 1 }); }
        if (col - 1 >= 0) { result.push({ col: col - 1, row }); }
        if (row - 1 >= 0) { result.push({ col, row: row - 1 }); }
        return result.map(this.toIndex);
    }

    public neighboursOfColor(index: number, color: Color) {
        return this.neighbours(index).filter(neighbour => this.at(neighbour) === color);
    }

    public neighboursOfSameColor(index: number) {
        return this.neighboursOfColor(index, this.at(index));
    }

    public place(index: number): Board {
        return new Board(this, index);
    }

    public pass(): Board {
        const nextBoard = new Board(this);
        nextBoard.turn++;
        return nextBoard;
    }

    public mockPlace(index: number): Board {
        const board = new Board(this);
        board.state[index] = this.currentColor;
        return board;
    }
}
