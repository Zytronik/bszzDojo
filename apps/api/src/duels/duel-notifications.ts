import {
  DUEL_FORMAT_NAMES,
  duelEndName,
  duelScoreLabel,
  otherSide,
  shownName,
  type Duel,
  type DuelProgress,
  type DuelSide,
  type PushMessage,
} from '@bszz-dojo/shared';

/** The icon of the installed app (`manifest.webmanifest`) */
const ICON = '/img/fav/android-icon-192x192.png';

export type DuelNews =
  | { kind: 'invited' }
  | { kind: 'accepted' }
  | { kind: 'declined' }
  /** `waiting`: the recipient hasn't shot this end (or shoot-off arrow) yet */
  | { kind: 'end'; index: number; shootOff: boolean; waiting: boolean; progress: DuelProgress }
  | { kind: 'decided'; progress: DuelProgress }
  | { kind: 'forfeited' };

/** What the archer on `recipient`'s side is told about something the other archer did. */
export function duelMessage(duel: Duel, recipient: DuelSide, news: DuelNews): PushMessage {
  const actor = shownName(duel[otherSide(recipient)]);
  const { title, body } = text(duel, recipient, actor, news);
  return {
    notification: {
      title,
      body,
      icon: ICON,
      // One message per duel on the device: the newest replaces the one before.
      tag: `duel-${duel.id}`,
      renotify: true,
      data: {
        onActionClick: {
          default: { operation: 'navigateLastFocusedOrOpen', url: `/duels/${duel.id}` },
        },
      },
    },
  };
}

function text(
  duel: Duel,
  recipient: DuelSide,
  actor: string,
  news: DuelNews,
): { title: string; body: string } {
  switch (news.kind) {
    case 'invited':
      return {
        title: 'Neue Duell-Einladung',
        body: `${actor} fordert dich heraus: ${DUEL_FORMAT_NAMES[duel.format]}, ${duel.distance}m.`,
      };
    case 'accepted':
      return { title: 'Duell angenommen', body: `${actor} hat angenommen. Ihr könnt loslegen!` };
    case 'declined':
      return { title: 'Duell abgelehnt', body: `${actor} hat deine Herausforderung abgelehnt.` };
    case 'end': {
      if (news.waiting) {
        const shot = news.shootOff
          ? 'den Stechpfeil'
          : `${duelEndName(duel.format)} ${news.index + 1}`;
        return { title: 'Du bist dran', body: `${actor} hat ${shot} geschossen.` };
      }
      if (news.shootOff) {
        return { title: 'Das Stechen geht weiter', body: 'Beide gleich nah: noch ein Pfeil.' };
      }
      if (news.progress.phase === 'shootOff') {
        return { title: 'Stechen!', body: `Gleichstand mit ${actor}: ein Pfeil entscheidet.` };
      }
      return {
        title: `${duelEndName(duel.format)} ${news.index + 1} komplett`,
        body: `${actor} hat geschossen. Stand ${score(duel, recipient, news.progress)}.`,
      };
    }
    case 'decided': {
      const { winner, score: points } = news.progress;
      const shootOff = points.challenger === points.opponent ? ' nach Stechen' : '';
      return {
        title: winner === recipient ? 'Duell gewonnen' : 'Duell verloren',
        body: `Gegen ${actor}: ${score(duel, recipient, news.progress)}${shootOff}.`,
      };
    }
    case 'forfeited':
      return { title: 'Duell gewonnen', body: `${actor} hat aufgegeben.` };
  }
}

/** "4 : 2" from the recipient's side */
function score(duel: Duel, recipient: DuelSide, progress: DuelProgress): string {
  const own = duelScoreLabel(duel.format, progress.score[recipient]);
  const other = duelScoreLabel(duel.format, progress.score[otherSide(recipient)]);
  return `${own} : ${other}`;
}
