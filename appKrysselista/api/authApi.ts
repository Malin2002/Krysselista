import { auth, db } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getUser } from "./userApi";

export async function logIn(email: string, password: string) {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const user = credentials.user;

    const profile = await getUser(user.uid);

    if(!profile) {
        throw new Error("Brukeren er ikke registrert i denne barnehagen");
    }

    return {
        user,
        profile,
    };
}


{/*const uid = credentials.user.uid;

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if(!snap.exists()) {
        throw new Error("Brukeren er ikke registrert som ansatt i denne barnehagen");
    }

    return {
        uid,
        ...snap.data(),
    };*/}