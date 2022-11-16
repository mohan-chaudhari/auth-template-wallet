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

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: '' })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, default: '' })
  objectID: string;

  @Column({ nullable: true, type: 'decimal' })
  tokenExpirationDate: number;

  // @Column({ nullable: true })
  // @Exclude({ toPlainOnly: true })
  // authToken: string;

  // @Column({ nullable: true })
  // authTokenExpirationDate: Date;
}
