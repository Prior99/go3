import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Participant } from "./participant";
import { is, DataType, email, required, length, scope, specify, only, transform } from "hyrest";
import { login, signup, world, owner } from "scopes";
import { hash } from "encrypt";
import { Token } from "./token";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @scope(world, login)
    public id?: string;

    @is().validateCtx(ctx => only(signup, ctx.validation.emailAvailable)).validate(email, required)
    @Column("varchar", { length: 200 })
    @scope(owner, login)
    public email?: string;

    @Column("varchar", { length: 200 })
    @is().validate(length(8, 255), required)
    @scope(login)
    @transform(hash)
    public password?: string;

    @CreateDateColumn()
    public created?: Date;

    @UpdateDateColumn()
    public updated?: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted?: Date;

    @Column("varchar", { length: 200 })
    @is().validate(length(5, 255), required).validateCtx(ctx => only(signup, ctx.validation.nameAvailable))
    @scope(world, signup)
    public name?: string;

    @OneToMany(() => Token, token => token.user)
    @is() @specify(() => Token)
    public tokens?: Token[];

    @OneToMany(() => Participant, participant => participant.user)
    @is() @specify(() => Participant)
    public participations?: Participant[];
}
