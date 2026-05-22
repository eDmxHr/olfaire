import {
  IconSparkles,
  IconLayersIntersect,
  IconBottle,
  IconUserCircle,
} from '@tabler/icons-react-native';

export const TABS = [
  { name: 'today', label: 'Today', Icon: IconSparkles },
  { name: 'layer', label: 'Layer', Icon: IconLayersIntersect },
  { name: 'collection', label: 'Collection', Icon: IconBottle },
  { name: 'profile', label: 'Profile', Icon: IconUserCircle },
] as const;
