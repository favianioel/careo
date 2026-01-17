// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'square.grid.2x2.fill': 'dashboard',
  'person.2.fill': 'people',
  'list.bullet.rectangle.portrait.fill': 'view-kanban',
  'checkmark.circle': 'check-circle-outline',
  'plus': 'add',
  'pencil': 'edit',
  'trash': 'delete',
  'text.bubble.fill': 'add-comment',
  'lock.fill': 'lock',
  'lock.open.fill': 'lock-open',
  'plus.circle.fill': 'add-circle',
  'calendar': 'event',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'mappin.and.ellipse': 'place',
  'gift': 'card-giftcard',
  'heart': 'favorite',
  'figure.2.and.child.holdinghands': 'family-restroom',
  'star': 'star',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
