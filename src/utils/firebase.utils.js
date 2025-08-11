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
  apiKey: "AIzaSyA8OnoSYuuvozhuvkzZgEf5dPKZgm0pnSw",
  authDomain: "box-plan.firebaseapp.com",
  databaseURL: "https://box-plan-default-rtdb.firebaseio.com",
  projectId: "box-plan",
  storageBucket: "box-plan.firebasestorage.app",
  messagingSenderId: "1083451077750",
  appId: "1:1083451077750:web:5b1ab7bf697ae10ddd9b57"
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

export const saveTaskToDatabase = async (task) => {
    console.log(task)
    if (!await getUser()) {
        console.log("No user logged in.");
        return
    }


    try {
        const user = await getUser();
        const taskRef = ref(db, `users/${user.uid}/tasks/${task.id}`);
        set(taskRef, task);
    } catch (error) {
        console.warn("Error saving single to db.\nError:", error);
    }
}

export const saveToDatabase = async (data) => {
    if (!await getUser()) {
        console.log("No user logged in.");
        return
    }

    try {
        console.log(data)
        const user = await getUser();
        const tasksRef = ref(db, `users/${user.uid}/tasks`);
        
        const dataObj = {}
        data.forEach(task => {
            dataObj[task.id] = task;
        });

        set(tasksRef, dataObj);
    } catch (error) {
        console.warn("Error saving to db.\nError:", error);
    }
}

export const deleteFromDatabase = async (taskId) => {
    if (!await getUser()) {
        console.log("No user logged in.");
        return
    }

    try {
        const user = await getUser();
        const taskRef = ref(db, `users/${user.uid}/tasks/${taskId}`);
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
        const snapshot = await get(tasksRef);
        
        let tasks = Object.values(snapshot.val()?.tasks || {});

        return tasks || [];
    } catch (error) {
        console.warn("User isn't logged in.\nError:", error);
    }
}

export const updateLastVisit = async () => {
    const user = await getUser();
    if (!user) return;

    const date = new Date().toDateString();

    // localStorage.setItem("lastVisit", date);
    const lastVisitRef = ref(db, `users/${user.uid}/lastVisit`);
    set(lastVisitRef, date);
}

export const isNewDay = async (authUser) => {
    const user = await getUser() || authUser;
    if (!user) return false

    const today = new Date().toDateString();
    const lastVisitRef = ref(db, `users/${user.uid}/lastVisit`);
    const snapshot = await get(lastVisitRef);

    // const localLastVisit = localStorage.getItem("lastVisit");
    const lastVisit = snapshot.val();

    if (!lastVisit || lastVisit !== today) {
        await set(lastVisitRef, today);
        return true
    }
    
    return false
}