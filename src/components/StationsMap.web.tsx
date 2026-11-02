import { View } from 'react-native';
import type { StationsMapProps } from './StationsMap';
import { Text } from './Text';

/** Žemėlapis naršyklėje nepalaikomas – tik testavimui kompiuteryje. */
export function StationsMap(_props: StationsMapProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dfe9e3' }}>
      <Text>Žemėlapis rodomas telefone (Expo Go)</Text>
    </View>
  );
}
