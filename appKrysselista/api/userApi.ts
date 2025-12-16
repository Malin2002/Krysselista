import { db } from "@/firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { User } from "@/types/user";

export async function getUser(uid: string) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if(!snap.exists()) return null;
    return { 
        id: snap.id, 
        ...snap.data() 
    } as User;
}

// Hent alle brukerne
export async function getAllUsers(excludeUserId?: string) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      if (excludeUserId) {
        return allUsers.filter(user => user.id !== excludeUserId);
      }
      
      return allUsers;
    } catch (error) {
      console.error('Feil med henting av brukere:', error);
      throw new Error('Kunne ikke hente brukere');
    }
  }
  
  // navn map for alle brukere
  export async function getUserNamesMap(): Promise<{ [key: string]: string }> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const namesMap: { [key: string]: string } = {};
      
      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        namesMap[doc.id] = userData.name || 'Ukjent';
      });
      
      return namesMap;
    } catch (error) {
      console.error('Feil med henting av navn:', error);
      return {};
    }
  }