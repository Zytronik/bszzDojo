import {
  Check,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

/** One row per user and someone they added; one-sided, so the other user may not have a row back. */
@Entity('friends')
@Check('CHK_friends_not_self', '"user_id" <> "friend_id"')
export class FriendEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid', primaryKeyConstraintName: 'PK_friends' })
  userId: string;

  @PrimaryColumn({ name: 'friend_id', type: 'uuid', primaryKeyConstraintName: 'PK_friends' })
  @Index('IDX_friends_friend_id')
  friendId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_friends_user' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friend_id', foreignKeyConstraintName: 'FK_friends_friend' })
  friend: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
