import styles from './UserAuth.module.css';
import {
    getAuth,
    onAuthStateChanged,
} from "firebase/auth";
import {
    getUser,
} from '../authStore';
import {
    useState,
    useEffect,
} from 'react';
import {
    auth,
    signInWithGooglePopup,
    handleGoogleSignOut
} from '../utils/firebase.utils';

const LoginButton = () => {
    return (
        <div className={styles.loginContainer}>
            <button id='google-login-btn' className={styles.googleButton} onClick={signInWithGooglePopup}>
                <img src="/Images/google_logo.svg" alt="Google Logo" />
                Logg inn med Google
            </button>
        </div>
    );
}

function LoguotButton() {
    return (
        <div className={styles.logoutContainer}>
            <button className={styles.logoutButton} onClick={handleGoogleSignOut}>Logg ut</button>
        </div>
    );
}

function Profile() {
    const [clickedProfile, setClickedProfile] = useState(false);

    return (
        <div className={styles.logoutContainer}>
            <div className={styles.profileContainer} onClick={() => {setClickedProfile(!clickedProfile)}}>
                <img src={getUser()?.photoURL} alt="User profile image" className={styles.profileImage} />
            </div>
            {clickedProfile &&
                <div className={styles.profileSettings}>
                    <LoguotButton />
                </div>
            }
        </div>
    );
}

function EmptyProfile() {
    return (
        <div className={styles.logoutContainer}>
            <div className={styles.profileContainer}>
                <img
                    src="/Images/profile.svg"
                    alt="Profile"
                    className={`${styles.profileImage} ${styles.emptyProfile}`}
                />
            </div>
        </div>
    );
}

export default function UserAuth() {
    const [user, setUser] = useState(false);
    const [noUser, setNoUser] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
                setNoUser(false);
            } else {
                setUser(null);
                setNoUser(true);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className={styles.userAuthContainer}>
            {user ?
                <div>
                    <Profile />
                </div>

            :
                (
                    noUser ? 
                        <LoginButton />
                    :
                        <EmptyProfile />
                )
            }
        </div>
    );
}