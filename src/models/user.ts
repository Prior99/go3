import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    BaseEntity,
} from "typeorm";
import { Token } from "./token";
import { Participant } from "./participant";
import { pick } from "ramda";

export interface CreateUser {
    email: string;
    password: string;
    name: string;
}

export function dumpUser(user: User): User {
    return pick(["name", "id", "created"], user);
}

@Entity()
export class User extends BaseEntity {
    constructor(create?: CreateUser) {
        super();
        if (create) {
            const { email, password, name } = create;
            this.email = email;
            this.password = password;
            this.name = name;
            this.created = new Date();
            this.updated = new Date();
        }
    }

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column("varchar", { length: 200 })
    public email: string;

    @Column("varchar", { length: 200 })
    public password: string;

    @Column("timestamp with time zone")
    public created: Date;

    @Column("timestamp with time zone")
    public updated: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted: Date;

    @OneToMany(() => Token, token => token.user)
    public tokens: Promise<Token[]>;

    @Column("varchar", { length: 200 })
    public name: string;

    @OneToMany(() => Participant, participant => participant.user)
    public participations: Participant[];
}
