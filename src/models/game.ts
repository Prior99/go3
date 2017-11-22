import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    BaseEntity,
} from "typeorm";
import { Participant } from "./participant";

@Entity()
export class Game extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column("timestamp with time zone")
    public created: Date;

    @Column("timestamp with time zone")
    public updated: Date;

    @Column("integer")
    public boardSize: number;

    @ManyToOne(() => Participant, participant => participant.game)
    public participants: Participant[];
}
