import {
    initializeApp,
} from "firebase/app";
import {
    getDatabase,
} from "firebase/database"
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from "firebase/auth";
import {
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
        console.error('Login error:', error);
    }
}

export const handleGoogleSignOut = async () => {
    try {
        await auth.signOut();
        setAuthData(null, null);
    } catch (error) {
        console.error("Google sign-out error:", error);
    }
}