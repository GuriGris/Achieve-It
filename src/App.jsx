import {
    useEffect
} from 'react';
import './App.css';
import Home from './routes/Home';
import SignIn from './routes/SignIn';
import SignUp from './routes/SignUp';
import PageNotFound from "./routes/PageNotFound"
import {
    auth,
    initAuthListener
} from './utils/firebase.utils';
import { onAuthStateChanged } from 'firebase/auth';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

export const router = createBrowserRouter([
    {path: "/", element: <Home />},
    {path: "/signin", element: <SignIn />},
    {path: "/signup", element: <SignUp />},
    {path: "*", element: <PageNotFound />}
])

const requireSignin = true;

function App() {
    useEffect(() => {
        initAuthListener();

        onAuthStateChanged(auth, user => {
            if (router.window.location.pathname !== "/signup" && requireSignin) {
                router.navigate(user ? "/" : "/signin")
            } else if (!requireSignin) {
                router.navigate(user ? "/" : "/")
            }
        })
    }, []);

  return (
    <div className="content">
        <RouterProvider router={router} />
    </div>
  );
}

export default App;
