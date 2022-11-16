import { Exclude } from 'class-transformer';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Exclude({ toPlainOnly: true })
  id: string;

  @Column({ default: '' })
  firstName: string;

  @Column({ default: '' })
  lastName: string;

  @Column({ default: '' })
  userName: string;

  @Column({ unique: true, length: 100, nullable: true })
  walletAddress: string;

  @Column({ nullable: true })
  loginWallet: string;

  @Column({ default: '' })
  imageUrl: string;

  @Column({ nullable: true, default: '' })
  objectID: string;

  @Column({ nullable: true, type: 'decimal' })
  tokenExpirationDate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
