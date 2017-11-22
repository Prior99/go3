import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToMany,
    ManyToOne,
    OneToOne,
    BaseEntity,
} from "typeorm";
import { User, dumpUser } from "./user";
import { pick } from "ramda";

export interface CreateToken {
    user: User;
}

export function dumpToken(token: Token): Token {
    return pick(["id", "created", "user"], {
        ...token,
        user: dumpUser(token.user),
    }) as Token;
}

@Entity()
export class Token extends BaseEntity {
    constructor(create?: CreateToken) {
        super();

        if (create) {
            this.user = create.user;
            this.created = new Date();
            this.updated = new Date();
        }
    }

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @OneToMany(() => User, user => user.tokens)
    public user: User;

    @Column("timestamp with time zone")
    public created: Date;

    @Column("timestamp with time zone")
    public updated: Date;

    @Column("timestamp with time zone", { nullable: true })
    public deleted: Date;
}
