import {
    initializeApp,
} from "firebase/app";
import {
    get,
    getDatabase,
    ref,
    set,
} from "firebase/database"
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from "firebase/auth";
import {
    getUser,
    setAuthData,
} from "./../authStore"

const firebaseConfig = {
  apiKey: "AIzaSyDSEejefa0bd2zqfHoxzCR9c1uibj-N34o",
  authDomain: "theachieveit.firebaseapp.com",
  projectId: "theachieveit",
  storageBucket: "theachieveit.firebasestorage.app",
  messagingSenderId: "185404356382",
  appId: "1:185404356382:web:7ec611fb61d875bc10fb0f"
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
})

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const auth = getAuth();

export const initAuthListener = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const token = await user.getIdToken();
            setAuthData(user, token);
        } else {
            setAuthData(null, null);
            
        }
    });
};

export const signInWithGooglePopup = async () => {
    try {
        const { user } = await signInWithPopup(auth, googleProvider);
        setAuthData(user, await user.getIdToken());
        return user;
    } catch (error) {
        console.error('Sign-in error:', error);
    }
}

export const handleGoogleSignOut = async () => {
    try {
        await auth.signOut();
        setAuthData(null, null);
    } catch (error) {
        console.error("Sign-out error:", error);
    }
}

export const saveToDatabase = async (id, data) => {
    if (!await getUser()) {
        console.log("No user logged in, setting to localstorage");
        localStorage.setItem(`tasks-${id}`, JSON.stringify(data));
        return
    }

    try {
        const user = await getUser();
        const tasksRef = ref(db, `users/${user.uid}/tasks-${id}`);
        set(tasksRef, data);
    } catch (error) {
        console.log("Error saving to db.\nError:", error);
    }
}

export const getFromDatabase = async (id) => {
    if (!await getUser()) {
        console.log("No user logged in, getting from localStorage");
        const saved = localStorage.getItem(`tasks-${id}`);
        return saved ? JSON.parse(JSON.parse(saved)) : [];
    }

    try {
        const user = await getUser();
        const tasksRef = ref(db, `users/${user.uid}/tasks-${id}`);
        const snapshotVal = (await get(tasksRef)).val();
        const savedTasks = snapshotVal ? JSON.parse(snapshotVal) : [];
        return savedTasks;
    } catch (error) {
        console.log("User isn't logged in.\nError:", error);
    }
}