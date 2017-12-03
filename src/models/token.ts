import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user";
import { Participant } from "./participant";
import { is, DataType, email, required, length, scope, arrayOf, only, transform } from "hyrest";
import { login, signup, world, owner } from "scopes";
import { hash } from "encrypt";

@Entity()
export class Token {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    public id?: string;

    @ManyToOne(() => User)
    @scope(login, world) @is()
    public user?: User;

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted?: Date;
}
