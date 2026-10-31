import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DUEL_IDLE_HOURS,
  DUEL_INVITATION_HOURS,
  duelEndErrors,
  duelProgress,
  duelSettingsErrors,
  otherSide,
  usernameKey,
  type AcceptDuelRequest,
  type BowTypeId,
  type CreateDuelRequest,
  type Duel,
  type DuelArrow,
  type DuelEndRequest,
  type DuelFace,
  type DuelList,
  type DuelPlayer,
  type DuelProgress,
  type DuelRecord,
  type DuelSide,
  type DuelStatus,
  type DuelSummary,
  type ProfileDuels,
  type SidePair,
} from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { uniqueViolation } from '../common/database-errors';
import { UserEntity } from '../users/user.entity';
import { DuelEndEntity } from './duel-end.entity';
import { DuelEntity } from './duel.entity';

const OPEN: DuelStatus[] = ['invited', 'active'];
const PROFILE_RECENT_DUELS = 10;

/** A side's regular ends and shoot-off arrows, in order */
interface SideArrows {
  ends: DuelArrow[][];
  shootOffs: DuelArrow[];
}

function sideOf(duel: DuelEntity, userId: string): DuelSide | null {
  if (duel.challengerId === userId) return 'challenger';
  return duel.opponentId === userId ? 'opponent' : null;
}

function arrowsOf(ends: readonly DuelEndEntity[]): SidePair<SideArrows> {
  const pair: SidePair<SideArrows> = {
    challenger: { ends: [], shootOffs: [] },
    opponent: { ends: [], shootOffs: [] },
  };
  for (const end of ends.toSorted((a, b) => a.endIndex - b.endIndex)) {
    const side = pair[end.side];
    if (end.shootOff) side.shootOffs.push(end.arrows[0] ?? { points: 0, x: false, shot: null });
    else side.ends.push(end.arrows);
  }
  return pair;
}

function faceOf(duel: DuelEntity, side: DuelSide): DuelFace | null {
  if (side === 'challenger') {
    return { targetSize: duel.challengerTargetSize, isSpot: duel.challengerIsSpot };
  }
  return duel.opponentTargetSize === null || duel.opponentIsSpot === null
    ? null
    : { targetSize: duel.opponentTargetSize, isSpot: duel.opponentIsSpot };
}

function bowTypes(duel: DuelEntity): SidePair<BowTypeId> {
  return { challenger: duel.challengerBow, opponent: duel.opponentBow ?? duel.challengerBow };
}

function progressOf(duel: DuelEntity, arrows: SidePair<SideArrows>): DuelProgress {
  return duelProgress({
    format: duel.format,
    bowTypes: bowTypes(duel),
    ends: { challenger: arrows.challenger.ends, opponent: arrows.opponent.ends },
    shootOffs: { challenger: arrows.challenger.shootOffs, opponent: arrows.opponent.shootOffs },
  });
}

/** Comparable whatever order Postgres keeps the jsonb keys in */
function arrowsKey(arrows: readonly DuelArrow[]): string {
  return JSON.stringify(arrows.map(({ points, x, shot }) => [points, x, shot?.x, shot?.y]));
}

function sameArrows(a: readonly DuelArrow[], b: readonly DuelArrow[]): boolean {
  return arrowsKey(a) === arrowsKey(b);
}

function recordOf(duels: readonly DuelEntity[], ownerId: string): DuelRecord {
  const wins = duels.filter((duel) => duel.winner === sideOf(duel, ownerId)).length;
  return { wins, losses: duels.length - wins };
}

/** Ends or shoot-off arrows of the phase being shot */
function shotInPhase(arrows: SideArrows, shootOff: boolean): number {
  return shootOff ? arrows.shootOffs.length : arrows.ends.length;
}

@Injectable()
export class DuelsService {
  constructor(
    @InjectRepository(DuelEntity)
    private readonly duels: Repository<DuelEntity>,
    @InjectRepository(DuelEndEntity)
    private readonly ends: Repository<DuelEndEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async create(userId: string, body: CreateDuelRequest): Promise<Duel> {
    const errors = duelSettingsErrors(body);
    if (errors.length > 0) throw new BadRequestException(errors);
    const opponent = await this.users.findOneBy({ usernameKey: usernameKey(body.opponent) });
    if (!opponent) throw new NotFoundException('Benutzer nicht gefunden.');
    if (opponent.id === userId) {
      throw new BadRequestException('Du kannst dich nicht selbst herausfordern.');
    }

    await this.expireStale();
    const open = await this.duels.exists({
      where: [
        { challengerId: userId, opponentId: opponent.id, status: In(OPEN) },
        { challengerId: opponent.id, opponentId: userId, status: In(OPEN) },
      ],
    });
    if (open) throw new ConflictException('Ihr habt schon ein offenes Duell.');

    const id = randomUUID();
    await this.duels.insert({
      id,
      challengerId: userId,
      opponentId: opponent.id,
      format: body.format,
      distance: body.distance,
      challengerBow: body.bowType,
      challengerTargetSize: body.targetSize,
      challengerIsSpot: body.isSpot,
      opponentBow: null,
      opponentTargetSize: null,
      opponentIsSpot: null,
      status: 'invited',
      winner: null,
      forfeitedBy: null,
    });
    return this.get(userId, id);
  }

  async list(userId: string): Promise<DuelList> {
    await this.expireStale();
    const duels = await this.duels.find({
      where: [
        { challengerId: userId, status: In(OPEN) },
        { opponentId: userId, status: In(OPEN) },
      ],
      relations: { challenger: true, opponent: true },
      order: { updatedAt: 'DESC' },
    });
    const summaries = await this.summaries(duels, userId);
    return {
      invitations: summaries.filter((duel) => duel.status === 'invited' && duel.you === 'opponent'),
      open: summaries.filter((duel) => duel.status !== 'invited' || duel.you === 'challenger'),
    };
  }

  /** Anyone may look at a duel; only its two archers see their own next end before the other. */
  async get(userId: string, id: string): Promise<Duel> {
    await this.expireStale();
    const duel = await this.find(id);
    const ends = await this.ends.findBy({ duelId: id });
    return this.view(duel, ends, userId);
  }

  async accept(userId: string, id: string, body: AcceptDuelRequest): Promise<Duel> {
    const duel = await this.invitation(userId, id, 'opponent');
    await this.duels.update(duel.id, {
      status: 'active',
      opponentBow: body.bowType,
      opponentTargetSize: body.targetSize,
      opponentIsSpot: body.isSpot,
    });
    return this.get(userId, id);
  }

  async decline(userId: string, id: string): Promise<Duel> {
    const duel = await this.invitation(userId, id, 'opponent');
    await this.duels.update(duel.id, { status: 'declined' });
    return this.get(userId, id);
  }

  /** The challenger withdraws an invitation nobody answered yet. */
  async cancel(userId: string, id: string): Promise<Duel> {
    const duel = await this.invitation(userId, id, 'challenger');
    await this.duels.update(duel.id, { status: 'cancelled' });
    return this.get(userId, id);
  }

  /** Giving up counts as a loss. */
  async forfeit(userId: string, id: string): Promise<Duel> {
    const { duel, side } = await this.activeDuel(userId, id);
    await this.duels.update(duel.id, {
      status: 'finished',
      winner: otherSide(side),
      forfeitedBy: side,
    });
    return this.get(userId, id);
  }

  async submitEnd(userId: string, id: string, body: DuelEndRequest): Promise<Duel> {
    const { duel, side } = await this.activeDuel(userId, id);
    const arrows: DuelArrow[] = body.arrows.map(({ points, x, shot }) => ({
      points,
      x,
      shot: shot ? { x: shot.x, y: shot.y } : null,
    }));
    const stored = await this.ends.findBy({ duelId: id });
    const own = stored.filter((end) => end.side === side && end.shootOff === body.shootOff);

    // Sent again after a lost answer: the same arrows are fine, different ones aren't.
    const existing = own.find((end) => end.endIndex === body.index);
    if (existing) {
      if (!sameArrows(existing.arrows, arrows)) {
        throw new ConflictException('Diese Passe ist schon gespeichert.');
      }
      return this.view(duel, stored, userId);
    }

    const pair = arrowsOf(stored);
    const progress = progressOf(duel, pair);
    if (progress.phase === 'decided') throw new ConflictException('Das Duell ist entschieden.');
    if (body.shootOff !== (progress.phase === 'shootOff')) {
      throw new ConflictException(
        body.shootOff ? 'Es gibt (noch) kein Stechen.' : 'Jetzt kommt das Stechen.',
      );
    }
    const mine = shotInPhase(pair[side], body.shootOff);
    if (body.index !== mine) throw new BadRequestException('Das ist nicht die nächste Passe.');
    // One end ahead at most: the other side's arrows are only shown once both have shot.
    if (mine > shotInPhase(pair[otherSide(side)], body.shootOff)) {
      throw new ConflictException('Warte, bis dein Gegner seine Passe abgeschlossen hat.');
    }
    const bowType = bowTypes(duel)[side];
    const face = faceOf(duel, side);
    if (!face) throw new ConflictException('Das Duell wurde noch nicht angenommen.');
    const errors = duelEndErrors(arrows, face, bowType, body.shootOff);
    if (errors.length > 0) throw new BadRequestException(errors);

    try {
      await this.ends.insert({
        id: randomUUID(),
        duelId: id,
        side,
        shootOff: body.shootOff,
        endIndex: body.index,
        arrows,
      });
    } catch (error: unknown) {
      // The same end sent twice at once: the first one counts.
      if (uniqueViolation(error) === null) throw error;
    }

    const ends = await this.ends.findBy({ duelId: id });
    const after = progressOf(duel, arrowsOf(ends));
    await this.duels.update(
      duel.id,
      after.phase === 'decided' ? { status: 'finished', winner: after.winner } : { status: 'active' },
    );
    return this.get(userId, id);
  }

  /** A profile's record, the viewer's record against them, and their latest duels. */
  async profile(viewerId: string, username: string): Promise<ProfileDuels> {
    await this.expireStale();
    const user = await this.users.findOneBy({ usernameKey: usernameKey(username) });
    if (!user) throw new NotFoundException('Benutzer nicht gefunden.');

    const finished = await this.duels.find({
      select: { id: true, challengerId: true, opponentId: true, winner: true },
      where: [
        { challengerId: user.id, status: 'finished' },
        { opponentId: user.id, status: 'finished' },
      ],
    });
    const againstYou =
      viewerId === user.id
        ? null
        : recordOf(
            finished.filter((duel) => sideOf(duel, viewerId) !== null),
            viewerId,
          );

    const recent = await this.duels.find({
      where: [
        { challengerId: user.id, status: In(['active', 'finished']) },
        { opponentId: user.id, status: In(['active', 'finished']) },
      ],
      relations: { challenger: true, opponent: true },
      order: { updatedAt: 'DESC' },
      take: PROFILE_RECENT_DUELS,
    });
    return {
      record: recordOf(finished, user.id),
      againstYou,
      recent: await this.summaries(recent, user.id),
    };
  }

  /**
   * Invitations lapse after `DUEL_INVITATION_HOURS`, active duels nobody shot in for
   * `DUEL_IDLE_HOURS` are abandoned. Checked on every read instead of a scheduled job, as the
   * API runs serverless; the club's duels are few, so the two updates stay cheap.
   */
  private async expireStale(): Promise<void> {
    await this.duels
      .createQueryBuilder()
      .update()
      .set({ status: 'expired' })
      .where(`status = 'invited' AND updated_at < now() - make_interval(hours => :hours)`, {
        hours: DUEL_INVITATION_HOURS,
      })
      .execute();
    await this.duels
      .createQueryBuilder()
      .update()
      .set({ status: 'abandoned' })
      .where(`status = 'active' AND updated_at < now() - make_interval(hours => :hours)`, {
        hours: DUEL_IDLE_HOURS,
      })
      .execute();
  }

  private async find(id: string): Promise<DuelEntity> {
    const duel = await this.duels.findOne({
      where: { id },
      relations: { challenger: true, opponent: true },
    });
    if (!duel) throw new NotFoundException('Duell nicht gefunden.');
    return duel;
  }

  private async invitation(userId: string, id: string, side: DuelSide): Promise<DuelEntity> {
    await this.expireStale();
    const duel = await this.find(id);
    if (sideOf(duel, userId) !== side) throw new ForbiddenException('Das ist nicht dein Duell.');
    if (duel.status !== 'invited') {
      throw new ConflictException('Diese Einladung ist nicht mehr offen.');
    }
    return duel;
  }

  private async activeDuel(
    userId: string,
    id: string,
  ): Promise<{ duel: DuelEntity; side: DuelSide }> {
    await this.expireStale();
    const duel = await this.find(id);
    const side = sideOf(duel, userId);
    if (!side) throw new ForbiddenException('Das ist nicht dein Duell.');
    if (duel.status !== 'active') throw new ConflictException('Das Duell läuft nicht mehr.');
    return { duel, side };
  }

  private view(duel: DuelEntity, ends: readonly DuelEndEntity[], viewerId: string): Duel {
    const you = sideOf(duel, viewerId);
    const pair = arrowsOf(ends);
    const done = duel.status !== 'active';
    const player = (side: DuelSide): DuelPlayer => {
      const own = pair[side];
      const other = pair[otherSide(side)];
      // A side's next end is visible to that archer only, until the other has shot theirs too.
      const visible = (count: number, otherCount: number): number =>
        done || you === side ? count : Math.min(count, otherCount);
      const user = side === 'challenger' ? duel.challenger : duel.opponent;
      return {
        username: user.username,
        displayName: user.displayName,
        bowType: side === 'challenger' ? duel.challengerBow : duel.opponentBow,
        face: faceOf(duel, side),
        ends: own.ends.slice(0, visible(own.ends.length, other.ends.length)),
        shootOffs: own.shootOffs.slice(
          0,
          visible(own.shootOffs.length, other.shootOffs.length),
        ),
        ahead:
          own.ends.length > other.ends.length || own.shootOffs.length > other.shootOffs.length,
      };
    };
    return {
      id: duel.id,
      status: duel.status,
      you,
      format: duel.format,
      distance: duel.distance,
      challenger: player('challenger'),
      opponent: player('opponent'),
      winner: duel.winner,
      forfeitedBy: duel.forfeitedBy,
      createdAt: duel.createdAt.toISOString(),
      updatedAt: duel.updatedAt.toISOString(),
    };
  }

  /** Each duel from the side of `ownerId`, who must be in all of them. */
  private async summaries(duels: readonly DuelEntity[], ownerId: string): Promise<DuelSummary[]> {
    if (duels.length === 0) return [];
    const ends = await this.ends.findBy({ duelId: In(duels.map((duel) => duel.id)) });
    return duels.map((duel): DuelSummary => {
      const you = sideOf(duel, ownerId) ?? 'challenger';
      const pair = arrowsOf(ends.filter((end) => end.duelId === duel.id));
      const progress = progressOf(duel, pair);
      const shootOff = progress.phase === 'shootOff';
      const rival = you === 'challenger' ? duel.opponent : duel.challenger;
      return {
        id: duel.id,
        status: duel.status,
        you,
        rival: { username: rival.username, displayName: rival.displayName },
        format: duel.format,
        distance: duel.distance,
        score: progress.score,
        yourTurn:
          (duel.status === 'invited' && you === 'opponent') ||
          (duel.status === 'active' &&
            shotInPhase(pair[you], shootOff) <= shotInPhase(pair[otherSide(you)], shootOff)),
        winner: duel.winner,
        updatedAt: duel.updatedAt.toISOString(),
      };
    });
  }
}
