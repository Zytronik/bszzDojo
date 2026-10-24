import type { Preview } from '@storybook/angular-vite';
import { themes } from 'storybook/theming';
import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme of the app (an account setting)',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'dark' },
  decorators: [
    (story, context) => {
      document.documentElement.dataset['theme'] = String(context.globals['theme'] ?? 'dark');
      return story();
    },
  ],
  parameters: {
    layout: 'padded',
    // The page's own background (`bg.canvas`) shows behind every story.
    backgrounds: { disable: true },
    docs: { theme: themes.dark },
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};

export default preview;
