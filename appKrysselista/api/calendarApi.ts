import { db } from "@/firebaseConfig";
import { CalendarEvent } from "@/types/calendarEvent";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

export async function getMonthEvents(monthId: string) {
    const ref = collection(db, "calendar", monthId, "events");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addEvent(monthId: string, event: CalendarEvent) {
    const eventId = event.id || Date.now().toString();
    const ref = doc(db, "calendar", monthId, "events", eventId);

    await setDoc(ref, {
        date: event.date,
        title: event.title,
        description: event.description || "",
        start: event.start || "",
        end: event.end || "",
    });
}

//date: string, title: string, description?: string, start?: string, end?: string