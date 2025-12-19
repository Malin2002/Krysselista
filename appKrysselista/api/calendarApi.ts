import { db } from "@/firebaseConfig";
import { CalendarEvent } from "@/types/calendarEvent";
import { addDoc, collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

type AddEventOptions = {
    kindergardenId: string;
    senderName?: string;
    senderRole?: string;
};

export async function getMonthEvents(monthId: string) {
    const ref = collection(db, "calendar", monthId, "events");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addEvent(monthId: string, event: CalendarEvent, opts: AddEventOptions) {
    const eventId = event.id || Date.now().toString();
    const ref = doc(db, "calendar", monthId, "events", eventId);

    await setDoc(ref, {
        date: event.date,
        title: event.title,
        description: event.description || "",
        start: event.start || "",
        end: event.end || "",
    });

    await addDoc(collection(db, "notifications"), {
        type: "kalender",
        targetRole: "foresatt",
        kindergardenId: opts.kindergardenId,
        title: event.title || "Ny kalenderhendelse",
        subtitle: event.date,
        message: event.description || "Ny hendelse er lagt til i kalenderen.",
        timestamp: serverTimestamp(),
        senderName: opts.senderName || "System",
        senderRole: opts.senderRole || "ansatt",
    });
}

