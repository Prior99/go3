import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    JoinTable,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user";
import { Game } from "./game";
import { Color } from "board-color";

@Entity()
export class Participant extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @CreateDateColumn()
    public created: Date;

    @UpdateDateColumn()
    public updated: Date;

    @OneToMany(() => Game, game => game.participants)
    public game: Game;

    @OneToMany(() => User, user => user.participations)
    public user: User;

    @Column("varchar", { length: 5 })
    public color: Color;
}
