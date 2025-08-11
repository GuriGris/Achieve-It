import React, { useState, useEffect } from "react";
import InfoText from "./InfoText";
import CreateArea from "./CreateArea";
import Task from "./Task";
import EditWindow from "./EditWindow";
import {
    auth,
    db,
    getFromDatabase,
    deleteFromDatabase,
    isNewDay,
    saveTaskToDatabase
} from "../utils/firebase.utils";
import {
    onAuthStateChanged
} from "firebase/auth";
import {
    setAuthData,
    setData,
    useData,
} from "../authStore";
import {
    onChildAdded,
    onChildChanged,
    onChildRemoved,
    ref,
} from "firebase/database";

export default function TaskBox(props){

    const tasks = useData();
    const [editingState, setEditingState] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [date, setDate] = useState(new Date().getDay())

    const fetchTasks = async () => {
        const data = await getFromDatabase();
        setData(data);
    }

    const checkForNewDay = async (user = null) => {
        const isNew = await isNewDay(user);
        
        if (isNew) {
            const currentTasks = await getFromDatabase();
            resetTaskCompletion(currentTasks);
        }
    };

    useEffect(() => {
        checkForNewDay(); 
    }, [], [date], [tasks]);

    useEffect(() =>{
        setDate(new Date().getDay())

        const interval = setInterval(() =>{
            setDate(new Date().getDay())
        }, 60000)

        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        fetchTasks(props.id);

        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                console.log(authUser && "Logged in, fetching data from database");
                setAuthData(authUser, await authUser.getIdToken());
                fetchTasks();
            } else {
                console.log("User not logged in")
            }
        });
        return () => unsubscribe();
    }, [props.id]);

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            checkForNewDay(user);

            if (user) {
                const tasksRef = ref(db, `users/${user.uid}/tasks`);
                
                [onChildAdded, onChildChanged, onChildRemoved].forEach(listener => {
                    listener(tasksRef, () => fetchTasks());
                });
            }
        });
    }, []);

    function createTask(task){
        return(
            <Task 
            key = {task.id}
            task = {task}
            tasks={tasks}
            secondsToTime = {secondsToTime}
            updateTask = {updateTask}
            deleteTask={deleteTask}
            length={currentTasks.length}
            editingState={editingState}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            />
        )
    }

    function resetTaskCompletion(currentTasks) {    
        alert("New day, resetting tasks")            
        currentTasks.forEach(task => {
            updateTask(task.id, {
                currenTime: task.startTime || 0, 
                reps: task.startReps || 0,
                completed: false
            }, currentTasks)
        })
    }

    function updateTask(taskId, updatedFields, options = {}) {
        const { from, to, newestTasks } = options;
        
        let currentTasks = (newestTasks || tasks).map(task =>
            task.id === taskId ? { ...task, ...updatedFields } : task
        );
        
        if (from !== undefined && to !== undefined && from !== to) {
            const taskType = currentTasks.find(task => task.id === taskId).type;
            
            currentTasks.forEach(task => {
                if (task.type === taskType && task.id !== taskId) {
                    if (from < to && task.position > from && task.position <= to) {
                        task.position -= 1;
                    } else if (from > to && task.position >= to && task.position < from) {
                        task.position += 1;
                    }
                }
            });
            
            currentTasks.filter(task => task.type === taskType).forEach(task => saveTaskToDatabase(task));
        } else {
            saveTaskToDatabase(findTaskWithId(taskId, currentTasks));
        }
        setData(currentTasks);
    }

    function deleteTask(taskId){
        const deletedPosition = findTaskWithId(taskId, tasks).position

        const updatedTasks = (Array.isArray(tasks) ? tasks : []).filter(task =>
            task.id !== taskId
        );

        updatedTasks.forEach(task => {
            if(task.position > deletedPosition){
                task.position -= 1
            }
        })

        setData(updatedTasks);
        
        updatedTasks.forEach(task => {
            saveTaskToDatabase(task);
        });
        deleteFromDatabase(taskId);
    }

    function findTaskWithId (taskId, updatedTasks){
        return updatedTasks.find(task => task.id === taskId);
    }

    function secondsToTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    }

    function timeToSeconds(hours, minutes, seconds = 0) {
        return hours * 3600 + minutes * 60 + seconds;
    }

    function closeEdit(){
        setEditingTask(null)
    }

    const todayTasks = tasks ? tasks.filter(task => task.type === "today").sort((a, b) => a.position - b.position) : []
    const generalTasks = tasks ? tasks.filter(task => task.type === "general").sort((a, b) => a.position - b.position) : []

    const currentTasks = props.id === 1 ? generalTasks : todayTasks;
    const incomplete = currentTasks ? currentTasks.filter(task => !task.completed) : [];
    const completed = currentTasks ? currentTasks.filter(task => task.completed) : [];

    useEffect(() => {
        if (currentTasks.length === 0){
            setEditingState(false)
        }
    }, [currentTasks]);

    return(
        <div className="taskBox">
            <h2 className="boxHeading">{props.name}</h2>
            <InfoText text={props.infoText}/>
            <CreateArea 
            id={props.id}
            tasks={tasks}
            timeToSeconds={timeToSeconds}
            />
            <div className="taskContainer" key={incomplete}>
                {currentTasks.length > 0 ?
                    <button className={`${"editSwitch"} ${editingState ? "activeEdit" : null}`} onClick={() => setEditingState(!editingState)}>
                        Edit: {editingState ? "on" : "off"}
                    </button> 
                :
                    null
                }
                
                <ol className="Incompleted" key={incomplete.length}>
                    {
                        incomplete.map(createTask)
                    }
                </ol>
                
                {completed.length > 0 ? 
                <>
                <h3 className="doneHeading">Completed: {completed.length}/{currentTasks.length}</h3> 
                <ol className="Completed" key={completed.length}>
                    {
                        completed.map(createTask)
                    }
                </ol>
                </>
                : null}
            </div>
            {editingTask && (
                <EditWindow 
                    task={editingTask}
                    closeEdit={closeEdit}
                    secondsToTime={secondsToTime}
                    timeToSeconds={timeToSeconds}
                    updateTask={updateTask}
                    maxPosition={currentTasks.length}
                />
            )}
        </div>
    )
}