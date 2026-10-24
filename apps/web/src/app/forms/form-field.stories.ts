import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FieldControl, FormField } from './form-field';
import { required } from './validators';

interface FieldArgs {
  label: string;
  hint: string;
  value: string;
  touched: boolean;
}

function control({ value, touched }: FieldArgs): FormControl<string> {
  const field = new FormControl(value, { nonNullable: true, validators: required() });
  if (touched) field.markAsTouched();
  return field;
}

const meta: Meta<FieldArgs> = {
  title: 'Forms/Field',
  component: FormField,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule, FieldControl] })],
  args: {
    label: 'Benutzername:',
    hint: 'Zum Einloggen. Ohne Leerzeichen.',
    value: '',
    touched: false,
  },
  render: (args) => ({
    props: { ...args, control: control(args) },
    template: `
      <app-form-field [label]="label" [hint]="hint">
        <input appFieldControl [formControl]="control" />
      </app-form-field>
    `,
  }),
};
export default meta;

type Story = StoryObj<FieldArgs>;

export const WithHint: Story = {};
export const Filled: Story = { args: { value: 'robin_hood' } };
/** The error shows once the field was touched. */
export const Invalid: Story = { args: { touched: true } };

export const Select: Story = {
  args: { label: 'Bogenart:', hint: '', value: 'Recurve' },
  render: (args) => ({
    props: { ...args, control: control(args) },
    template: `
      <app-form-field [label]="label">
        <select appFieldControl [formControl]="control">
          <option>Recurve</option>
          <option>Compound</option>
          <option>Barebow</option>
        </select>
      </app-form-field>
    `,
  }),
};
