import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

/** A pending "forgot password" link. The token is `<id>.<secret>`; only the secret's hash is stored. */
@Entity('password_resets')
export class PasswordResetEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_password_resets' })
  id: string;

  @Index('IDX_password_resets_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_password_resets_user' })
  user: UserEntity;

  /** sha256 hex */
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
