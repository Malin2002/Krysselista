import { StyleSheet, FlatList, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/authProvider';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getUser } from '@/api/userApi';
import { Notification } from '@/types/notification';




export default function VarslingScreen() {
  const { user, kindergardenId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ansatt' | 'foresatt' | null>(null);

  //brukerens rolle
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getUser(user.uid);
        if (userData) {
          const role = (userData as any).role as 'ansatt' | 'foresatt';
          setUserRole(role);
        }
      } catch (error) {
        console.error('Feil ved henting av rolle:', error);
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [user]);

  // Hent varsler fra Firestore
  useEffect(() => {
    if (!kindergardenId || !userRole) {
      setLoading(false);
      return;
    }

    const ref = collection(db, 'notifications');
    const q = query(
      ref,
      where('kindergardenId', '==', kindergardenId),
      where('targetRole', '==', userRole)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      
      const sortedList = list.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeB - timeA; 
      });
      
      setNotifications(sortedList);
      setLoading(false);
    }, (error) => {
      console.error('Feil ved henting av varsler:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [kindergardenId, userRole]);

  const openVarsling = (varslingId: string) => {
    router.push(`/varsling/${varslingId}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Varslinger</ThemedText>
        <ActivityIndicator size="large" color="#6B856E" style={{ marginTop: 20 }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Varslinger</ThemedText>
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={styles.varslingItem}
            onPress={() => openVarsling(item.id)}
            activeOpacity={0.7}
          > 
            <View style={styles.iconContainer}>
              {item.type === 'viktig' || item.type === 'kalender' ? (
                <Ionicons name="megaphone" size={24} color="#E74C3C" />
              ) : item.type === 'soving' ? (
                <Ionicons name="moon" size={24} color="#4A90E2" />
              ) : item.type === 'levert' ? (
                <Ionicons name="checkmark-circle" size={24} color="#6B856E" />
              ) : item.type === 'hentet' ? (
                <Ionicons name="close-circle" size={24} color="#F5A623" />
              ) : item.type === 'fravaer' ? 
              (<Ionicons name="remove-circle" size={24} color="#E74C3C" />
              ) : (
                <Ionicons name="notifications" size={24} color="#6B856E" />
              )}
            </View>
            
            <View style={styles.textContainer}>
              <ThemedText style={styles.varslingTitle}>
                {item.title}
              </ThemedText>
              {item.subtitle ? (
                <ThemedText style={styles.varslingSubtitle}>
                  {item.subtitle}
                </ThemedText>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Ingen varslinger ennå</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2EDFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#E2EDFB',
    color: '#6B856E',
  },
  list: {
    flex: 1,
  },
  varslingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E2EDFB',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  varslingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6B856E',
  },
  varslingSubtitle: {
    fontSize: 14,
    color: '#6B856E',
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: '#6B856E',
    marginLeft: 60,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B856E',
    opacity: 0.7,
  },
});
