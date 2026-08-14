import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWaSXvleBjJMfZFjbdrWCeqJAYa4F08PA",
  authDomain: "core-slice-gxctm.firebaseapp.com",
  projectId: "core-slice-gxctm",
  storageBucket: "core-slice-gxctm.firebasestorage.app",
  messagingSenderId: "691649666128",
  appId: "1:691649666128:web:287ca11be81362207d4555"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
}, "ai-studio-anomaliagamedesi-9bff76a3-d033-404b-a2c1-9bb9a1cb496c");


