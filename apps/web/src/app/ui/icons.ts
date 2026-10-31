import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export {
  faArrowUpFromBracket,
  faArrowsRotate,
  faBolt,
  faChevronLeft,
  faChevronRight,
  faCircleXmark,
  faCirclePlus,
  faCrown,
  faDeleteLeft,
  faFlag,
  faEllipsisVertical,
  faGear,
  faHourglassHalf,
  faKey,
  faMagnifyingGlass,
  faMobileScreenButton,
  faRotateRight,
  faSquarePlus,
  faTrophy,
  faUser,
  faUserGroup,
  faUserMinus,
  faUserPlus,
  faWifi,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Share nodes with thin lines, drawn here because Font Awesome's free set only has a heavy one.
 * A 24-unit grid with some space around the shape, so it looks lighter next to the full-size icons.
 */
export const faShareNodesThin: IconDefinition = {
  prefix: 'fas',
  iconName: 'share-nodes',
  icon: [
    24,
    24,
    [],
    '',
    [
      'M7.41 12.69L17.41 6.69A0.8 0.8 0 0 0 16.59 5.31L6.59 11.31A0.8 0.8 0 0 0 7.41 12.69Z',
      'M6.59 12.69L16.59 18.69A0.8 0.8 0 0 0 17.41 17.31L7.41 11.31A0.8 0.8 0 0 0 6.59 12.69Z',
      'M14.1 5.5a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z',
      'M2.6 12a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z',
      'M14.1 18.5a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z',
    ],
  ],
};
