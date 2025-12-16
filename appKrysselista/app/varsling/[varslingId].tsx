import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

import { Notification } from '@/types/notification';

export default function VarslingDetailScreen() {
  const { varslingId } = useLocalSearchParams<{ varslingId: string }>();
  const [varsling, setVarsling] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!varslingId) {
      setLoading(false);
      return;
    }

    const fetchVarsling = async () => {
      try {
        const docRef = doc(db, 'notifications', varslingId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setVarsling({ id: docSnap.id, ...docSnap.data() } as Notification);
        }
      } catch (error) {
        console.error('Feil ved henting av varsling:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVarsling();
  }, [varslingId]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#6B856E" />
      </ThemedView>
    );
  }

  if (!varsling) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Fant ikke varslingen</ThemedText>
      </ThemedView>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('no-NO', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hent initialer fra navn
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6B856E" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{varsling.title}</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Avsender info */}
        {varsling.senderName && varsling.senderName !== 'System' && (
          <View style={styles.senderContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{getInitials(varsling.senderName)}</ThemedText>
            </View>
            <View style={styles.senderInfo}>
              <ThemedText style={styles.senderName}>
                {varsling.senderRole ? `${varsling.senderRole} ` : ''}{varsling.senderName}
              </ThemedText>
              <ThemedText style={styles.senderDate}>
                {formatDate(varsling.timestamp)}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Tittel */}
        <ThemedText type="title" style={styles.detailTitle}>{varsling.title}</ThemedText>

        {/* Melding */}
        <ThemedText style={styles.message}>{varsling.message}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2EDFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#6B856E',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: '#6B856E',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#BCD6BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B856E',
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6B856E',
  },
  senderDate: {
    fontSize: 14,
    color: '#6B856E',
    opacity: 0.7,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6B856E',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B856E',
  },
});

