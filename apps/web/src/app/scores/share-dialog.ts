import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  APP_NAME,
  BOW_TYPES,
  formatGermanDate,
  shownName,
  targetLabel,
  type ScoreDetail,
} from '@bszz-dojo/shared';
import { css } from 'styled-system/css';
import { FormButton } from '../forms/form-button';
import { ToastStore } from '../layout/toast.store';
import { Dialog } from '../ui/dialog';
import { ShareCard, shareCardBlob, shareCardColors } from './share-card';

function canShareFiles(): boolean {
  if (typeof navigator.canShare !== 'function') return false;
  const probe = new File([], 'score.png', { type: 'image/png' });
  return navigator.canShare({ files: [probe] });
}

/**
 * Shares a round as an image (`ShareCard`) or as a link. Phones get their share sheet; where
 * there's none (most desktop browsers) the image is downloaded and the link copied.
 */
@Component({
  selector: 'app-share-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, FormButton, ShareCard],
  template: `
    <app-dialog title="Score teilen" [open]="open()" (closed)="closed.emit()">
      <!--
        Only while open: a closed dialog keeps its content outside the page, where the card can't
        read its colors from CSS, and it wouldn't draw again on opening.
      -->
      @if (open()) {
        <app-share-card [score]="score()" />
      }
      <div [class]="styles.actions">
        <button type="button" appButton [pending]="image() === null" (click)="shareImage()">
          {{ filesShareable ? 'Bild teilen' : 'Bild speichern' }}
        </button>
        <button type="button" appButton tone="subtle" (click)="shareLink()">
          {{ linkShareable ? 'Link teilen' : 'Link kopieren' }}
        </button>
      </div>
    </app-dialog>
  `,
})
export class ShareDialog {
  readonly open = input.required<boolean>();
  readonly score = input.required<ScoreDetail>();
  readonly closed = output();

  private readonly toasts = inject(ToastStore);
  protected readonly filesShareable = canShareFiles();
  protected readonly linkShareable = typeof navigator.share === 'function';
  /**
   * Made when the dialog opens: Safari only shares straight from a tap, and drawing the image
   * first would take too long.
   */
  protected readonly image = signal<File | null>(null);
  private readonly url = computed(
    () => new URL(`/scores/${this.score().id}`, location.origin).href,
  );
  private readonly text = computed(() => {
    const score = this.score();
    const details = `${BOW_TYPES[score.bowType].name} · ${score.distance}m · ${targetLabel(score)}`;
    return `${shownName(score)}: ${score.result} Punkte (${details}), ${formatGermanDate(score.shotOn)}`;
  });
  protected readonly styles = {
    actions: css({
      display: 'flex',
      gap: '10',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBlockStart: '15',
    }),
  };

  constructor() {
    effect((onCleanup) => {
      if (!this.open()) return;
      const score = this.score();
      let current = true;
      onCleanup(() => (current = false));
      this.image.set(null);
      void shareCardBlob(score, shareCardColors(document.documentElement)).then(
        (blob) => {
          if (!current) return;
          const name = `bszz-dojo-${score.shotOn}-${score.result}.png`;
          this.image.set(new File([blob], name, { type: 'image/png' }));
        },
        () => this.toasts.error('Das Bild konnte nicht erstellt werden.'),
      );
    });
  }

  protected async shareImage(): Promise<void> {
    const file = this.image();
    if (!file) return;
    if (!this.filesShareable) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      // Right away, Safari would cancel the download.
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      return;
    }
    try {
      await navigator.share({ files: [file], title: APP_NAME, text: this.text() });
    } catch {
      // Closed without sharing, or not allowed: nothing to tell.
    }
  }

  protected async shareLink(): Promise<void> {
    if (this.linkShareable) {
      try {
        await navigator.share({ title: APP_NAME, text: this.text(), url: this.url() });
      } catch {
        // Closed without sharing, or not allowed: nothing to tell.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(this.url());
      this.toasts.success('Link kopiert.');
    } catch {
      this.toasts.error('Der Link konnte nicht kopiert werden.');
    }
  }
}
