import type { RankId, UserRole, UserSettings } from '@bszz-dojo/shared';
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_users' })
  id: string;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  /** Lowercased, for case-insensitive uniqueness, login and profile lookups. */
  @Index('UQ_users_username_key', { unique: true })
  @Column({ name: 'username_key', type: 'varchar', length: 30 })
  usernameKey: string;

  @Column({ name: 'display_name', type: 'varchar', length: 40, nullable: true })
  displayName: string | null;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rank: RankId | null;

  @Column({ type: 'jsonb' })
  settings: UserSettings;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
