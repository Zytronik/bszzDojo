import type { RankId, UserRole, UserSettings } from '@bszz-dojo/shared';
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Column and constraint names are explicit so they match the hand-written initial migration.
@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_users' })
  id: string;

  /** As typed at registration; for logging in and in profile URLs. */
  @Column({ type: 'varchar', length: 30 })
  username: string;

  /** Lowercased, for case-insensitive uniqueness, login and profile lookups. */
  @Index('UQ_users_username_key', { unique: true })
  @Column({ name: 'username_key', type: 'varchar', length: 30 })
  usernameKey: string;

  /** Shown instead of the username when set. */
  @Column({ name: 'display_name', type: 'varchar', length: 40, nullable: true })
  displayName: string | null;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role: UserRole;

  /** The club badge ("Abzeichen") an admin gave them. */
  @Column({ type: 'varchar', length: 20, nullable: true })
  rank: RankId | null;

  @Column({ type: 'jsonb' })
  settings: UserSettings;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
