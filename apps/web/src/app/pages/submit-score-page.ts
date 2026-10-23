import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  BOW_TYPES,
  BOW_TYPE_IDS,
  EARLIEST_SCORE_DATE,
  MAX_ARROWS,
  MAX_DISTANCE,
  TARGET_SIZES,
  scoreErrors,
  todayInClub,
  type BowTypeId,
  type ScoreInput,
  type TargetSize,
} from '@bszz-dojo/shared';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { ScoresApiService } from '../core/scores-api.service';
import { TargetCanvas } from '../scores/target-canvas';
import { CheckboxField } from '../ui/checkbox-field';
import { FeedbackMessage } from '../ui/feedback-message';
import { formStyles } from '../ui/form-styles';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';

type NumberField = 'distance' | 'tens' | 'nines' | 'arrows' | 'result';

@Component({
  selector: 'app-submit-score-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageTitle, Section, FeedbackMessage, CheckboxField, TargetCanvas],
  templateUrl: './submit-score-page.html',
})
export class SubmitScorePage {
  protected readonly auth = inject(AuthStore);
  private readonly api = inject(ScoresApiService);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly styles = formStyles;
  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));
  protected readonly targetSizes = TARGET_SIZES;
  protected readonly today = todayInClub();
  protected readonly earliestDate = EARLIEST_SCORE_DATE;
  // In the old form's order.
  protected readonly numberFields: readonly { name: NumberField; label: string; max: number }[] = [
    { name: 'distance', label: 'Distanz:', max: MAX_DISTANCE },
    { name: 'tens', label: '10er:', max: MAX_ARROWS },
    { name: 'nines', label: '9er:', max: MAX_ARROWS },
    { name: 'arrows', label: 'Anzahl Pfeile:', max: MAX_ARROWS },
    { name: 'result', label: 'Resultat:', max: MAX_ARROWS * 10 },
  ];

  protected readonly form = this.forms.group({
    bowType: this.forms.control<BowTypeId>('r'),
    targetSize: this.forms.control<TargetSize>(TARGET_SIZES[0]),
    isSpot: false,
    shotOn: this.today,
    // null while the field is empty
    distance: this.forms.control<number | null>(null),
    tens: this.forms.control<number | null>(null),
    nines: this.forms.control<number | null>(null),
    arrows: this.forms.control<number | null>(null),
    result: this.forms.control<number | null>(null),
  });

  protected readonly pending = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  protected async submit(): Promise<void> {
    const value = this.form.getRawValue();
    const { distance, tens, nines, arrows, result } = value;
    if (distance === null || tens === null || nines === null || arrows === null || result === null) {
      this.feedback.set(failure('Bitte fülle alle Felder aus.'));
      return;
    }
    const score: ScoreInput = { ...value, distance, tens, nines, arrows, result };
    const errors = scoreErrors(score);
    if (errors.length > 0) {
      this.feedback.set(failure(errors.join(' ')));
      return;
    }

    this.pending.set(true);
    try {
      await this.api.create(score);
      this.feedback.set(success('Score erfolgreich eingetragen.'));
      // Bow, target, date and distance usually stay the same for the next round.
      this.form.patchValue({ tens: null, nines: null, arrows: null, result: null });
    } catch (error: unknown) {
      this.feedback.set(failure(errorMessage(error)));
    } finally {
      this.pending.set(false);
    }
  }
}
