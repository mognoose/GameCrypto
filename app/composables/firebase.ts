import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const runtimeConfig = useRuntimeConfig()

const firebaseConfig = {
  apiKey: runtimeConfig.public.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)