import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase.utils";
import { useEffect, useState } from "react";
import { GoogleLoguotButton, UserAuth } from "./UserAuth";

export default function Header(){
    const [user, setUser] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser("");
            }
        });

        return () => unsubscribe();
    }, []);

    return(
        <div className="header">
            <h1 className="headerTitle">BoxPlan</h1>
            {(user.displayName || user.email) &&
                <div className="headerLogoutButton">
                    {/* <p>{(user.email && user.displayName) || user.email}</p>
                    <GoogleLoguotButton /> */}
                    <UserAuth />
                </div>
            }
        </div>
    )
}