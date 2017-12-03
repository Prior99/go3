import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Participant } from "./participant";

@Entity()
export class Game {
    @PrimaryGeneratedColumn("uuid")
    public readonly id?: string;

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("integer")
    public boardSize?: number;

    @ManyToOne(() => Participant, participant => participant.game)
    public participants?: Participant[];
}
