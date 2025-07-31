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
            <h1><strong>Achieve</strong>-It</h1>
            {displayName && <p style={{margin: 0}}>Hello {displayName}</p>}
        </div>
    )
}