import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { getChildren, setChildStatus, getAbsence } from "@/api/childApi";
import ChildCard from "@/components/childCard";
import { useAuth } from "@/providers/authProvider";
import { Child } from "@/types/child";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { router } from "expo-router";

export default function CheckinList() {
  const { kindergardenId, user, setUser, setKindergardenId } = useAuth();
  console.log("Current kindergardenId:", kindergardenId);


  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kindergardenId) return;

    (async () => {
      const data = await getChildren(kindergardenId);
      setChildren(data as Child[]);
      setLoading(false);
    })();
  }, [kindergardenId]);

  const handleLogout = async () => {
    Alert.alert(
      "Logg ut",
      "Er du sikker på at du vil logge ut?",
      [
        {text: "Avbryt", style: "cancel"},
        {
          text: "Logg ut",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              setUser(null);
              setKindergardenId("");
              router.replace("../index");
            } catch (error) {
              Alert.alert("Feil", "Kunne ikke logge ut");
            }
          }
        }
      ]
    )
  }

  if(loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size={"large"} />
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Krysseliste
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logg ut</Text>
        </TouchableOpacity>
      </View>
      

      <FlatList
        data={children}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <ChildCard
            child={item}
            onStatus={async (status) => {
              if (!user?.uid) return;
              if (item.hasAbsenceToday) return;

              await setChildStatus(item.id, status, user.uid);

              setChildren((prev) => 
                prev.map((c) => 
                  c.id === item.id ? { ...c, hasAbsenceToday: true } : c
                )
              );
            }}
          />
        )}
      />
    </View>
  )
}




const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 72,
    backgroundColor: "#E2EDFB",
  },
  header: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#546856",
  },
  logoutButtonText: {
    color: '#546856',
    fontSize: 16,
  },
});














/*import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { router } from 'expo-router';

export default function HomeScreen() {
  const handleLogout = async () => {
    Alert.alert(
      'Logg ut',
      'Er du sikker på at du vil logge ut?',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Logg ut',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (error) {
              Alert.alert('Feil', 'Kunne ikke logge ut');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutButtonText}>Logg ut</ThemedText>
      </TouchableOpacity>
      
      <ThemedText type="title">Velkommen til Krysselista</ThemedText>
      {/* Legg til ditt eget innhold her *//*}
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
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  logoutButtonText: {
    color: '#000',
    fontSize: 16,
  },
});
*/