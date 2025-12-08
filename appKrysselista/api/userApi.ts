import { db } from "@/firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
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