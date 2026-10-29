import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BOW_TYPES,
  BOW_TYPE_IDS,
  DUEL_FORMATS,
  DUEL_FORMAT_NAMES,
  MAX_DISTANCE,
  TARGET_SIZES,
  isDuelFormat,
  isTargetSize,
  shownName,
  usernameKey,
  type BowTypeId,
  type DuelFormat,
  type TargetSize,
  type UserSearchResult,
} from '@bszz-dojo/shared';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import { css } from 'styled-system/css';
import { duel as duelRecipe, formRow, input as inputRecipe, record, tabs } from 'styled-system/recipes';
import { AuthStore } from '../auth/auth.store';
import { errorMessage } from '../core/error-message';
import { DuelsApiService } from '../core/duels-api.service';
import { UsersApiService } from '../core/users-api.service';
import { loadDuelSetup, saveDuelSetup } from '../duels/duel-setup';
import { DuelsStore } from '../duels/duels.store';
import { FormButton } from '../forms/form-button';
import { FieldControl, FormField } from '../forms/form-field';
import { INVALID_FORM, checkForm, required, rule } from '../forms/validators';
import { PageHeader } from '../layout/page-header';
import { ToastStore } from '../layout/toast.store';
import { CheckboxField } from '../ui/checkbox-field';
import { Section } from '../ui/section';

const SEARCH_DEBOUNCE_MS = 200;
const DEFAULT_DISTANCE = 18;
const DEFAULT_TARGET_SIZE: TargetSize = 40;

/** What the format means, under its switch */
const FORMAT_RULES: Record<DuelFormat, string> = {
  sets: 'Sätze à 3 Pfeile: Sieg 2, Unentschieden 1 Satzpunkt. Wer zuerst 6 hat, gewinnt; bei 5:5 entscheidet ein Stechen.',
  total: '5 Passen à 3 Pfeile, die höhere Summe gewinnt; bei Gleichstand entscheidet ein Stechen.',
};

/**
 * The challenger picks the format, distance, face and their own bow. The challenged archer shoots
 * the same distance and face with the bow they pick when accepting; the factors even out the bows.
 * Query params prefill it, e.g. for a rematch.
 */
@Component({
  selector: 'app-duel-new-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PageHeader,
    Section,
    FormField,
    FieldControl,
    CheckboxField,
    FormButton,
  ],
  templateUrl: './duel-new-page.html',
})
export class DuelNewPage {
  readonly opponent = input<string>();
  readonly format = input<string>();
  readonly distance = input<string>();
  readonly targetSize = input<string>();
  readonly isSpot = input<string>();

  private readonly api = inject(DuelsApiService);
  private readonly users = inject(UsersApiService);
  private readonly auth = inject(AuthStore);
  private readonly duels = inject(DuelsStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);
  private readonly forms = inject(NonNullableFormBuilder);
  private readonly setup = loadDuelSetup();

  /** The link only carries the username; the search finds the display name to show. */
  private readonly linkedOpponent = resource({
    params: () => this.opponent() || undefined,
    loader: ({ params }) => firstValueFrom(this.users.search(params)),
  });
  /** From the link (a profile's "Herausfordern", a rematch), else picked here */
  protected readonly rival = linkedSignal((): UserSearchResult | null => {
    const username = this.opponent();
    if (!username) return null;
    const found = this.linkedOpponent.hasValue()
      ? this.linkedOpponent
          .value()
          .find((user) => usernameKey(user.username) === usernameKey(username))
      : undefined;
    return found ?? { username, displayName: null };
  });
  protected readonly query = signal('');
  protected readonly suggestions = toSignal(
    toObservable(this.query).pipe(
      map((query) => query.trim()),
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap((query) =>
        query.length === 0
          ? of<UserSearchResult[]>([])
          : this.users.search(query).pipe(catchError(() => of<UserSearchResult[]>([]))),
      ),
      map((results) => results.filter((user) => user.username !== this.auth.username())),
    ),
    { initialValue: [] },
  );

  protected readonly formats = DUEL_FORMATS.map((id) => ({ id, name: DUEL_FORMAT_NAMES[id] }));
  protected readonly chosenFormat = linkedSignal((): DuelFormat => {
    const format = this.format();
    return isDuelFormat(format) ? format : (this.setup.format ?? 'sets');
  });
  protected readonly formatRules = computed(() => FORMAT_RULES[this.chosenFormat()]);

  protected readonly bowTypes = BOW_TYPE_IDS.map((id) => ({ id, name: BOW_TYPES[id].name }));
  protected readonly targetSizes = TARGET_SIZES;
  protected readonly maxDistance = MAX_DISTANCE;
  protected readonly form = this.forms.group({
    bowType: this.forms.control<BowTypeId>(this.setup.bowType ?? 'r'),
    distance: this.forms.control<number | null>(this.setup.distance ?? DEFAULT_DISTANCE, [
      required(),
      rule(
        (value: number | null) =>
          value !== null && Number.isInteger(value) && value >= 1 && value <= MAX_DISTANCE,
        `Die Distanz muss zwischen 1 und ${MAX_DISTANCE}m liegen.`,
      ),
    ]),
    targetSize: this.forms.control<TargetSize>(this.setup.targetSize ?? DEFAULT_TARGET_SIZE),
    isSpot: this.setup.isSpot ?? false,
  });
  protected readonly saving = signal(false);

  protected readonly rows = formRow({ split: 'even' });
  protected readonly tabStyles = tabs();
  protected readonly searchStyles = inputRecipe();
  protected readonly suggestionStyles = record();
  protected readonly duelStyles = duelRecipe();
  protected readonly styles = {
    hint: css({ textStyle: 'body.small', layerStyle: 'muted', marginBlockStart: '5' }),
    rival: css({
      display: 'flex',
      alignItems: 'center',
      layerStyle: 'surface',
      rounded: 'sm',
      px: '10',
      minH: 'control',
    }),
    label: css({ display: 'block', marginBlockEnd: '5' }),
    block: css({ marginBlockEnd: 'stack' }),
  };

  constructor() {
    // Prefill a rematch with the settings of the duel it repeats.
    const distance = Number(this.distance());
    if (Number.isInteger(distance) && distance >= 1) this.form.controls.distance.setValue(distance);
    const size = Number(this.targetSize());
    if (isTargetSize(size)) this.form.controls.targetSize.setValue(size);
    if (this.isSpot() !== undefined) this.form.controls.isSpot.setValue(this.isSpot() === 'true');
  }

  protected name(user: UserSearchResult): string {
    return shownName(user);
  }

  protected pick(user: UserSearchResult): void {
    this.rival.set(user);
    this.query.set('');
  }

  protected async submit(): Promise<void> {
    const rival = this.rival();
    if (!rival) {
      this.toasts.error('Wähle einen Gegner.');
      return;
    }
    if (!checkForm(this.form)) {
      this.toasts.error(INVALID_FORM);
      return;
    }
    const { bowType, distance, targetSize, isSpot } = this.form.getRawValue();
    if (distance === null) return;
    const setup = { format: this.chosenFormat(), bowType, distance, targetSize, isSpot };
    saveDuelSetup(setup);
    this.saving.set(true);
    try {
      const duel = await this.api.create({ opponent: rival.username, ...setup });
      void this.duels.refresh();
      await this.router.navigate(['/duels', duel.id], { replaceUrl: true });
    } catch (error: unknown) {
      this.toasts.error(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }
}
