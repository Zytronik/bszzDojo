import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { UserSearchResult } from '@bszz-dojo/shared';
import { cx } from 'styled-system/css';
import { container, input, searchOverlay } from 'styled-system/recipes';
import { catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { UsersApiService } from '../core/users-api.service';
import { Icon } from '../ui/icon';
import { faXmark } from '../ui/icons';
import { SearchOverlayState } from './search-overlay.service';

const SEARCH_DEBOUNCE_MS = 200;

/** `null` while there's nothing to show (empty query or still typing the first letters). */
type SearchResults = UserSearchResult[] | null;

@Component({
  selector: 'app-search-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  host: { '(document:keydown.escape)': 'state.close()' },
  templateUrl: './search-overlay.html',
})
export class SearchOverlay {
  protected readonly state = inject(SearchOverlayState);
  private readonly users = inject(UsersApiService);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly query = signal('');
  protected readonly results = toSignal(
    toObservable(this.query).pipe(
      map((query) => query.trim()),
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap((query) =>
        query.length === 0
          ? of<SearchResults>(null)
          : this.users.search(query).pipe(
              startWith<SearchResults>(null),
              catchError(() => of<SearchResults>([])),
            ),
      ),
    ),
    { initialValue: null },
  );

  protected readonly closeIcon = faXmark;
  protected readonly closedStyles = searchOverlay({ open: false });
  protected readonly openStyles = searchOverlay({ open: true });
  protected readonly panelStyles = cx(container(), this.openStyles.panel);
  protected readonly inputStyles = input();

  constructor() {
    effect(() => {
      if (this.state.open()) {
        // After the overlay became visible, so the focus isn't lost to `visibility: hidden`.
        setTimeout(() => this.field()?.nativeElement.focus());
      } else {
        this.query.set('');
      }
    });
  }
}
