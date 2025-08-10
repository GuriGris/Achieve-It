import {
    useEffect
} from 'react';
import './App.css';
import Header from './Components/Header';
import TaskBox from './Components/TaskBox';
import UserAuth from './Components/UserAuth';
import {
    initAuthListener
} from './utils/firebase.utils';

function App() {
    useEffect(() => {
        initAuthListener();
    }, []);

  return (
    <>
        <UserAuth />
        <Header />
        <div className='container'>
            <TaskBox 
                id = {1}
                name = "Daily Box"
                infoText = "This box is for tasks you have to do every day"
            />
            <TaskBox 
                id = {2}
                name = "Today's Box"
                infoText = "This box is for tasks that you have to do today"
            />
        </div>
        
    </>
  );
}

export default App;
