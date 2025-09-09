import styles from "./UserAuth.module.css"
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { handleSignOut, signUpWithPassword, signInWithPassword, deleteProfile } from '../utils/firebase.utils';
import {
    getAuth,
    onAuthStateChanged,
} from "firebase/auth";
import {
    getUser,
} from '../authStore';

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
            onClick={props.onClick}
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
            setShowPasswordBox(true);
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
        } else {
          formSubmit();
        }
    }

    const passwordInputRef = useRef(null);

    useLayoutEffect(() => {
    if (showPasswordBox) {
        passwordInputRef.current?.focus();
    }
    }, [showPasswordBox]);

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
                        ref={passwordInputRef}
                    />
                    <SignInButton
                        value={x === "in" ? "Sign in" : "Sign up"}
                        onClick={vaildateSubmit}
                    />
                </>
            }
            {errorMessage &&
                <p style={{color: "red", textAlign: "center"}}>{errorMessage}</p>
            }
        </form>
    )
}

export function GoogleLoguotButton() {
    return (
        <button className={styles.logoutButton} onClick={handleSignOut}>
            Log out
        </button>
    );
}

function Profile() {
    const [clickedProfile, setClickedProfile] = useState(false);
    
    const tryDeleteProfile = () => {
        const confirmDelete = window.confirm(`Do you really want to delete your profile: {${getUser().displayName}}?\nAll your data and login info will be lost.`);

        if (confirmDelete) {
            deleteProfile(getUser());
        }
    }

    // document.addEventListener("click", e => {
    //     console.log(e.target?.parentNode?.classList.includes(styles.profileContainer))
    //     if (!e.target?.parentNode?.classList.includes(styles.profileContainer)) {
    //         setClickedProfile(false);
    //     }
    // })

    return (
        <div className={styles.logoutContainer}>
            <div className={styles.profileContainer} onClick={() => {setClickedProfile(!clickedProfile)}}>
                <p>{getUser()?.displayName}</p>
                <img src={getUser()?.photoURL || "Images/profile.svg"} alt="Profile" className={styles.profileImage} />
            </div>
            {clickedProfile &&
                <div className={styles.profileSettings}>
                    <button className={styles.logoutButton} style={{backgroundColor: "#f32222ff", color: "white"}} onClick={tryDeleteProfile}>
                        Delete profile
                    </button>
                    <GoogleLoguotButton />
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
                    src="Images/profile.svg"
                    alt="Profile"
                    className={`${styles.profileImage} ${styles.emptyProfile}`}
                />
            </div>
        </div>
    );
}

export function UserAuth() {
    const [user, setUser] = useState(false);
    const [noUser, setNoUser] = useState(false);

    useEffect(() => {
        const auth = getAuth();
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
                        <SignInButton />
                    :
                        <EmptyProfile />
                )
            }
        </div>
    );
}