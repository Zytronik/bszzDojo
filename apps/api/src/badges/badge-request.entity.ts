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

/** A user asking an admin to record a placing the club has no data about. */
@Entity('badge_requests')
export class BadgeRequestEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_badge_requests' })
  id: string;

  @Index('IDX_badge_requests_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_badge_requests_user' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'smallint' })
  place: BadgePlace;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
