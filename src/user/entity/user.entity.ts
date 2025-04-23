import {
    Column,
    BaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm'
  import { UserStatus } from '../enum/userStatus'
  
  @Entity({ name: 'user' })
  export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
  
    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date
  
    @Column()
    firstName: string
  
    @Column()
    lastName: string
  
    @Column()
    email: string
  
    @Column({
      type: 'enum',
      enum: UserStatus,
      default: UserStatus.draft,
    })
    status: UserStatus
  
  }