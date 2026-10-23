import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';

/** One row per logged-in device. The token itself is `<id>.<secret>`; only the secret's hash is stored. */
@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_refresh_tokens' })
  id: string;

  @Index('IDX_refresh_tokens_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_refresh_tokens_user' })
  user: UserEntity;

  /** sha256 hex */
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
