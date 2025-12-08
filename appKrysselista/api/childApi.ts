import { db } from "@/firebaseConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

export async function getChildren(kindergardenId: string) {
    const collectionRef = collection(db, "children");

    const q = query(
        collectionRef,
        where("kindergardenId", "==", kindergardenId), 
        orderBy("name")
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getChild(childId: string) {
    const ref = doc(db, "children", childId);
    const snap = await getDoc(ref);

    if(!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function setChildStatus(
    childId: string,
    status: "inn" | "ut" | "fravaer",
    performedBy: string,
    kindergardenId: string,
) {
    const ref = doc(db, "children", childId);

    await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
    });

    /*const varselRef = collection(db, "notifications");
    await addDoc(varselRef, {
        type: "statusEndring",
        childId,
        text: `Status endret til ${status}`,
        userId: performedBy,
        timestamp: serverTimestamp(),
    });*/
}