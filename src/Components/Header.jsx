import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase.utils";
import { useEffect, useState } from "react";
import { GoogleLoguotButton } from "./UserAuth";

export default function Header(){
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setDisplayName(authUser.displayName);
            } else {
                setDisplayName("");
            }
        });

        return () => unsubscribe();
    }, []);

    return(
        <div className="header">
            <h1 className="headerTitle">BoxPlan</h1>
            {displayName.length > 0 &&
                <div className="headerLogoutButton">
                    <p>{displayName}</p>
                    <GoogleLoguotButton />
                </div>
            }
        </div>
    )
}