import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

export default defineNuxtPlugin(nuxtApp => {
  const runtimeConfig = useRuntimeConfig()

  // Helper to clean the config values
  const clean = (val: string) => (val || '').replace(/["',]/g, '');

  const firebaseConfig = {
    apiKey: clean(runtimeConfig.public.apiKey),
    authDomain: clean(runtimeConfig.public.authDomain),
    projectId: clean(runtimeConfig.public.projectId),
    storageBucket: clean(runtimeConfig.public.storageBucket),
    messagingSenderId: clean(runtimeConfig.public.messagingSenderId),
    appId: clean(runtimeConfig.public.appId),
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  nuxtApp.provide('db', db)
})
