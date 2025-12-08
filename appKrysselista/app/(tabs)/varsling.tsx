import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function VarslingScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Varsling</ThemedText>
      {/* Legg til ditt varslingsinnhold her */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});