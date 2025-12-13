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
    setDoc,
} from "firebase/firestore";

{/* HENT BARN */}
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

{/* OPPDATER STATUS */}
export async function setChildStatus(
    childId: string,
    status: "inn" | "ut" | "fravaer",
    performedBy: string,
) {
    const ref = doc(db, "children", childId);

    await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
    });

    
}


{/* FRAVÆR */}
export async function addAbsence(childId: string, reason: "syk" | "ferie" | "annet", date: string, note?: string) {
    const ref = doc(db, "children", childId, "attendance", date);

    return await setDoc(ref, {
        reason,
        note: note || "",
        createdAt: serverTimestamp(),
    });
}

export async function getAbsence(childId: string) {
    const ref = collection(db, "children", childId, "attendance");
    const q = query(ref, orderBy("date", "desc"));

    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({id: d.id, ...d.data()}));
}


{/* SØVN */}
export async function getSleep(childId: string) {
    const ref = collection(db, "children", childId, "sleepLogs");
    const q = query(ref, orderBy("startTime", "desc"));

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({id: d.id, ...d.data()}));
}

export async function addSleep(childId: string, startTime: string, endTime: string) {
    const ref = collection(db, "children", childId, "sleepLogs");

    return await addDoc(ref, {
        startTime,
        endTime,
        createdAt: serverTimestamp(),
    });
}


{/* MATLOGG */}
export async function getFood(childId: string) {
    const ref = collection(db, "children", childId, "foodLogs");
    const q = query(ref, orderBy("time", "desc"));

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({id: d.id, ...d.data()}));
}

export async function addFood(childId: string, meal: string, description: string, time: string) {
    const ref = collection(db, "children", childId, "foodLogs");

    return await addDoc(ref, {
        meal,
        description,
        time,
        createdAt: serverTimestamp(),
    });
}

{/* BILDEGALLERI */}
export async function getGallery(childId: string) {
    const ref = collection(db, "children", childId, "gallery");
    const q = query(ref, orderBy("uploadedAt", "desc"));

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({id: d.id, ...d.data()}));
}

export async function addImage(childId: string, imageUrl: string) {
    const ref = collection(db, "children", childId, "gallery");

    return await addDoc(ref, {
        imageUrl,
        uploadedAt: serverTimestamp(),
    });
}




/*const varselRef = collection(db, "notifications");
    await addDoc(varselRef, {
        type: "statusEndring",
        childId,
        text: `Status endret til ${status}`,
        userId: performedBy,
        timestamp: serverTimestamp(),
    });*/