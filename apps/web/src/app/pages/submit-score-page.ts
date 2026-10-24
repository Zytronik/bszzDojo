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
  ARROWS_PER_END,
  BOW_TYPES,
  BOW_TYPE_IDS,
  EARLIEST_SCORE_DATE,
  MAX_ARROWS,
  MAX_DISTANCE,
  TARGET_SIZES,
  scoreFieldErrors,
  shotPoints,
  shotTotals,
  todayInClub,
  type BowTypeId,
  type ScoreInput,
  type Shot,
  type TargetSize,
} from '@bszz-dojo/shared';
import { distinctUntilChanged, map } from 'rxjs';
import { css } from 'styled-system/css';
import { errorMessage } from '../core/error-message';
import { ScoresApiService } from '../core/scores-api.service';
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
import { formGrid } from 'styled-system/recipes';

type NumberField = 'distance' | 'tens' | 'nines' | 'arrows' | 'result';

const DEFAULT_TARGET_ARROWS = 30;

function isValidEndCount(arrows: number | null): arrows is number {
  return (
    arrows !== null &&
    Number.isInteger(arrows) &&
    arrows > 0 &&
    arrows <= MAX_ARROWS &&
    arrows % ARROWS_PER_END === 0
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
  protected readonly formStyles = formGrid();
  private readonly api = inject(ScoresApiService);
  private readonly toasts = inject(ToastStore);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly modes: TabItem[] = [
    { id: 'result', label: 'Resultat' },
    { id: 'target', label: 'Scheibe' },
  ];
  protected readonly mode = signal<string>('result');

  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));
  protected readonly targetSizes = TARGET_SIZES;
  protected readonly today = todayInClub();
  protected readonly earliestDate = EARLIEST_SCORE_DATE;
  protected readonly maxArrows = MAX_ARROWS;
  // In the old form's order.
  private readonly resultFields: readonly { name: NumberField; label: string; max: number }[] = [
    { name: 'distance', label: 'Distanz:', max: MAX_DISTANCE },
    { name: 'tens', label: '10er:', max: MAX_ARROWS },
    { name: 'nines', label: '9er:', max: MAX_ARROWS },
    { name: 'arrows', label: 'Anzahl Pfeile:', max: MAX_ARROWS },
    { name: 'result', label: 'Resultat:', max: MAX_ARROWS * 10 },
  ];
  protected readonly numberFields = computed(() =>
    this.mode() === 'target'
      ? this.resultFields.filter(({ name }) => name === 'distance')
      : this.resultFields,
  );

  protected readonly form = this.forms.group({
    bowType: this.forms.control<BowTypeId>('r'),
    targetSize: this.forms.control<TargetSize>(TARGET_SIZES[0]),
    isSpot: false,
    shotOn: [this.today, [required(), formRule(scoreFieldErrors, 'shotOn')]],
    distance: this.numberControl('distance'),
    tens: this.numberControl('tens'),
    nines: this.numberControl('nines'),
    arrows: this.numberControl('arrows'),
    result: this.numberControl('result'),
    // `null` in the `result` mode; on the target one slot per arrow, `null` until it's placed.
    shots: this.forms.control<(Shot | null)[] | null>(null, formRule(scoreFieldErrors, 'shots')),
  });
  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly shots = computed(() => this.value().shots ?? []);
  protected readonly points = computed(() =>
    this.shots().map((shot) => (shot ? shotPoints(shot, this.value().isSpot) : null)),
  );
  protected readonly complete = computed(
    () => this.shots().length > 0 && this.shots().every((shot) => shot !== null),
  );
  /** The arrow the next tap on the target places */
  protected readonly selected = signal<number | null>(0);

  protected readonly pending = signal(false);
  protected readonly targetStyles = css({
    display: 'flex',
    flexDir: 'column',
    gap: '15',
    marginBlockEnd: 'stack',
    md: { display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start', gap: '25' },
  });
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
    // `revalidateOnChange` re-emits every control's value, so only real changes count here.
    this.form.controls.arrows.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((arrows) => {
        if (this.mode() === 'target') this.resize(arrows);
      });
    // A spot scores the same positions differently.
    this.form.controls.isSpot.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
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

  private clearShots(): void {
    this.setShots(this.shots().map(() => null));
    this.selected.set(0);
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

    this.pending.set(true);
    try {
      await this.api.create(score);
      this.toasts.success('Score erfolgreich eingetragen.');
      // Bow, target, date and distance usually stay the same for the next round.
      if (this.mode() === 'target') {
        this.clearShots();
        this.form.controls.shots.markAsUntouched();
      } else {
        for (const field of ['tens', 'nines', 'arrows', 'result'] as const) {
          this.form.controls[field].reset(null);
        }
      }
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
    } finally {
      this.pending.set(false);
    }
  }

  /** One slot per arrow, keeping the arrows placed so far; none while the count is invalid. */
  private resize(arrows: number | null): void {
    const current = this.shots();
    const shots = isValidEndCount(arrows)
      ? Array.from({ length: arrows }, (_, index) => current[index] ?? null)
      : [];
    this.setShots(shots);
    this.selected.set(this.nextEmpty(shots, -1));
  }

  /** Tens, nines and the result always follow the placed arrows. */
  private setShots(shots: (Shot | null)[]): void {
    const placed = shots.filter((shot) => shot !== null);
    this.form.patchValue({ shots, ...shotTotals(placed, this.form.controls.isSpot.value) });
  }

  /** The next arrow without a position after `index`, wrapping around; `null` when all are set. */
  private nextEmpty(shots: readonly (Shot | null)[], index: number): number | null {
    for (let step = 1; step <= shots.length; step++) {
      const candidate = (index + step) % shots.length;
      if (shots[candidate] === null) return candidate;
    }
    return null;
  }

  private numberControl(field: NumberField): FormControl<number | null> {
    return this.forms.control<number | null>(null, [required(), formRule(scoreFieldErrors, field)]);
  }
}
