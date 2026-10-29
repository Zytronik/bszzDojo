import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { shownName, type UserSearchResult } from '@bszz-dojo/shared';
import { searchOverlay } from 'styled-system/recipes';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { UsersApiService } from '../core/users-api.service';
import { Icon } from '../ui/icon';
import { faChevronRight, faCircleXmark, faMagnifyingGlass } from '../ui/icons';
import { RecentSearches } from './recent-searches';
import { SearchOverlayState } from './search-overlay.service';

const SEARCH_DEBOUNCE_MS = 200;

/** `null` while there's nothing to show (empty query or still typing the first letters). */
type SearchResults = UserSearchResult[] | null;

interface TextPart {
  text: string;
  match: boolean;
}

/** The text with its first case-insensitive occurrence of `query` marked, as the API matches. */
export function markMatch(text: string, query: string): TextPart[] {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, at), match: false },
    { text: text.slice(at, at + query.length), match: true },
    { text: text.slice(at + query.length), match: false },
  ].filter((part) => part.text.length > 0);
}

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
  private readonly router = inject(Router);
  private readonly recent = inject(RecentSearches);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  protected readonly query = signal('');
  private readonly searched = toObservable(this.query).pipe(
    map((query) => query.trim()),
    debounceTime(SEARCH_DEBOUNCE_MS),
    distinctUntilChanged(),
  );
  /** What the shown results were searched for, to mark it in them */
  protected readonly term = toSignal(this.searched, { initialValue: '' });
  protected readonly results = toSignal(
    this.searched.pipe(
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
  /** Before anything is typed, the profiles opened last instead of results */
  protected readonly searching = computed(() => this.query().trim().length > 0);
  protected readonly rows = computed(
    (): UserSearchResult[] =>
      (this.searching() ? this.results() : this.recent.profiles()) ?? [],
  );
  /** The row Enter opens, moved with the arrow keys */
  protected readonly active = linkedSignal({ source: this.rows, computation: () => 0 });
  protected readonly activeId = computed(() =>
    this.rows().length > 0 ? `user-search-${this.active()}` : null,
  );
  protected readonly count = computed(() => {
    const results = this.results();
    return this.searching() && results !== null ? `${results.length} Treffer` : '';
  });

  protected readonly icons = {
    search: faMagnifyingGlass,
    clear: faCircleXmark,
    open: faChevronRight,
  };
  protected readonly closedStyles = searchOverlay({ open: false });
  protected readonly openStyles = searchOverlay({ open: true });

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

  protected nameParts(result: UserSearchResult): TextPart[] {
    return markMatch(shownName(result), this.searching() ? this.term() : '');
  }

  protected usernameParts(result: UserSearchResult): TextPart[] {
    const term = this.searching() ? this.term() : '';
    return [{ text: '@', match: false }, ...markMatch(result.username, term)];
  }

  protected open(result: UserSearchResult): void {
    this.recent.add(result);
    this.state.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const results = this.rows();
    if (results.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.active.update((index) => (index + step + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = results[this.active()];
      if (!result) return;
      void this.router.navigate(['/profile', result.username]);
      this.open(result);
    }
  }

  protected clear(): void {
    this.query.set('');
    this.field()?.nativeElement.focus();
  }

  /** A tap on the dimmed page around the card */
  protected closeOutside(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.state.close();
  }
}
