import { db } from "@/firebaseConfig";
import { Child } from "@/types/child";
import { GalleryImage } from "@/types/galleryImage";
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
    Timestamp,
} from "firebase/firestore";

//type for varsling
type AddAbsenceOptions = {
    kindergardenId: string;
    childName?: string;
    senderName?: string;
    senderRole?: string;
  };

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
    return { id: snap.id, ...snap.data() } as Child;
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
        hasAbsenceToday: false,
        updatedAt: serverTimestamp(),
    });

    
}


{/* FRAVÆR */}
export async function addAbsence(
    childId: string, 
    reason: "syk" | "ferie" | "annet", 
    date: string, 
    note?: string,
    opts?: AddAbsenceOptions  // parameter til varsling
    ) {
    const ref = doc(db, "children", childId, "attendance", date);

    await setDoc(ref, {
        reason,
        note: note || "",
        createdAt: serverTimestamp(),
    });

    const childRef = doc(db, "children", childId);
    await updateDoc(childRef, {
        status: "fravaer",
        hasAbsenceToday: true,
    });

    if (opts?.kindergardenId) {
        const notifId = `${childId}-${date}-fravaer`;
        await setDoc(doc(db, "notifications", notifId), {
            type: "fravaer",
            targetRole: "ansatt",
            kindergardenId: opts.kindergardenId,
            title: `${opts.childName || "Barn"} er meldt fravær`,
            subtitle: date,
            message: note ? `Årsak: ${reason}. Notat: ${note}` : `Årsak: ${reason}.`,
            timestamp: serverTimestamp(),
            senderName: opts.senderName || "Foresatt",
            senderRole: opts.senderRole || "foresatt",
        });
    }
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

export async function addSleep(
    childId: string, 
    startTime: string, 
    endTime: string, 
    date: string,
    opts?: AddAbsenceOptions 
    ) {
    const ref = collection(db, "children", childId, "sleepLogs");

    await addDoc(ref, {
        date,
        startTime,
        endTime,
        createdAt: serverTimestamp(),
    });

    if (opts?.kindergardenId) {
        await addDoc(collection(db, "notifications"), {
            type: "soving",
            targetRole: "foresatt",
            kindergardenId: opts.kindergardenId,
            title: `Søvnlogg for ${opts.childName || "barn"}`,
            subtitle: date,
            message: `Sov fra ${startTime} til ${endTime}`,
            timestamp: serverTimestamp(),
            senderName: opts.senderName || "Ansatt",
            senderRole: opts.senderRole || "ansatt",
        });
    }
}


{/* MATLOGG */}
export async function getFood(childId: string) {
    const ref = collection(db, "children", childId, "foodLogs");
    const q = query(ref, orderBy("time", "desc"));

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({id: d.id, ...d.data()}));
}

export async function addFood(
    childId: string, 
    meal: string, 
    description: string, 
    time: string, 
    date: string,
    opts?: AddAbsenceOptions  
    ) {
    const ref = collection(db, "children", childId, "foodLogs");

    await addDoc(ref, {
        date,
        meal,
        description,
        time,
        createdAt: serverTimestamp(),
    });

     //varsel til foresatte om mat
     if (opts?.kindergardenId) {
        await addDoc(collection(db, "notifications"), {
            type: "mat",
            targetRole: "foresatt",
            kindergardenId: opts.kindergardenId,
            title: `Ny matlogg for ${opts.childName || "barn"}`,
            subtitle: date,
            message: `${meal}: ${description} (kl. ${time})`,
            timestamp: serverTimestamp(),
            senderName: opts.senderName || "Ansatt",
            senderRole: opts.senderRole || "ansatt",
        });
    }
}



{/* BILDEGALLERI */}
export async function getGallery(childId: string): Promise<GalleryImage[]> {
    const ref = collection(db, "children", childId, "gallery");
    const q = query(ref, orderBy("uploadedAt", "desc"));

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
        id: d.id, 
        ...d.data() as Omit<GalleryImage, "id"> 
    }));
}

export async function addImage(
    childId: string, 
    imageUrl: string,
    opts?: AddAbsenceOptions 
    ) {
    const ref = collection(db, "children", childId, "gallery");

    await addDoc(ref, {
        imageUrl,
        uploadedAt: serverTimestamp(),
    });

    //Varsel til foresatte om bilder
    if (opts?.kindergardenId) {
        await addDoc(collection(db, "notifications"), {
            type: "bilde",
            targetRole: "foresatt",
            kindergardenId: opts.kindergardenId,
            title: `Nytt bilde for ${opts.childName || "barn"}`,
            subtitle: "",
            message: "Se nytt bilde i galleriet.",
            timestamp: serverTimestamp(),
            senderName: opts.senderName || "Ansatt",
            senderRole: opts.senderRole || "ansatt",
        });
    }
}




/*const varselRef = collection(db, "notifications");
    await addDoc(varselRef, {
        type: "statusEndring",
        childId,
        text: `Status endret til ${status}`,
        userId: performedBy,
        timestamp: serverTimestamp(),
    });*/