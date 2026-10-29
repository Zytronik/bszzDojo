import type { DuelArrow, DuelSide } from '@bszz-dojo/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { DuelEntity } from './duel.entity';

/**
 * One side's end, or one shoot-off arrow. A row per side, so both archers can upload at the same
 * time; the unique index makes a repeated upload of the same end fail instead of counting twice.
 */
@Entity('duel_ends')
@Index('UQ_duel_ends_slot', ['duelId', 'side', 'shootOff', 'endIndex'], { unique: true })
export class DuelEndEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_duel_ends' })
  id: string;

  @Column({ name: 'duel_id', type: 'uuid' })
  duelId: string;

  @ManyToOne(() => DuelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'duel_id', foreignKeyConstraintName: 'FK_duel_ends_duel' })
  duel: DuelEntity;

  @Column({ type: 'varchar', length: 10 })
  side: DuelSide;

  @Column({ name: 'shoot_off', type: 'boolean' })
  shootOff: boolean;

  /** From 0, counted separately for regular ends and shoot-off arrows */
  @Column({ name: 'end_index', type: 'smallint' })
  endIndex: number;

  @Column({ type: 'jsonb' })
  arrows: DuelArrow[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
