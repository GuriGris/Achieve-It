import { Link } from "react-router-dom";

export default function PageNotFound() {
    return (
        <div>
            <p>This page seems to not exist.</p>
            <p>Perhaps it was lost in the matrix!</p>
            <p>Click <Link to="/">here</Link> to get back to the startpage</p>
        </div>
    )
}