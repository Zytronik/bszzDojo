import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FormButton } from '../forms/form-button';
import { Dialog } from './dialog';

const meta: Meta<Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  // The backdrop covers the whole viewport, so each story gets its own frame in the docs.
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: '320px' } } },
  args: { open: true, title: 'Auszeichnung erfassen' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [FormButton] },
    template: `
      <app-dialog [open]="open" [title]="title">
        <p>Lange Formulare öffnen sich in einem Dialog.</p>
        <button type="button" appButton>Erfassen</button>
      </app-dialog>
    `,
  }),
};
export default meta;

export const Default: StoryObj<Dialog> = {};
