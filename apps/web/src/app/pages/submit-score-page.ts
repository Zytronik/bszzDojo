import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  arrowsPerEnd,
  BOW_TYPES,
  BOW_TYPE_IDS,
  EARLIEST_SCORE_DATE,
  MAX_ARROWS,
  MAX_DISTANCE,
  POINTS_PER_ARROW,
  TARGET_SIZES,
  scoreFieldErrors,
  isInnerTen,
  shotPoints,
  shotTotals,
  todayInClub,
  type BowTypeId,
  type ScoreInput,
  type Shot,
  type TargetSize,
} from '@bszz-dojo/shared';
import { distinctUntilChanged, map, merge } from 'rxjs';
import { Router } from '@angular/router';
import { css, cx } from 'styled-system/css';
import { AuthStore } from '../auth/auth.store';
import { errorMessage, isUnreachable } from '../core/error-message';
import { ScoresApiService } from '../core/scores-api.service';
import { PendingScoresStore } from '../scores/pending-scores.store';
import { loadScoreSetup, saveScoreSetup } from '../scores/score-setup';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import {
  INVALID_FORM,
  checkForm,
  formRule,
  required,
  revalidateOnChange,
} from '../forms/validators';
import { ToastStore } from '../layout/toast.store';
import { ScoreSheet } from '../scores/score-sheet';
import { TargetCanvas } from '../scores/target-canvas';
import { CheckboxField } from '../ui/checkbox-field';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';
import { Tabs, type TabItem } from '../ui/tabs';
import { formRow, split } from 'styled-system/recipes';

type NumberField = 'distance' | 'tens' | 'nines' | 'arrows' | 'result';

const DEFAULT_TARGET_ARROWS = 30;
const SETUP_FIELDS = ['bowType', 'targetSize', 'isSpot', 'shotOn', 'distance', 'arrows'] as const;
/** What most rounds in the club are shot at */
const DEFAULT_DISTANCE = 18;
const DEFAULT_TARGET_SIZE: TargetSize = 60;

function isValidEndCount(arrows: number | null, perEnd: number): arrows is number {
  return (
    arrows !== null &&
    Number.isInteger(arrows) &&
    arrows > 0 &&
    arrows <= MAX_ARROWS &&
    arrows % perEnd === 0
  );
}

/**
 * Two ways to enter a round: only its totals (`result`), or every arrow on the target (`target`),
 * where tens, nines and the result follow from the arrows' positions.
 */
@Component({
  selector: 'app-submit-score-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PageTitle,
    Section,
    Tabs,
    CheckboxField,
    TargetCanvas,
    ScoreSheet,
    FormField,
    FieldControl,
    FormButton,
  ],
  templateUrl: './submit-score-page.html',
})
export class SubmitScorePage {
  protected readonly rows = { even: formRow({ split: 'even' }), wide: formRow({ split: 'wide' }) };
  private readonly api = inject(ScoresApiService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);
  private readonly pendingScores = inject(PendingScoresStore);
  private readonly toasts = inject(ToastStore);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly modes: TabItem[] = [
    { id: 'target', label: 'Scheibe' },
    { id: 'result', label: 'Resultat' },
  ];
  protected readonly mode = signal<string>('target');

  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));
  protected readonly targetSizes = TARGET_SIZES;
  protected readonly today = todayInClub();
  protected readonly earliestDate = EARLIEST_SCORE_DATE;
  protected readonly limits = {
    MAX_DISTANCE,
    MAX_ARROWS,
    MAX_RESULT: MAX_ARROWS * POINTS_PER_ARROW,
  };

  private readonly setup = loadScoreSetup();

  protected readonly form = this.forms.group({
    bowType: this.forms.control<BowTypeId>(this.setup?.bowType ?? 'r'),
    targetSize: this.forms.control<TargetSize>(this.setup?.targetSize ?? DEFAULT_TARGET_SIZE),
    isSpot: this.setup?.isSpot ?? false,
    shotOn: [this.today, [required(), formRule(scoreFieldErrors, 'shotOn')]],
    distance: this.numberControl('distance', this.setup?.distance ?? DEFAULT_DISTANCE),
    tens: this.numberControl('tens'),
    nines: this.numberControl('nines'),
    arrows: this.numberControl('arrows', this.setup?.arrows ?? null),
    result: this.numberControl('result'),
    // `null` in the `result` mode; on the target one slot per arrow, `null` until it's placed.
    shots: this.forms.control<(Shot | null)[] | null>(null, formRule(scoreFieldErrors, 'shots')),
  });
  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly perEnd = computed(() => arrowsPerEnd(this.value().distance));
  protected readonly shots = computed(() => this.value().shots ?? []);
  protected readonly points = computed(() =>
    this.shots().map((shot) =>
      shot ? shotPoints(shot, this.value().isSpot, this.value().bowType) : null,
    ),
  );
  protected readonly inner = computed(() =>
    this.shots().map((shot) => shot !== null && isInnerTen(shot, this.value().isSpot)),
  );
  protected readonly complete = computed(
    () => this.shots().length > 0 && this.shots().every((shot) => shot !== null),
  );
  /** Once an arrow is on the target, the round's setup stays as it was shot. */
  protected readonly locked = computed(
    () => this.mode() === 'target' && this.shots().some((shot) => shot !== null),
  );
  /** The arrow the next tap on the target places */
  protected readonly selected = signal<number | null>(0);

  protected readonly pending = signal(false);
  protected readonly targetStyles = cx(split(), css({ marginBlockEnd: 'stack' }));
  protected readonly summaryStyles = css({
    display: 'flex',
    gap: '15',
    flexWrap: 'wrap',
    marginBlockStart: '10',
  });

  constructor() {
    revalidateOnChange(this.form);
    effect(() => {
      const target = this.mode() === 'target';
      untracked(() => {
        if (!target) {
          this.form.patchValue({ shots: null });
          return;
        }
        const arrows = this.form.controls.arrows;
        if (arrows.value === null) arrows.setValue(DEFAULT_TARGET_ARROWS);
        this.resize(arrows.value);
      });
    });
    effect(() => {
      const locked = this.locked();
      untracked(() => {
        for (const field of SETUP_FIELDS) {
          const control = this.form.controls[field];
          if (locked) control.disable({ emitEvent: false });
          else control.enable({ emitEvent: false });
        }
      });
    });
    // `revalidateOnChange` re-emits every control's value, so only real changes count here.
    // The distance decides the arrows per end.
    merge(
      this.form.controls.arrows.valueChanges.pipe(distinctUntilChanged()),
      this.form.controls.distance.valueChanges.pipe(distinctUntilChanged()),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.mode() === 'target') this.resize(this.form.controls.arrows.value);
      });
    // A spot and compound score the same positions differently.
    merge(
      this.form.controls.isSpot.valueChanges.pipe(distinctUntilChanged()),
      this.form.controls.bowType.valueChanges.pipe(distinctUntilChanged()),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.mode() === 'target') this.setShots(this.shots());
      });
  }

  protected readonly totals = computed(() => {
    const { tens, nines, result } = this.value();
    return { tens: tens ?? 0, nines: nines ?? 0, result: result ?? 0 };
  });

  protected place(shot: Shot): void {
    const index = this.selected();
    const shots = [...this.shots()];
    if (index === null || index >= shots.length) return;
    shots[index] = shot;
    this.setShots(shots);
    this.selected.set(this.nextEmpty(shots, index));
  }

  protected async submit(): Promise<void> {
    const value = this.form.getRawValue();
    const { distance, tens, nines, arrows, result } = value;
    if (
      !checkForm(this.form) ||
      distance === null ||
      tens === null ||
      nines === null ||
      arrows === null ||
      result === null
    ) {
      this.toasts.error(INVALID_FORM);
      return;
    }
    const shots = value.shots?.filter((shot) => shot !== null) ?? null;
    const score: ScoreInput = { ...value, distance, tens, nines, arrows, result, shots };

    const { bowType, targetSize, isSpot } = score;
    saveScoreSetup({ bowType, targetSize, isSpot, distance, arrows });
    if (this.auth.isOffline()) {
      await this.keepForUpload(score);
      return;
    }

    this.pending.set(true);
    try {
      const saved = await this.api.create(score);
      this.toasts.success('Score erfolgreich eingetragen.');
      await this.router.navigate(['/scores', saved.id]);
    } catch (error: unknown) {
      if (isUnreachable(error)) {
        this.auth.markOffline();
        await this.keepForUpload(score);
      } else this.toasts.error(errorMessage(error));
    } finally {
      this.pending.set(false);
    }
  }

  /** Without a connection: kept on the device (the header says so), and its page opens. */
  private async keepForUpload(score: ScoreInput): Promise<void> {
    const id = this.pendingScores.add(score);
    if (id !== null) await this.router.navigate(['/scores', id]);
  }

  /** One slot per arrow, keeping the arrows placed so far; none while the count is invalid. */
  private resize(arrows: number | null): void {
    const current = this.shots();
    const perEnd = arrowsPerEnd(this.form.controls.distance.value);
    const shots = isValidEndCount(arrows, perEnd)
      ? Array.from({ length: arrows }, (_, index) => current[index] ?? null)
      : [];
    this.setShots(shots);
    this.selected.set(this.nextEmpty(shots, -1));
  }

  /** Tens, nines and the result always follow the placed arrows. */
  private setShots(shots: (Shot | null)[]): void {
    const placed = shots.filter((shot) => shot !== null);
    this.form.patchValue({
      shots,
      ...shotTotals(placed, this.form.controls.isSpot.value, this.form.controls.bowType.value),
    });
  }

  /** The next arrow without a position after `index`, wrapping around; `null` when all are set. */
  private nextEmpty(shots: readonly (Shot | null)[], index: number): number | null {
    for (let step = 1; step <= shots.length; step++) {
      const candidate = (index + step) % shots.length;
      if (shots[candidate] === null) return candidate;
    }
    return null;
  }

  private numberControl(
    field: NumberField,
    initial: number | null = null,
  ): FormControl<number | null> {
    return this.forms.control<number | null>(initial, [
      required(),
      formRule(scoreFieldErrors, field),
    ]);
  }
}
