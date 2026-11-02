import { NotFoundException } from '@nestjs/common';
import { usernameKey } from '@bszz-dojo/shared';
import type { Repository } from 'typeorm';
import type { UserEntity } from '../users/user.entity';

/** The user behind a name from a URL or a form, matched ignoring case; 404 when there's none. */
export async function findUserByName(
  users: Repository<UserEntity>,
  username: string,
): Promise<UserEntity> {
  const user = await users.findOneBy({ usernameKey: usernameKey(username) });
  if (!user) throw new NotFoundException('Benutzer nicht gefunden.');
  return user;
}
