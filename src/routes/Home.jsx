import Header from '../Components/Header';
import TaskBox from "../Components/TaskBox";

export default function Home() {
    return (
        <>
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
    )
}