import type { BowTypeId, IsoDate, Shot, TargetSize } from '@bszz-dojo/shared';
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

@Entity('scores')
@Index('IDX_scores_user_shot_on', ['userId', 'shotOn'])
@Index('IDX_scores_distance_arrows', ['distance', 'arrows'])
export class ScoreEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_scores' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_scores_user' })
  user: UserEntity;

  @Column({ name: 'bow_type', type: 'varchar', length: 4 })
  bowType: BowTypeId;

  /** cm */
  @Column({ name: 'target_size', type: 'smallint' })
  targetSize: TargetSize;

  @Column({ name: 'is_spot', type: 'boolean' })
  isSpot: boolean;

  /** Meters */
  @Column({ type: 'smallint' })
  distance: number;

  @Column({ type: 'smallint' })
  arrows: number;

  @Column({ type: 'smallint' })
  tens: number;

  @Column({ type: 'smallint' })
  nines: number;

  @Column({ type: 'smallint' })
  result: number;

  /** Entered on the target; `null` when only the totals were entered */
  @Column({ type: 'jsonb', nullable: true })
  shots: Shot[] | null;

  /** The day it was shot; TypeORM returns `date` columns as `YYYY-MM-DD` strings. */
  @Column({ name: 'shot_on', type: 'date' })
  shotOn: IsoDate;

  /** Breaks ties between rounds shot on the same day. */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
