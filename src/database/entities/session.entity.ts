import {Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {User} from "./user.entity";


@Entity()
@Index( ["refreshTokenHash", "accessToken"], {unique: true})
export default class Session {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        unique: true,
    })
    refreshTokenHash: string;

    @Column({
        type: "varchar",
        unique: true,
    })
    accessToken: string;

    @Column({
        type: "varchar",
        nullable: true,
    })
    parsedUa?: string;

    @Column({
        type: "varchar",
        nullable: true,
    })
    ipLocation?: string;

    @Column({
        type: "timestamp"
    })
    expiresAt: Date;

    @Column({
        type: "boolean",
        default: false
    })
    isRevoked: boolean;

    @Column({
        type: "timestamp"
    })
    revokedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.sessions)
    user: User;
}