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
import { DataType, scope, required, is, specify, uuid } from "hyrest";
import { bind } from "bind-decorator";
import { memoize } from "lodash-decorators";
import { computed } from "mobx";

import { Color, oppositeColor } from "../../utils";
import { Position } from "../../position";
import { turn, world } from "../../scopes";

import { User, Game } from "..";
import { Group } from "./group";

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
                const enemyGroups = enemyNeighbours.reduce((result, neighbour) => {
                    const group = this.groupAt(neighbour);
                    if (!result.some(oldGroup => oldGroup.equals(group))) {
                        result.push(group);
                    }
                    return result;
                }, []);
                const killedGroups = enemyGroups.filter(group => group.freedoms === 0);
                const killCount = killedGroups.reduce((result: number, group: Group) => group.size + result, 0);
                if (parent.currentColor === Color.WHITE) {
                    this.prisonersWhite += killCount;
                } else {
                    this.prisonersBlack += killCount;
                }
                killedGroups.forEach(group => group.indices.forEach(killedIndex => {
                    this.state[killedIndex] = Color.EMPTY;
                }));
            }
        }
    }

    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    @is().validate(uuid)
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
    @scope(world) @specify(() => Date)
    public created?: Date;

    @UpdateDateColumn()
    @scope(world) @specify(() => Date)
    public updated?: Date;

    @Column("integer")
    @is(DataType.int).validate(required) @scope(turn, world)
    public turn?: number;

    @Column("boolean", { nullable: true })
    @scope(turn, world)
    public resigned?: boolean;

    public get size() { return Math.sqrt(this.state.length); }

    @bind public at(at: number): Color {
        return this.state[at];
    }

    @computed public get currentColor() {
        if (this.turn % 2 === 0) {
            return Color.BLACK;
        }
        return Color.WHITE;
    }

    @bind public equals(other: Board) {
        if (!other) {
            return false;
        }
        return this.state.every((value, index) => other.state[index] === value);
    }

    @memoize(index => `${this.id},${index}}`)
    public groupAt(index: number): Group {
        const visited = [];
        const queue = [index];
        while (queue.length > 0) {
            const current = queue.pop();
            if (visited.includes(current)) {
                continue;
            }
            visited.push(current);
            const unvisitedneighbours = this.neighboursOfSameColor(current)
                .filter(neighbour => !visited.includes(neighbour));
            queue.push(...unvisitedneighbours);
        }
        return new Group(visited, this);
    }

    @bind public toPos(index: number): Position {
        return {
            col: index % this.size,
            row: Math.floor(index / this.size),
        };
    }

    @bind public toIndex(pos: Position) {
        return pos.col + pos.row * this.size;
    }

    @bind public neighbours(index: number): number[] {
        const { col, row } = this.toPos(index);
        const result = [];
        if (col + 1 < this.size) { result.push({ col: col + 1, row }); }
        if (row + 1 < this.size) { result.push({ col, row: row + 1 }); }
        if (col - 1 >= 0) { result.push({ col: col - 1, row }); }
        if (row - 1 >= 0) { result.push({ col, row: row - 1 }); }
        return result.map(this.toIndex);
    }

    @bind public neighboursOfColor(index: number, color: Color) {
        return this.neighbours(index).filter(neighbour => this.at(neighbour) === color);
    }

    @bind public neighboursOfSameColor(index: number) {
        return this.neighboursOfColor(index, this.at(index));
    }

    @bind public place(index: number): Board {
        return new Board(this, index);
    }

    @bind public pass(): Board {
        const nextBoard = new Board(this);
        nextBoard.turn++;
        return nextBoard;
    }

    @bind public resign(): Board {
        const nextBoard = new Board(this);
        nextBoard.turn++;
        nextBoard.resigned = true;
        return nextBoard;
    }

    @bind public mockPlace(index: number): Board {
        const board = new Board(this);
        board.state[index] = this.currentColor;
        board.turn++;
        return board;
    }

    @bind public prisoners(color: Color) {
        return color === Color.BLACK ? this.prisonersBlack : this.prisonersWhite;
    }

    @bind public getScore(forColor: Color) {
        const visited: number[] = [];
        let score = this.prisoners(forColor);
        this.state.forEach((color, index) => {
            if (visited.includes(index) || color !== Color.EMPTY) {
                return;
            }
            const group = this.groupAt(index);
            visited.push(...group.indices);
            const belongsToColor = group.indices.every(groupIndex => {
                const neighbours = this.neighbours(groupIndex);
                return neighbours.every(neighbour => {
                    const colorAtNeighbour = this.at(neighbour);
                    if (colorAtNeighbour === oppositeColor(forColor)) {
                        return false;
                    }
                    return true;
                });
            });
            if (belongsToColor) {
                score += group.size;
            }
        });
        return score;
    }

    public get winningColor() {
        const scoreBlack = this.getScore(Color.BLACK);
        const scoreWhite = this.getScore(Color.WHITE);
        return scoreBlack === scoreWhite ? Color.EMPTY :
            scoreBlack > scoreWhite ?  Color.BLACK : Color.WHITE;
    }
}
