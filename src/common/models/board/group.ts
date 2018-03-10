import { Board } from ".";
import { Color } from "../..";

export enum GroupStatus {
    ALIVE = "alive",
    UNDECIDED = "undecided",
    DEAD = "dead",
}

export class Group {
    public indices: number[];
    private board: Board;

    constructor(indices: number[], board: Board) {
        this.board = board;
        this.indices = indices;
    }

    public get freedoms(): number {
        return this.indices.reduce((freedoms, index) => {
            return freedoms + this.board.neighboursOfColor(index, Color.EMPTY).length;
        }, 0);
    }

    public get neighbours(): number[] {
        return this.indices.reduce((result, index) => {
            const neighbours = this.board.neighbours(index);
            neighbours.forEach(neighbour => {
                if (!result.includes(neighbour)) {
                    result.push(neighbour);
                }
            });
            return result;
        }, [] as number[]);
    }

    public get neighbouringGroups(): Group[] {
        const { neighbours } = this;
        const groups = neighbours.map(neighbour => this.board.groupAt(neighbour));
        return groups.reduce((result, currentGroup) => {
            if (!result.some(includedGroup => includedGroup.equals(currentGroup)) && !currentGroup.equals(this)) {
                result.push(currentGroup);
            }
            return result;
        }, []);
    }

    public get status(): GroupStatus {
        const { eyes } = this;
        if (eyes.length >= 2) { return GroupStatus.ALIVE; }
        if (eyes.length < 1) { return GroupStatus.DEAD; }
        const eye = eyes[0];
        if (eye.size < 3) { return GroupStatus.DEAD; }
        if (eye.size === 3) { return GroupStatus.UNDECIDED; }
        return GroupStatus.ALIVE;
    }

    public get size(): number {
        return this.indices.length;
    }

    public isEyeOf(surrounding: Group): boolean {
        const { neighbouringGroups } = this;
        return neighbouringGroups.length === 1 && neighbouringGroups[0].equals(surrounding);
    }

    public get eyes(): Group[] {
        return this.neighbouringGroups.filter(group => group.isEyeOf(this));
    }

    public equals(other: Group) {
        return other.indices.every(index => this.indices.includes(index)) &&
            this.indices.length === other.indices.length;
    }
}
