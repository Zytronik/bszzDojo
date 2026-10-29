import type {
  BowTypeId,
  DuelFormat,
  DuelSide,
  DuelStatus,
  TargetSize,
} from '@bszz-dojo/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('duels')
@Index('IDX_duels_challenger_id', ['challengerId'])
@Index('IDX_duels_opponent_id', ['opponentId'])
export class DuelEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_duels' })
  id: string;

  @Column({ name: 'challenger_id', type: 'uuid' })
  challengerId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenger_id', foreignKeyConstraintName: 'FK_duels_challenger' })
  challenger: UserEntity;

  @Column({ name: 'opponent_id', type: 'uuid' })
  opponentId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opponent_id', foreignKeyConstraintName: 'FK_duels_opponent' })
  opponent: UserEntity;

  @Column({ type: 'varchar', length: 5 })
  format: DuelFormat;

  /** Meters */
  @Column({ type: 'smallint' })
  distance: number;

  /** cm */
  @Column({ name: 'target_size', type: 'smallint' })
  targetSize: TargetSize;

  @Column({ name: 'is_spot', type: 'boolean' })
  isSpot: boolean;

  @Column({ name: 'challenger_bow', type: 'varchar', length: 4 })
  challengerBow: BowTypeId;

  /** Picked by the opponent when accepting */
  @Column({ name: 'opponent_bow', type: 'varchar', length: 4, nullable: true })
  opponentBow: BowTypeId | null;

  @Column({ type: 'varchar', length: 10 })
  status: DuelStatus;

  @Column({ type: 'varchar', length: 10, nullable: true })
  winner: DuelSide | null;

  @Column({ name: 'forfeited_by', type: 'varchar', length: 10, nullable: true })
  forfeitedBy: DuelSide | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** The last answer or end; an active duel without one for `DUEL_IDLE_HOURS` is abandoned. */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
