import type { BadgePlace } from '@bszz-dojo/shared';
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

/** A tournament placing ("Auszeichnung") an admin recorded for a user. */
@Entity('badges')
export class BadgeEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_badges' })
  id: string;

  @Index('IDX_badges_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_badges_user' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'smallint' })
  year: number;

  @Column({ type: 'smallint' })
  place: BadgePlace;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
