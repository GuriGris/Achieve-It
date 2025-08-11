import styles from "./UserAuth.module.css"
import { onAuthStateChanged } from "firebase/auth";
import { getUser } from '../authStore';
import { useState, useEffect } from 'react';
import { auth, signInWithGooglePopup, handleGoogleSignOut } from '../utils/firebase.utils';

export function SignInButton(props) {
    return (
        <div className={`${styles.signInButton} ${[true, "true"].includes(props.secondary) && styles.secondary}`} onClick={props.onClick}>
            {props?.imgSrc && <img src={props?.imgSrc} alt="SignIn-service logo" className={styles.signInServiceLogo} />}
            <p className={styles.signInServiceName}>
                {!props?.value && `Sign in with ${props.name || "{service name}"}`}
                {props?.value && props.value}
            </p>
        </div>
    )
}

export function ManualSignX({ x }) {
    const [manualEmail, setManualEmail] = useState("");
    const [manualPassword, setManualPassword] = useState("");
    const [showPasswordBox, setShowPasswordBox] = useState(false);

    const tryShowPasswordBox = () => {
        const emailInput = document.getElementById("manualSignInEmail");
        console.log(emailInput)
        if (emailInput.checkValidity()) {
            setShowPasswordBox(true)
        } else {
            emailInput.reportValidity();
        }
    }

    return (
        <form className="manualSignInForm" id="manualUserForm">
            <input type="email" autoComplete="email" id="manualSignInEmail" onChange={e => setManualEmail(e.target.value)} value={manualEmail} placeholder="Email" required />
            {!showPasswordBox && <SignInButton onClick={tryShowPasswordBox} value="Continue with Email." />}
            {showPasswordBox && 
                <>
                    <input type="password" autoComplete={x === "in" ? "current-password" : "new-password"} id="manualSignInPassword" onChange={e => setManualPassword(e.target.value)} value={manualPassword} placeholder="Password" required />
                    <SignInButton value={x === "in" ? "Sign in" : "Sign up"} onClick={() => document.getElementById("manualUserForm")?.submit()} />
                </>
            }
        </form>
    )
}

export function GoogleLoginButton() {
    return (
        <div className={styles.loginContainer}>
            <button id='google-login-btn' className={styles.googleButton} onClick={signInWithGooglePopup}>
                <img src="/Images/google_logo.svg" alt="Google Logo" />
                Logg inn med Google
            </button>
        </div>
    );
}

export function GoogleLoguotButton() {
    return (
        <button className={styles.logoutButton} onClick={handleGoogleSignOut}>
            Logg ut
        </button>
    );
}

function Profile() {
    const [clickedProfile, setClickedProfile] = useState(false);

    return (
        <div className={`${styles.rightAlign} ${clickedProfile && styles.profileActive}`}>
            <div className={styles.profileContainer} onClick={() => {setClickedProfile(!clickedProfile)}}>
                <img src={getUser()?.photoURL} alt="Profileimage" className={styles.profileImage} />
            </div>
            <div className={styles.profileSettings}>
                <GoogleLoguotButton />
            </div>
        </div>
    );
}

function EmptyProfile() {
    return (
        <div className={styles.rightAlign}>
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
                        <GoogleLoginButton />
                    :
                        <EmptyProfile />
                )
            }
        </div>
    );
}