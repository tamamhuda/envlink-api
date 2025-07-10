import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ProviderEnum} from "../../enums/provider.enum";
import {User} from "./user.entity";


@Entity()
@Index(["providerAccountId"], { unique: true })
export class Account {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: ProviderEnum,
        default: ProviderEnum.LOCAL,
    })
    provider: string;

    @Column({
        type: "varchar",
        unique: true,
    })
    providerAccountId: string;

    @Column({
        type: "varchar",
    })
    passwordHash: string;

    @Column({
        type: "boolean",
        default: false,
    })
    isVerified: boolean;

    @Column({
        type: "timestamp",
        nullable: true,
    })
    lastLoginAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.accounts)
    user: User;
}