import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { router } from 'expo-router';
import { getKindergardens } from '@/api/kindergardenApi';
import { Kindergarden } from '@/types/kindergarden';
import { useAuth } from '@/providers/authProvider';
import { User as AppUser } from '@/types/user';

export default function Index() {
  const { setUser, setAppUser, setKindergardenId } = useAuth();

  const [barnehage, setBarnehage] = useState<Kindergarden | null>(null);
  const [brukernavn, setBrukernavn] = useState('');
  const [passord, setPassord] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [barnehager, setBarnehager] = useState<Kindergarden[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getKindergardens();
      setBarnehager(data);
    })();
  }, []);

  const handleVelgBarnehage = (item: Kindergarden) => {
    setBarnehage(item);
    setShowPicker(false);
  };

  const handleLogin = async () => {
    if (!brukernavn || !passord) {
      Alert.alert('Feil', 'Vennligst fyll inn brukernavn og passord');
      return;
    }

    if (!barnehage) {
      Alert.alert("Feil", "Velg barnehage først");
      return;
    }

    setLoading(true);
    try {
      // Logg inn med Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, brukernavn, passord);
      const firebaseUser = userCredential.user;

      // Hent brukerdata fra Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        Alert.alert('Feil', 'Brukerdata ikke funnet');
        return;
      }

      const appUser = userDoc.data() as AppUser;

      // Sjekk at brukeren tilhører valgt barnehage
      if (appUser.kindergardenId !== barnehage.id) {
        Alert.alert("Feil", "Bruker tilhører ikke valgt barnehage");
        return;
      }

      // Lagre både firebaseUser og appUser i context
      setUser(firebaseUser);
      setAppUser(appUser);
      setKindergardenId(appUser.kindergardenId);

      // Naviger basert på rolle
      if (appUser.role === "ansatt") {
        router.replace("/(tabs)"); // ansatte til krysselista
      } else if (appUser.role === "foresatt") {
        if (!appUser.children || appUser.children.length === 0) {
          Alert.alert("Feil", "Ingen barn registrert for foresatt");
          return;
        }
        router.replace(`/child/${appUser.children[0]}`); // foresatt til sitt barn
      }

    } catch (error: any) {
      let errorMessage = 'Innlogging feilet';
      if (error.code === 'auth/user-not-found') errorMessage = 'Bruker ikke funnet';
      else if (error.code === 'auth/wrong-password') errorMessage = 'Feil passord';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Ugyldig e-postadresse';
      Alert.alert('Feil', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Innlogging</ThemedText>

        {/* Velg barnehage */}
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
          <ThemedText style={{ color: barnehage ? "#000" : "#999" }}>
            {barnehage ? barnehage.name : "Velg barnehage"}
          </ThemedText>
        </TouchableOpacity>

        {/* Brukernavn */}
        <TextInput
          style={styles.input}
          placeholder="Brukernavn (e-post)"
          placeholderTextColor="#999"
          value={brukernavn}
          onChangeText={setBrukernavn}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />

        {/* Passord */}
        <TextInput
          style={styles.input}
          placeholder="Passord"
          placeholderTextColor="#999"
          value={passord}
          onChangeText={setPassord}
          secureTextEntry
          autoCorrect={false}
        />

        {/* Logg inn */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> :
            <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>Logg inn</ThemedText>
          }
        </TouchableOpacity>
      </View>

      {/* Barnehagepicker */}
      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ThemedText type='title' style={{ marginBottom: 10, color: "#546856" }}>Velg barnehage</ThemedText>
            <FlatList
              data={barnehager}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleVelgBarnehage(item)}>
                  <ThemedText style={{ color: "#546856", borderBottomWidth: 1, borderColor: "#546856" }}>{item.name}</ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <ThemedText style={{ textAlign: "center", marginTop: 10, color: "#546856" }}>Avbryt</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: "#E2EDFB" 
  },
  content: { 
    width: '100%', 
    maxWidth: 400 
  },
  title: { 
    marginBottom: 32, 
    textAlign: 'center', 
    color: "#546856" 
  },
  input: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#546856',
    backgroundColor: '#F5F5F5',
    fontSize: 16,
    color: '#546856',
    marginBottom: 16,
    minHeight: 50,
  },
  loginButton: { 
    width: '100%', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#6B85A5', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 12 
  },
  loginButtonDisabled: { 
    opacity: 0.6 
  },
  loginButtonText: { 
    color: '#fff', 
    fontSize: 16 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "#000000aa", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  modalBox: { 
    width: "100%", 
    maxWidth: 380, 
    maxHeight: "70%", 
    backgroundColor: "#E2EDFB", 
    borderRadius: 16, 
    padding: 20 
  },
  modalItem: { 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
  },
});