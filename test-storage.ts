import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAWaSXvleBjJMfZFjbdrWCeqJAYa4F08PA",
  authDomain: "core-slice-gxctm.firebaseapp.com",
  projectId: "core-slice-gxctm",
  storageBucket: "core-slice-gxctm.firebasestorage.app",
  messagingSenderId: "691649666128",
  appId: "1:691649666128:web:287ca11be81362207d4555"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, 'test.txt');

uploadString(storageRef, 'Hello World').then(() => {
  console.log('Uploaded!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
