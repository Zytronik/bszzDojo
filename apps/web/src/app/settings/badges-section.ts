import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type AbstractControl,
  type ValidatorFn,
} from '@angular/forms';
import {
  AGE_CATEGORY_MAX_LENGTH,
  BADGE_EARLIEST_YEAR,
  BADGE_KINDS,
  BADGE_KIND_FIELDS,
  BADGE_KIND_LABELS,
  BADGE_PLACES,
  BADGE_PLACE_LABELS,
  BADGE_TEXT_MAX_LENGTH,
  BADGE_VENUES,
  BADGE_VENUE_LABELS,
  BOW_TYPES,
  BOW_TYPE_IDS,
  MAX_DISTANCE,
  badgeFieldErrors,
  currentClubMonth,
  normalizeBadgeInput,
  type BadgeDraft,
  type BadgeInput,
  type BadgeKind,
  type BadgePlace,
  type BadgeVenue,
  type BowTypeId,
} from '@bszz-dojo/shared';
import { BadgesApiService } from '../core/badges-api.service';
import { errorMessage } from '../core/error-message';
import { failure, success, type Feedback } from '../core/feedback';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, messageFrom, required } from '../forms/validators';
import { CheckboxField } from '../ui/checkbox-field';
import { FeedbackMessage } from '../ui/feedback-message';
import { Section } from '../ui/section';

/** The shared rules for one field, run on the whole form since the kind decides what's needed. */
function badgeRule(field: keyof BadgeInput): ValidatorFn {
  return messageFrom((control: AbstractControl) => {
    const form = control.parent;
    if (!(form instanceof FormGroup)) return undefined;
    const draft: BadgeDraft = form.getRawValue();
    return badgeFieldErrors(normalizeBadgeInput(draft))[field];
  });
}

/** "Auszeichnung erfassen" in the settings; the placings are listed (and deleted) on the profile. */
@Component({
  selector: 'app-badges-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Section,
    FeedbackMessage,
    FormField,
    FieldControl,
    FormButton,
    CheckboxField,
  ],
  templateUrl: './badges-section.html',
})
export class BadgesSection {
  private readonly api = inject(BadgesApiService);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly currentYear = currentClubMonth().year;
  protected readonly limits = {
    BADGE_EARLIEST_YEAR,
    BADGE_TEXT_MAX_LENGTH,
    AGE_CATEGORY_MAX_LENGTH,
    MAX_DISTANCE,
  };
  protected readonly kinds = BADGE_KINDS.map((id) => ({ id, label: BADGE_KIND_LABELS[id] }));
  protected readonly places = BADGE_PLACES.map((value) => ({
    value,
    label: `${value} (${BADGE_PLACE_LABELS[value]})`,
  }));
  protected readonly venues = BADGE_VENUES.map((id) => ({ id, label: BADGE_VENUE_LABELS[id] }));
  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));

  protected readonly form = this.forms.group({
    kind: this.forms.control<BadgeKind>('tournament', badgeRule('kind')),
    place: this.forms.control<BadgePlace>(1, badgeRule('place')),
    year: this.forms.control<number | null>(this.currentYear, [required(), badgeRule('year')]),
    eventName: ['', badgeRule('eventName')],
    location: ['', badgeRule('location')],
    bowType: this.forms.control<BowTypeId>('r', badgeRule('bowType')),
    distance: this.forms.control<number | null>(null, [required(), badgeRule('distance')]),
    venue: this.forms.control<BadgeVenue | null>('indoor', badgeRule('venue')),
    is3d: false,
    team: false,
    ageCategory: ['', [required(), badgeRule('ageCategory')]],
  });
  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  /** What the picked kind asks for, so the template only shows those fields. */
  protected readonly fields = computed(() => BADGE_KIND_FIELDS[this.value().kind ?? 'tournament']);
  protected readonly outdoor = computed(
    () => this.fields().venue && this.value().venue === 'outdoor',
  );

  protected readonly pending = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  constructor() {
    // Switching the kind changes what's required, and e.g. the venue decides about 3D.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      for (const control of Object.values(this.form.controls)) {
        control.updateValueAndValidity({ onlySelf: true });
      }
      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected async submit(): Promise<void> {
    const draft = normalizeBadgeInput(this.form.getRawValue());
    const { kind, place, year, bowType, distance, ageCategory } = draft;
    if (
      !checkForm(this.form) ||
      kind === null ||
      place === null ||
      year === null ||
      bowType === null ||
      distance === null ||
      ageCategory === null
    ) {
      this.feedback.set(INVALID_FORM);
      return;
    }

    this.pending.set(true);
    try {
      await this.api.create({ ...draft, kind, place, year, bowType, distance, ageCategory });
      this.feedback.set(success('Auszeichnung erfasst. Du findest sie in deinem Profil.'));
      // Kind, year and bow type usually stay the same for the next one.
      for (const field of ['place', 'eventName', 'location', 'distance', 'is3d', 'team'] as const) {
        this.form.controls[field].reset();
      }
    } catch (error: unknown) {
      this.feedback.set(failure(errorMessage(error)));
    } finally {
      this.pending.set(false);
    }
  }
}
