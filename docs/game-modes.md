# Game modes

BSZZ Dojo has two ways to shoot: **rounds** (Scores), which feed the profiles and the leaderboards,
and **duels**, match play against another archer. This page explains the rules of each and the
timings behind them (polling, expiry, offline sync). The rules live in `packages/shared/src`, so
the web app and the API apply the same ones; the file is named with each section.

| Mode          | Who         | Counts for                  | Needs a connection     |
| ------------- | ----------- | --------------------------- | ---------------------- |
| Round (Score) | alone       | profile, leaderboards       | no, uploaded later     |
| Leaderboards  | everyone    | the dashboard               | no, cached for 30 days |
| Duel          | two archers | the duel record on profiles | yes                    |
| Streak        | alone       | the dashboard, profiles     | yes                    |

## Rounds (Scores)

`scores.ts`, `target.ts`, `target-stats.ts` · web `pages/submit-score-page.ts` · API `scores/`

A round is one session: bow type, target face (122, 80, 60 or 40cm, full face or spot), distance
(1–90m), date shot, number of arrows (1–300) and the result with its tens and nines.

### Entering a round

The form ("Score erfassen", `/scores/new`) has two tabs:

- **Scheibe** (default): every arrow is placed on the target. Tens, nines and the result follow
  from the positions, so they can't be typed. The arrows come in ends of 3, or 6 at 30m
  (`arrowsPerEnd`), so the arrow count must divide by that. Once an arrow is placed, the setup
  (bow, face, distance, arrows, date) is locked: the arrows were shot like that. Switching to
  the other tab and back keeps the placed arrows.
- **Resultat**: only the totals are typed in. There's no target analysis for these rounds.

Scoring on the target (`shotPoints`):

- A full face has rings 1–10, a spot only 6–10; outside is a miss (0).
- An arrow on a line counts for the higher ring.
- The inner 10 (X) is half as wide as the 10. For compound bows only the X counts 10; the rest of
  the 10 counts 9.

The form starts with the setup of the last round saved on the device (localStorage). The API
checks every round with the same rules (`scoreErrors`): the date isn't in the future or before
2000, there aren't more tens and nines than arrows, the result fits the arrows (at most 10 each,
at least the points of the tens and nines), and for target rounds the totals match the arrows.

### The round's page

`/scores/:id` shows the round to everyone. For the archer it compares the result with their other
rounds with the same bow, distance and arrow count (average and best). Target rounds also show the
arrows per end, the group size in cm (without the outliers furthest from the group), the totals
per end and how many arrows hit each ring.

The archer can **edit** their own round from that page (pencil in the header): the same form,
filled in, saved with `PUT /api/scores/:id`. The round keeps its id, so links and the leaderboard
order stay. Editing needs a connection and isn't possible while the round waits for its upload.

### Offline

Rounds can be entered without a connection. They wait on the device (`PendingScoresStore`) and are
uploaded:

- as soon as the app has a session with a connection again (start, login, back online),
- when the app comes to the front,
- every **30 seconds** while rounds are waiting.

Each round carries an id picked on the device, so an upload that's repeated after a lost answer
doesn't record it twice. Deleting works offline the same way. Until the upload, the round shows up
dimmed in the lists, and the header shows "Offline" (with the number waiting) or
"Synchronisiere…" instead of toasts.

## Leaderboards

`rankings.ts`, `bow-types.ts` · API `rankings/leaderboard.ts` · web dashboard

The dashboard ranks rounds of exactly **30 arrows** at **18m, 8m and 30m** (one tab each, 18m
first), in two boards:

- **All time**: every round ever.
- **Monthly**: rounds shot in the current calendar month, by the day shot, in the club's time
  zone (Europe/Zurich).

Each archer appears once, with their best round, and the board shows the **top 10**. Rounds are
compared with a **handicap per bow type**, so different bows can be ranked together:

| Bow type     | Factor |
| ------------ | ------ |
| Compound     | 100%   |
| Recurve      | 102%   |
| Barebow      | 112%   |
| Traditionell | 118%   |
| Langbogen    | 120%   |

The adjusted result is `result × factor`, rounded down (`adjustedResult`). The best round per
archer is picked by the adjusted result, not the raw one. On a tie, whoever shot it first (by
date, then by when it was entered) is ahead.

The **medal table** counts the tournament placings archers record themselves (Auszeichnungen):
gold 3 points, silver 2, bronze 1; ties go to more golds, then silvers, then the name. Top 10.

The leaderboards load when the dashboard opens; there's no polling. Offline, the last answer from
the service worker cache is shown (at most 30 days old), with rounds still waiting for their upload
merged in.

## Training streak

`streaks.ts` · API `streaks/` · web `dashboard/streak-card.ts`

Like Duolingo's streak, counted in weeks: how many weeks in a row an archer trained at least once.
A recorded round counts for the week of the day it was shot, a duel end for the week it was
closed in. Weeks run Monday to Sunday in the club's time zone.

- While this week has no training yet, the streak still counts up to last week: it's only lost
  once a whole week passes without training.
- The dashboard shows the logged-in archer's streak, their record (longest streak) and the last 8
  weeks; the flame lights up once this week is done. Profiles show everyone's current streak.
- It's computed on every request from the rounds and duel ends, so deleting or editing a round
  changes it too. Rounds still waiting for their upload count once they're uploaded.

## Duels

`duels.ts` · API `duels/` · web `pages/duel-*.ts`, `duels/`

Match play in the style of World Archery, against another club member. Duels are separate from
rounds: they don't appear in the history and don't count for the leaderboards. Profiles show each
archer's duel record (won, lost) and, for other archers, the viewer's record against them.

### Setting up

1. The **challenger** opens "Herausfordern" on the other archer's profile and picks the
   **format** and the **distance**, which apply to both, and their own **bow** and **face**.
2. The **challenged archer** sees the invitation on the dashboard (and as a toast while the app is
   open) and **accepts** with their own bow and face, or **declines**. Until then the challenger
   can **withdraw** it.

Two archers can only have one open duel (invited or active) between them at a time. The last duel
set up or accepted on a device is remembered there for the next one (format, distance, bow,
face); without one, the forms start with the setup of the last round.

### Formats

Every end is 3 arrows. Both formats compare the ends with the **bow factors** from the
leaderboards when the two shoot different bows (`weighted`: points × factor). With the same bow
the plain points count.

**Satzsystem** (`sets`):

- Each end is a set: the higher (weighted) total gets 2 set points, a tie 1 each.
- The first to **6 set points** wins, which can happen before the 5th set.
- At **5:5 after 5 sets**: shoot-off.

**Gesamtpunkte** (`total`):

- **5 ends**; the higher sum of the weighted totals wins.
- Level after 5 ends: shoot-off.

**Shoot-off** (Stechen): one arrow each, placed on the target. The arrow **closer to the center**
wins, whatever its ring. Exactly as close: another arrow each.

The total shown with the factor is rounded down like on the leaderboards, but the result is
decided on the exact values, so "285 : 285" can still have a winner.

### Shooting

Each archer enters their end with the keys (X, 10 … the lowest ring, M) or by placing the arrows on
the target, and closes it. The API checks the arrows fit the archer's face and bow.

- The other archer's end stays **hidden** until both have shot it, so nobody can react to it.
- An archer can be **at most one end ahead**; then they wait for the other.
- Sending the same end again (after a lost answer) changes nothing.

An archer can **give up** an active duel; it counts as a loss. After a finished duel, "Revanche"
opens a new invitation with the same opponent and settings.

### Statuses and expiry

| Status      | Meaning                                             |
| ----------- | --------------------------------------------------- |
| `invited`   | waiting for the challenged archer                   |
| `declined`  | the challenged archer said no                       |
| `cancelled` | the challenger withdrew the invitation              |
| `expired`   | nobody answered within 24 hours                     |
| `active`    | being shot                                          |
| `finished`  | decided, with a winner (also when one side gave up) |
| `abandoned` | nobody shot for 2 hours; no winner                  |

- An **invitation** lapses **24 hours** after it was sent (`DUEL_INVITATION_HOURS`).
- An **active duel** is abandoned after **2 hours** without a change (`DUEL_IDLE_HOURS`): the
  clock starts again when it's accepted and with every end either archer closes.

There's no scheduled job: the API checks for stale duels whenever duels are read or changed
(lists, a duel, a profile, a new invitation). A duel past its time therefore changes its status
with the next request, which in practice is the next poll.

### Polling

Duels don't use a socket; the app asks the API again at fixed intervals, and only while the
browser tab is visible:

| What                                  | Interval        | Also                                         |
| ------------------------------------- | --------------- | -------------------------------------------- |
| An open duel's page (invited, active) | **2.5 seconds** | stops once the duel is over                  |
| The user's invitations and open duels | **20 seconds**  | when the app comes to the front, after login |

The second poll runs everywhere in the app (`DuelsStore`): it fills the dashboard and toasts
invitations that arrive while the app is open (each once; the ones there at startup only show on
the dashboard). Duels aren't cached by the service worker, so they need a connection.

### Push messages

Polling only works while the app is open. For everything else, archers can turn on push messages
per device under Einstellungen → Mitteilungen. They also arrive while the app is in the background
or closed, and a tap opens the duel. The app asks once per device, at the start and after
challenging someone or accepting a duel; after "Später" it doesn't ask again on that device.

| When                                                 | Who gets it               |
| ---------------------------------------------------- | ------------------------- |
| A new invitation                                     | the challenged archer     |
| The invitation is accepted or declined               | the challenger            |
| An end (or shoot-off arrow) was shot: "Du bist dran" | the other archer          |
| Both shot the end: its result with the score         | the one who shot first    |
| Level after the regular ends: shoot-off              | the one who shot first    |
| The duel is decided, or the other gave up            | the archer who didn't act |

Each archer only hears about what the other one did. A device shows one message per duel; a newer
one replaces it. Push messages need the browser's permission, and on iPhones (iOS 16.4 or newer)
the app installed on the home screen. Logging out turns them off on that device. Invitations that
lapse or duels that are abandoned send nothing, because the API only notices that on the next
request.

## Timings at a glance

| What                                      | Value                                        | Where                            |
| ----------------------------------------- | -------------------------------------------- | -------------------------------- |
| Duel page poll                            | 2.5 s                                        | `pages/duel-page.ts`             |
| Invitations and open duels poll           | 20 s                                         | `duels/duels.store.ts`           |
| Duel invitation lapses                    | 24 h after sent                              | `DUEL_INVITATION_HOURS`          |
| Active duel abandoned                     | 2 h without a change                         | `DUEL_IDLE_HOURS`                |
| Push message kept for an offline device   | 12 h                                         | `push/push.service.ts`           |
| Offline rounds retry                      | 30 s, on reconnect and focus                 | `scores/pending-scores.store.ts` |
| Cached reads (rankings, profiles, rounds) | network first, cache after 5 s, kept 30 days | `ngsw-config.json`               |
