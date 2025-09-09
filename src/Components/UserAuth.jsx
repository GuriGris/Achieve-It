import styles from "./UserAuth.module.css"
import { onAuthStateChanged } from "firebase/auth";
import { getUser } from '../authStore';
import { useState, useEffect } from 'react';
import { auth, signInWithGooglePopup, handleSignOut, signUpWithPassword, signInWithPassword } from '../utils/firebase.utils';

export function SignInButton(props) {
    const hoverin = e => {
        e.target.classList.add("signinBtnHover");
    }

    const hoverout = e => {
        e.target.classList.remove("signinBtnHover");
        e.target.classList.remove("signinBtnDown");
    }

    const pointerdown = e => {
        e.target.classList.add("signinBtnDown");
    }

    const pointerup = e => {
        e.target.classList.remove("signinBtnDown");
    }

    return (
        <div
            className={`${styles.signInButton} ${[true, "true"].includes(props.secondary) && styles.secondary}`}
            // onClick={props.onClick}
            onMouseEnter={hoverin}
            onMouseLeave={hoverout}
            onPointerDown={pointerdown}
            onPointerUp={pointerup}
            style={props.secondary ? null : {"backgroundColor": props.bgcolor, "color": props.fntcolor}}
        >
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
    const [errorMessage, setErrorMessage] = useState("");

    const tryShowPasswordBox = () => {
        const emailInput = document.getElementById("manualSignInEmail");
        if (emailInput.checkValidity()) {
            setShowPasswordBox(true)
            // document.getElementById("manualSignInPassword").focus();
        } else {
            emailInput.reportValidity();
        }
    }

    const formSubmit = async () => {
        if (x === "up") {
            setErrorMessage(await signUpWithPassword(manualEmail, manualPassword));
        } else {
            setErrorMessage(await signInWithPassword(manualEmail, manualPassword));
        }
    }

    const vaildateSubmit = e => {
        if (!showPasswordBox) {
            e.preventDefault();
            tryShowPasswordBox();
        }
    }

    return (
        <form className="manualSignInForm" id="manualUserForm" onSubmit={vaildateSubmit}>
            <input type="email" autoComplete="email" id="manualSignInEmail" onChange={e => setManualEmail(e.target.value)} value={manualEmail} placeholder="Email" required />
            {!showPasswordBox && <SignInButton imgSrc="/Images/mail.svg" onClick={tryShowPasswordBox} value="Continue with Email." />}
            {showPasswordBox &&
                <>
                    <input
                        type="password"
                        autoComplete={x === "in" ? "current-password" : "new-password"}
                        id="manualSignInPassword"
                        onChange={e => setManualPassword(e.target.value)}
                        value={manualPassword}
                        placeholder="Password"
                        required
                    />
                    <SignInButton
                        value={x === "in" ? "Sign in" : "Sign up"}
                        onClick={formSubmit}
                    />
                </>
            }
            {errorMessage &&
                <p style={{color: "red", textAlign: "center"}}>{errorMessage}</p>
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
        <button className={styles.logoutButton} onClick={handleSignOut}>
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