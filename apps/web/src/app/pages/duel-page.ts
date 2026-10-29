import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BOW_TYPES,
  BOW_TYPE_IDS,
  DUEL_ARROWS_PER_END,
  DUEL_IDLE_HOURS,
  arrowLabel,
  duelSettingsLabel,
  endTotal,
  isInnerTen,
  shotPoints,
  shownName,
  type BowTypeId,
  type Duel,
  type DuelArrow,
  type Shot,
} from '@bszz-dojo/shared';
import { css, cx } from 'styled-system/css';
import {
  button,
  card,
  duel as duelRecipe,
  input as inputRecipe,
  tabs,
} from 'styled-system/recipes';
import { DuelsApiService } from '../core/duels-api.service';
import { errorMessage } from '../core/error-message';
import { ArrowKeypad } from '../duels/arrow-keypad';
import { DuelEndsTable } from '../duels/duel-ends-table';
import { DuelScoreboard } from '../duels/duel-scoreboard';
import {
  endName,
  endRows,
  hasHandicap,
  progressOf,
  scoreLabels,
  playerLabel,
  sidesOf,
  totalPoints,
} from '../duels/duel-view';
import { DuelsStore } from '../duels/duels.store';
import { FormButton } from '../forms/form-button';
import { PageHeader } from '../layout/page-header';
import { ToastStore, toastErrors } from '../layout/toast.store';
import { loadScoreSetup } from '../scores/score-setup';
import { TargetCanvas } from '../scores/target-canvas';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { EmptyState } from '../ui/empty-state';
import { Icon } from '../ui/icon';
import { faDeleteLeft, faFlag, faRotateRight, faTrophy } from '../ui/icons';
import { LoadingFrame } from '../ui/loading-frame';
import { Section } from '../ui/section';
import { ShownNamePipe } from '../ui/shown-name.pipe';

/** How often an open duel asks for the other archer's arrows; plain polling, no socket. */
const POLL_INTERVAL_MS = 2500;

type EntryMode = 'keys' | 'target';

/**
 * One duel: the invitation (accept with a bow, decline, withdraw), the ends being shot, the
 * shoot-off and the result. Polled while it's open, so the other archer's ends show up.
 */
@Component({
  selector: 'app-duel-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageHeader,
    Section,
    LoadingFrame,
    EmptyState,
    FormButton,
    ConfirmDialog,
    Icon,
    ArrowKeypad,
    DuelScoreboard,
    DuelEndsTable,
    TargetCanvas,
    ShownNamePipe,
  ],
  templateUrl: './duel-page.html',
})
export class DuelPage {
  readonly id = input.required<string>();

  private readonly api = inject(DuelsApiService);
  private readonly duels = inject(DuelsStore);
  private readonly toasts = inject(ToastStore);

  protected readonly duel = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => this.api.get(params.id),
  });
  protected readonly loaded = computed((): Duel | null =>
    this.duel.hasValue() ? this.duel.value() : null,
  );
  protected readonly progress = computed(() => {
    const duel = this.loaded();
    return duel ? progressOf(duel) : null;
  });

  // ---- From the viewer's side ----
  protected readonly sides = computed(() => {
    const duel = this.loaded();
    return duel ? sidesOf(duel) : null;
  });
  protected readonly me = computed(() => {
    const duel = this.loaded();
    const sides = this.sides();
    return duel && sides ? duel[sides.me] : null;
  });
  protected readonly them = computed(() => {
    const duel = this.loaded();
    const sides = this.sides();
    return duel && sides ? duel[sides.them] : null;
  });
  protected readonly isPlayer = computed(() => this.loaded()?.you !== null);
  protected readonly shootOff = computed(() => this.progress()?.phase === 'shootOff');
  /** Ends (or shoot-off arrows) each has shot in the phase being shot */
  protected readonly shot = computed(() => {
    const me = this.me();
    const them = this.them();
    if (!me || !them) return { mine: 0, theirs: 0 };
    return this.shootOff()
      ? { mine: me.shootOffs.length, theirs: them.shootOffs.length }
      : { mine: me.ends.length, theirs: them.ends.length };
  });
  /** Shot the end already and waits for the other archer */
  protected readonly waiting = computed(() => this.shot().mine > this.shot().theirs);
  protected readonly canShoot = computed(
    () =>
      this.loaded()?.status === 'active' &&
      this.isPlayer() &&
      this.progress()?.phase !== 'decided' &&
      !this.waiting(),
  );

  protected readonly score = computed(() => {
    const duel = this.loaded();
    const progress = this.progress();
    if (!duel || !progress) return { left: '0', right: '0' };
    const labels = scoreLabels(duel, progress);
    return { left: labels.mine, right: labels.theirs };
  });
  protected readonly rows = computed(() => {
    const duel = this.loaded();
    const progress = this.progress();
    return duel && progress ? endRows(duel, progress) : [];
  });
  protected readonly endLabel = computed(() => endName(this.loaded()?.format ?? 'sets'));
  protected readonly caption = computed(() => {
    const duel = this.loaded();
    const progress = this.progress();
    if (!duel || !progress || duel.status !== 'active') return '';
    if (progress.phase === 'shootOff') return 'Stechen';
    const handicap = hasHandicap(duel) ? ' · mit Faktor' : '';
    return duel.format === 'sets'
      ? `${this.endLabel()} ${progress.next + 1} · zuerst 6 Satzpunkte${handicap}`
      : `${this.endLabel()} ${progress.next + 1} von 5${handicap}`;
  });
  /** What the last end both shot gave, until the next one */
  protected readonly lastEnd = computed(() => {
    const duel = this.loaded();
    const progress = this.progress();
    const sides = this.sides();
    const end = progress?.ends.at(-1);
    if (!duel || !progress || !sides || !end || progress.phase === 'decided') return null;
    const gained = end.setPoints?.[sides.me] ?? null;
    const outcome =
      gained === null
        ? ''
        : gained === 2
          ? ' · +2 für dich'
          : gained === 1
            ? ' · je +1'
            : ` · +2 für ${shownName(duel[sides.them])}`;
    return `${this.endLabel()} ${progress.ends.length}: ${end.totals[sides.me]} : ${
      end.totals[sides.them]
    }${outcome}`;
  });

  // ---- Entering an end ----
  protected readonly mode = signal<EntryMode>('keys');
  /** The shoot-off is always on the target: the distance to the center decides. */
  protected readonly onTarget = computed(() => this.shootOff() || this.mode() === 'target');
  private readonly slotCount = computed(() => (this.shootOff() ? 1 : DUEL_ARROWS_PER_END));
  /** Empty again for every new end */
  protected readonly draft = linkedSignal({
    source: () => `${this.shootOff()}-${this.shot().mine}-${this.slotCount()}`,
    computation: (): (DuelArrow | null)[] => Array.from({ length: this.slotCount() }, () => null),
  });
  protected readonly selected = linkedSignal({
    source: this.draft,
    computation: (draft): number => Math.max(0, draft.indexOf(null)),
  });
  protected readonly complete = computed(() => this.draft().every((arrow) => arrow !== null));
  protected readonly draftShots = computed(() => this.draft().map((arrow) => arrow?.shot ?? null));
  protected readonly myBow = computed((): BowTypeId => this.me()?.bowType ?? 'r');
  protected readonly sending = signal(false);

  // ---- Invitation ----
  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));
  protected readonly acceptBow = signal<BowTypeId>(loadScoreSetup()?.bowType ?? 'r');
  protected readonly answering = signal(false);
  protected readonly confirmForfeit = signal(false);

  protected readonly result = computed(() => {
    const duel = this.loaded();
    const sides = this.sides();
    if (!duel || !sides || duel.status !== 'finished' || !duel.winner) return null;
    const winner = duel[duel.winner];
    const title = !this.isPlayer()
      ? `${shownName(winner)} gewinnt`
      : duel.winner === sides.me
        ? 'Gewonnen!'
        : 'Verloren';
    let forfeit: string | null = null;
    if (duel.forfeitedBy) {
      forfeit =
        duel.forfeitedBy === sides.me && this.isPlayer()
          ? 'Du hast aufgegeben.'
          : `${shownName(duel[duel.forfeitedBy])} hat aufgegeben.`;
    }
    return { title, won: this.isPlayer() && duel.winner === sides.me, forfeit };
  });
  protected readonly totals = computed(() => {
    const me = this.me();
    const them = this.them();
    if (!me || !them) return null;
    const arrows = (count: number): string =>
      count === 0 ? '–' : (totalPoints(me.ends) / count).toFixed(2);
    const theirs = (count: number): string =>
      count === 0 ? '–' : (totalPoints(them.ends) / count).toFixed(2);
    return {
      mine: totalPoints(me.ends),
      theirs: totalPoints(them.ends),
      myAverage: arrows(me.ends.length * DUEL_ARROWS_PER_END),
      theirAverage: theirs(them.ends.length * DUEL_ARROWS_PER_END),
    };
  });
  /** Same opponent and settings again */
  protected readonly rematch = computed(() => {
    const duel = this.loaded();
    const them = this.them();
    if (!duel || !them) return null;
    return {
      opponent: them.username,
      format: duel.format,
      distance: duel.distance,
      targetSize: duel.targetSize,
      isSpot: duel.isSpot,
    };
  });

  protected readonly settings = computed(() => {
    const duel = this.loaded();
    return duel ? duelSettingsLabel(duel) : '';
  });
  protected readonly idleHours = DUEL_IDLE_HOURS;
  protected readonly icons = {
    delete: faDeleteLeft,
    forfeit: faFlag,
    trophy: faTrophy,
    rematch: faRotateRight,
  };
  protected readonly label = arrowLabel;
  protected readonly playerLabel = playerLabel;
  protected readonly selectStyles = cx(inputRecipe(), css({ marginBlock: '5' }));
  protected readonly rematchStyles = button({ tone: 'subtle' });
  protected readonly duelStyles = duelRecipe();
  protected readonly tabStyles = tabs();
  protected readonly cardStyles = card({ size: 'md' });
  protected readonly styles = {
    stack: css({ display: 'flex', flexDirection: 'column', gap: '10' }),
    row: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10',
    }),
    buttons: css({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10',
      '& > *': { mt: '0' },
    }),
    muted: css({ textStyle: 'body.small', layerStyle: 'muted' }),
    center: css({ textAlign: 'center' }),
    mutedCenter: css({ textStyle: 'body.small', layerStyle: 'muted', textAlign: 'center' }),
    trophy: css({
      fontSize: '5xl',
      color: 'medal.gold',
      display: 'flex',
      justifyContent: 'center',
    }),
    headerButton: css({
      display: 'flex',
      bg: 'transparent',
      border: 'none',
      p: '0',
      color: 'fg.default',
      cursor: 'pointer',
      _hover: { opacity: 'muted' },
    }),
    figures: css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10' }),
    figure: css({ fontSize: 'xl', fontWeight: 'bold' }),
    target: css({ maxW: 'canvas', mx: 'auto', width: 'full' }),
  };

  constructor() {
    toastErrors(() => this.duel.error());
    // An invitation that's open here doesn't need its toast any more.
    effect(() => {
      const duel = this.loaded();
      if (duel?.status === 'invited') untracked(() => this.duels.dismiss(duel.id));
    });
    const timer = setInterval(() => {
      const status = this.loaded()?.status;
      if (document.visibilityState !== 'visible' || this.duel.isLoading()) return;
      if (status === 'invited' || status === 'active') this.duel.reload();
    }, POLL_INTERVAL_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected pick(arrow: DuelArrow): void {
    this.put(arrow);
  }

  protected place(shot: Shot): void {
    const duel = this.loaded();
    if (!duel) return;
    const points = shotPoints(shot, duel.isSpot, this.myBow());
    this.put({ points, x: points === 10 && isInnerTen(shot, duel.isSpot), shot });
  }

  protected removeArrow(): void {
    const draft = [...this.draft()];
    let index = this.selected();
    if (!draft[index]) {
      index = draft.length - 1;
      while (index >= 0 && draft[index] === null) index--;
    }
    if (index < 0) return;
    draft[index] = null;
    this.draft.set(draft);
    this.selected.set(index);
  }

  protected slotTotal(): number {
    return endTotal(this.draft().filter((arrow): arrow is DuelArrow => arrow !== null));
  }

  protected async submitEnd(): Promise<void> {
    const duel = this.loaded();
    const arrows = this.draft();
    if (!duel || !arrows.every((arrow): arrow is DuelArrow => arrow !== null)) return;
    await this.send(() =>
      this.api.submitEnd(duel.id, {
        index: this.shot().mine,
        shootOff: this.shootOff(),
        arrows,
      }),
    );
  }

  protected accept(): Promise<void> {
    return this.answer((id) => this.api.accept(id, { bowType: this.acceptBow() }));
  }

  protected decline(): Promise<void> {
    return this.answer((id) => this.api.decline(id));
  }

  protected cancel(): Promise<void> {
    return this.answer((id) => this.api.cancel(id));
  }

  protected async forfeit(): Promise<void> {
    await this.answer((id) => this.api.forfeit(id));
    this.confirmForfeit.set(false);
  }

  protected setBow(value: string): void {
    const bow = BOW_TYPE_IDS.find((id) => id === value);
    if (bow) this.acceptBow.set(bow);
  }

  private put(arrow: DuelArrow): void {
    const draft = [...this.draft()];
    const index = this.selected();
    draft[index] = arrow;
    this.draft.set(draft);
    const next = draft.indexOf(null);
    this.selected.set(next < 0 ? index : next);
  }

  private async answer(action: (id: string) => Promise<Duel>): Promise<void> {
    const duel = this.loaded();
    if (!duel) return;
    this.answering.set(true);
    try {
      this.duel.set(await action(duel.id));
      void this.duels.refresh();
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
      this.duel.reload();
    } finally {
      this.answering.set(false);
    }
  }

  private async send(request: () => Promise<Duel>): Promise<void> {
    this.sending.set(true);
    try {
      this.duel.set(await request());
      void this.duels.refresh();
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
      this.duel.reload();
    } finally {
      this.sending.set(false);
    }
  }
}
