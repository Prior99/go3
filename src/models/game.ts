import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Participant } from "./participant";
import { world, gameCreate } from "scopes";
import { is, scope, DataType, oneOf, specify, required, length } from "hyrest";
import { boardSizes } from "board-sizes";

console.log("PARTICIPANT", Participant);

@Entity()
export class Game {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    @is()
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

    @ManyToOne(() => Participant, participant => participant.game)
    @scope(gameCreate, world)
    @is().validate(required, length(2, 2))
    @specify(() => { console.log("I AM CALLED", Participant); return Participant; })
    public participants?: Participant[];
}
