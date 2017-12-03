import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Token } from "./token";
import { Participant } from "./participant";
import { is, DataType, email, required, length, scope, arrayOf, only, transform } from "hyrest";
import { login, signup, world, owner } from "scopes";
import { hash } from "encrypt";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @scope(world)
    public readonly id?: string;

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

    @OneToMany(() => Token, token => token.user)
    @scope(owner) @arrayOf(Token)
    public tokens?: Token[];

    @Column("varchar", { length: 200 })
    @is().validate(length(5, 255), required).validateCtx(ctx => only(signup, ctx.validation.nameAvailable))
    @scope(world, signup)
    public name: string;

    @OneToMany(() => Participant, participant => participant.user)
    @arrayOf(Token)
    public participations?: Participant[];
}
