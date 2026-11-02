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

/** One row per browser that allowed push messages; a browser belongs to whoever subscribed last. */
@Entity('push_subscriptions')
export class PushSubscriptionEntity {
  @PrimaryColumn({ type: 'uuid', primaryKeyConstraintName: 'PK_push_subscriptions' })
  id: string;

  @Index('IDX_push_subscriptions_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_push_subscriptions_user' })
  user: UserEntity;

  /** The push service's URL for this browser */
  @Index('UQ_push_subscriptions_endpoint', { unique: true })
  @Column({ type: 'text' })
  endpoint: string;

  /** The browser's public key and auth secret (base64url) the messages are encrypted for */
  @Column({ type: 'varchar', length: 100 })
  p256dh: string;

  @Column({ type: 'varchar', length: 50 })
  auth: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
