import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  AGE_CATEGORIES,
  BADGE_EARLIEST_YEAR,
  BADGE_KINDS,
  BADGE_KIND_FIELDS,
  BADGE_KIND_LABELS,
  BADGE_PLACES,
  BADGE_PLACE_LABELS,
  BADGE_TEXT_MAX_LENGTH,
  BOW_TYPES,
  BOW_TYPE_IDS,
  MAX_DISTANCE,
  BADGE_KIND_TOURNAMENT_TYPES,
  TOURNAMENT_TYPE_LABELS,
  badgeFieldErrors,
  currentClubMonth,
  normalizeBadgeInput,
  type AgeCategory,
  type BadgeDraft,
  type BadgeKind,
  type BadgePlace,
  type BowTypeId,
  type TournamentType,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { BadgesApiService } from '../core/badges-api.service';
import { errorMessage } from '../core/error-message';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import {
  INVALID_FORM,
  checkForm,
  formRule,
  required,
  revalidateOnChange,
} from '../forms/validators';
import { CheckboxField } from '../ui/checkbox-field';
import { ToastStore } from '../layout/toast.store';
import { Dialog } from '../ui/dialog';
import { Section } from '../ui/section';
import { formRow } from 'styled-system/recipes';

const badgeErrors = (draft: BadgeDraft): ReturnType<typeof badgeFieldErrors> =>
  badgeFieldErrors(normalizeBadgeInput(draft));

/** The placings are listed on the profile. */
@Component({
  selector: 'app-badges-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Section,
    FormField,
    FieldControl,
    FormButton,
    CheckboxField,
    Dialog,
  ],
  templateUrl: './badges-section.html',
})
export class BadgesSection {
  protected readonly rows = { even: formRow({ split: 'even' }), wide: formRow({ split: 'wide' }) };
  private readonly api = inject(BadgesApiService);
  private readonly toasts = inject(ToastStore);
  private readonly forms = inject(NonNullableFormBuilder);

  protected readonly currentYear = currentClubMonth().year;
  protected readonly limits = {
    BADGE_EARLIEST_YEAR,
    BADGE_TEXT_MAX_LENGTH,
    MAX_DISTANCE,
  };
  protected readonly kinds = BADGE_KINDS.map((id) => ({ id, label: BADGE_KIND_LABELS[id] }));
  protected readonly places = BADGE_PLACES.map((value) => ({
    value,
    label: `${value} (${BADGE_PLACE_LABELS[value]})`,
  }));
  protected readonly ageCategories = AGE_CATEGORIES;
  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));

  protected readonly form = this.forms.group({
    kind: this.forms.control<BadgeKind>('sm', formRule(badgeErrors, 'kind')),
    place: this.forms.control<BadgePlace>(1, formRule(badgeErrors, 'place')),
    year: this.forms.control<number | null>(this.currentYear, [
      required(),
      formRule(badgeErrors, 'year'),
    ]),
    eventName: ['', formRule(badgeErrors, 'eventName')],
    tournamentType: this.forms.control<TournamentType | null>(
      'fita',
      formRule(badgeErrors, 'tournamentType'),
    ),
    location: ['', formRule(badgeErrors, 'location')],
    bowType: this.forms.control<BowTypeId>('r', formRule(badgeErrors, 'bowType')),
    // Only the Clubturnier asks for it, so the shared rule (not `required`) decides.
    distance: this.forms.control<number | null>(null, formRule(badgeErrors, 'distance')),
    team: false,
    ageCategory: this.forms.control<AgeCategory | null>(null, formRule(badgeErrors, 'ageCategory')),
  });
  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  protected readonly fields = computed(() => BADGE_KIND_FIELDS[this.value().kind ?? 'sm']);
  protected readonly tournamentTypes = computed(() =>
    BADGE_KIND_TOURNAMENT_TYPES[this.value().kind ?? 'sm'].map((id) => ({
      id,
      label: TOURNAMENT_TYPE_LABELS[id],
    })),
  );
  /** A "Team" tournament type says it already. */
  protected readonly askTeam = computed(
    () => this.fields().team && this.value().tournamentType !== 'team',
  );

  protected readonly pending = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly leadStyles = css({ marginBlockEnd: '10' });

  constructor() {
    // Switching from an SM "Team" to a national tournament falls back to FITA.
    this.form.controls.kind.valueChanges.pipe(takeUntilDestroyed()).subscribe((kind) => {
      const type = this.form.controls.tournamentType.value;
      if (type !== null && !BADGE_KIND_TOURNAMENT_TYPES[kind].includes(type)) {
        this.form.controls.tournamentType.setValue('fita');
      }
    });
    revalidateOnChange(this.form);
  }

  protected async submit(): Promise<void> {
    const draft = normalizeBadgeInput(this.form.getRawValue());
    const { kind, place, year, bowType, ageCategory } = draft;
    if (
      !checkForm(this.form) ||
      kind === null ||
      place === null ||
      year === null ||
      bowType === null ||
      ageCategory === null
    ) {
      this.toasts.error(INVALID_FORM);
      return;
    }

    this.pending.set(true);
    try {
      await this.api.create({ ...draft, kind, place, year, bowType, ageCategory });
      this.toasts.success('Auszeichnung erfasst. Du findest sie in deinem Profil.');
      this.dialogOpen.set(false);
      // Kind, year, bow type, tournament type and age category usually stay the same.
      for (const field of ['place', 'eventName', 'location', 'distance', 'team'] as const) {
        this.form.controls[field].reset();
      }
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
    } finally {
      this.pending.set(false);
    }
  }
}
