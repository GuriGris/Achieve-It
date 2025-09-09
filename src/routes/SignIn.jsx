import { useState } from "react"
import { ManualSignX, SignInButton } from "../Components/UserAuth"
import { Link } from "react-router-dom";
import { signInWithGooglePopup } from "../utils/firebase.utils";

export default function SignIn() {
    const [createManualUser, setCreateManualUser] = useState(false);
    return (
        <div className="signin-screen">
            {!createManualUser &&
            <>
                <p>Log in to BoxPlan</p>
                <div className="signin-options-list">
                    <ManualSignX x="in" />
                    <div className="separator"></div>
                    <SignInButton imgSrc="/Images/google_logo.svg" name="Google" secondary="true" onClick={signInWithGooglePopup}/>
                    {/* <SignInButton
                        value="Continue without an account"
                        bgcolor="#323233"
                        fntcolor="#f0f0f0"
                    /> */}
                </div>
                <div className="createManualUser">
                    <p>Don't have an account?</p>
                    <Link to="/signup"><p>Sign Up</p></Link>
                </div>
            </>
            }
        </div>
    )
}