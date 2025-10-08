import { Column, Entity, Index, OneToMany } from 'typeorm';
import { RolesEnum } from '../../common/enums/roles.enum';
import { Account } from './account.entity';
import Session from './session.entity';
import { BaseEntity } from './base.entity';
import { Url } from './url.entity';

@Entity({ name: 'users' })
@Index(['username', 'email'], { unique: true })
export class User extends BaseEntity {
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

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Url, (url) => url.user)
  urls!: Url[];
}
