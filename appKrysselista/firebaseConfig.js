// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDd2qZdCZ6zJaJXgOstmsCleXXR_ja1wzw",
  authDomain: "helsinki-smidig-prosjekt.firebaseapp.com",
  projectId: "helsinki-smidig-prosjekt",
  storageBucket: "gs://helsinki-smidig-prosjekt.firebasestorage.app",
  messagingSenderId: "470732458804",
  appId: "1:470732458804:web:fb643a3d8ce0b489973361",
  measurementId: "G-N8LYRZRM5H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

const storage = getStorage(app);

export const getStorageRef = (path) => ref(storage, path);

export const getDownloadUrl = async (path) => {
    const storageRef = getStorageRef(path);
    const downloadUrl = await getDownloadURL(storageRef);
return downloadUrl;
};

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});