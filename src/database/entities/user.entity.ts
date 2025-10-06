import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from '../../common/enums/roles.enum';
import { Account } from './account.entity';
import Session from './session.entity';

@Entity()
@Index(['username', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 25,
    unique: true,
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  fullName!: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role!: RolesEnum;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];
}
