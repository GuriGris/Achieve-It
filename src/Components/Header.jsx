import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase.utils";
import { useEffect, useState } from "react";

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
            <h1><b>Achieve</b>-It</h1>
        </div>
    )
}