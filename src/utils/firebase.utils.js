import {
    initializeApp,
} from "firebase/app";
import {
    get,
    getDatabase,
    push,
    ref,
    remove,
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
        console.log("No user logged in.");
        return
    }

    try {
        if (data.type != (id === 1 ? "general" : "today")) {
            console.log(`Wrong dbRefField, got ${data.type}, but should be ${id === 1 ? "general" : "today"}`)
            return;
        }
        const user = await getUser();
        const taskRef = ref(db, `users/${user.uid}/${id === 1 ? "general" : "today"}/${data.id}`);
        set(taskRef, data);
    } catch (error) {
        console.warn("Error saving to db.\nError:", error);
    }
}

export const deleteFromDatabase = async (listId, taskId) => {
    if (!await getUser()) {
        console.log("No user logged in.");
        return
    }

    try {
        const user = await getUser();
        const taskRef = ref(db, `users/${user.uid}/${listId === 1 ? "general" : "today"}/${taskId}`);
        remove(taskRef);
    } catch (error) {
        console.warn("Error deleting to db.\nError:", error);
    }
}

export const getFromDatabase = async () => {
    if (!await getUser()) {
        console.log("No user logged in.");
        return [];
    }

    try {
        const user = await getUser();
        const tasksRef = ref(db, `users/${user.uid}`);
        const snapshotVal = (await get(tasksRef))?.val();
        return snapshotVal
    } catch (error) {
        console.warn("User isn't logged in.\nError:", error);
    }
}

export const getLastVisit = async () => {
    const user = await getUser();
    if (!user) return;

    const lastVisitRef = ref(db, `users/${user.uid}/lastVisit`);
    const lastVisit = await get(lastVisitRef);
    console.log(lastVisit.val(), user.uid)
    return lastVisit.val();
}

export const updateLastVisit = async () => {
    const date = new Date().toDateString()
    const user = await getUser();
    if (!user) return;

    const lastVisitRef = ref(db, `users/${user.uid}/lastVisit`);
    set(lastVisitRef, date)
}

export const isNewDay = async () => {
    const user = await getUser();
    if (!user) return false;

    const today = new Date().toDateString()
    const lastVisitRef = ref(db, `users/${user.uid}/lastVisit`);
    const snapshot = await get(lastVisitRef);
    const lastVisit = snapshot.val();

    console.log("hello", lastVisit)

    if (!lastVisit || lastVisit !== today) {
        await set(lastVisitRef, today);
        return true; 
    }
    
    return false; 
}