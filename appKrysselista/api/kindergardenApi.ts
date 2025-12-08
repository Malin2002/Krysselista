import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Kindergarden } from "@/types/kindergarden";

export async function getKindergardens() {
    const snap = await getDocs(collection(db, "kindergarden"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Kindergarden));
}