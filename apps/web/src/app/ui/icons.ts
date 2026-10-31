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
  faFaceFrown,
  faGear,
  faHeart,
  faHourglassHalf,
  faKey,
  faMagnifyingGlass,
  faMobileScreenButton,
  faRotateRight,
  faSquarePlus,
  faTrophy,
  faUser,
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

/** Font Awesome's regular (outline) heart, which isn't in the solid set installed here */
export const faHeartOutline: IconDefinition = {
  prefix: 'far',
  iconName: 'heart',
  icon: [
    512,
    512,
    [],
    '',
    'M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z',
  ],
};
