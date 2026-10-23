import type {
  AgeCategory,
  BadgeKind,
  BadgePlace,
  BowTypeId,
  TournamentType,
} from '@bszz-dojo/shared';
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

/**
 * A tournament placing ("Auszeichnung") a user recorded. The details are nullable for placings
 * imported from the old app, which only had a name, year and place.
 */
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

  @Column({ type: 'varchar', length: 20 })
  kind: BadgeKind;

  @Column({ type: 'smallint' })
  place: BadgePlace;

  @Column({ type: 'smallint' })
  year: number;

  @Column({ name: 'bow_type', type: 'varchar', length: 4, nullable: true })
  bowType: BowTypeId | null;

  /** Meters */
  @Column({ type: 'smallint', nullable: true })
  distance: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ name: 'event_name', type: 'varchar', length: 100, nullable: true })
  eventName: string | null;

  @Column({ type: 'boolean', nullable: true })
  team: boolean | null;

  @Column({ name: 'tournament_type', type: 'varchar', length: 10, nullable: true })
  tournamentType: TournamentType | null;

  @Column({ name: 'age_category', type: 'varchar', length: 40, nullable: true })
  ageCategory: AgeCategory | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
