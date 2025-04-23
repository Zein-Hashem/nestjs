import { User } from './user.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm'

@Entity({ name: 'user_magic_link' })
export class UserLoginToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date

  @ManyToOne(() => User)
  user: User

  @Column()
  token: string

  @Column({ type: 'timestamptz' })
  validatedAt: Date

  @Column({ type: 'timestamptz' })
  expiredAt: Date
}