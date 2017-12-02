import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne,
    OneToOne,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user";
import { login, world } from "scopes";
import { scope, is } from "hyrest";

@Entity()
export class Token extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    public id: string;

    @OneToMany(() => User, user => user.tokens)
    @scope(login, world)
    @is()
    public user: User;

    @CreateDateColumn()
    public created: Date;

    @UpdateDateColumn()
    public updated: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted: Date;
}
