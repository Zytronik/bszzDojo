import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { steps as stepsRecipe } from 'styled-system/recipes';
import type { InstallPlatform } from '../core/install.service';
import { Icon } from './icon';
import {
  faArrowUpFromBracket,
  faEllipsisVertical,
  faMobileScreenButton,
  faSquarePlus,
} from './icons';

interface Step {
  text: string;
  /** The button to look for in the browser */
  icon?: IconDefinition;
}

const STEPS: Record<InstallPlatform, readonly Step[]> = {
  ios: [
    { text: 'Öffne das BSZZ Dojo in Safari.' },
    { text: 'Tippe in der Leiste auf „Teilen“.', icon: faArrowUpFromBracket },
    { text: 'Wähle „Zum Home-Bildschirm“ (eventuell weiter unten).', icon: faSquarePlus },
    { text: 'Tippe oben rechts auf „Hinzufügen“.' },
  ],
  android: [
    { text: 'Tippe in Chrome oben rechts auf das Menü.', icon: faEllipsisVertical },
    {
      text: 'Wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.',
      icon: faMobileScreenButton,
    },
    { text: 'Bestätige mit „Installieren“.' },
  ],
};

@Component({
  selector: 'app-install-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <ol [class]="styles.list">
      @for (step of steps(); track step.text; let index = $index) {
        <li [class]="styles.step">
          <span [class]="styles.number" aria-hidden="true">{{ index + 1 }}</span>
          <span [class]="styles.text">{{ step.text }}</span>
          @if (step.icon; as icon) {
            <app-icon [icon]="icon" [class]="styles.icon" />
          }
        </li>
      }
    </ol>
  `,
})
export class InstallSteps {
  readonly platform = input.required<InstallPlatform>();

  protected readonly steps = computed(() => STEPS[this.platform()]);
  protected readonly styles = stepsRecipe();
}
