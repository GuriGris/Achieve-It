import { ManualSignX, SignInButton } from "../Components/UserAuth";
import { signInWithGooglePopup } from "../utils/firebase.utils";
import { Link } from "react-router-dom";

export default function SignIn() {
    return (
        <div className="signin-screen">
            <p>Register a user for BoxPlan</p>
            <div className="signin-options-list">
                <ManualSignX x="up" />
                <SignInButton imgSrc="/Images/google_logo.svg" name="Google" secondary="true" onClick={signInWithGooglePopup}/>
            </div>
            <div className="createManualUser">
                <p>Already have an account?</p>
                <Link to="/signin"><p>Sign In</p></Link>
            </div>
        </div>
    )
}