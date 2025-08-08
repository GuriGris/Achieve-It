import React, { useState, useEffect } from "react";
import InfoText from "./InfoText";
import CreateArea from "./CreateArea";
import Task from "./Task";
import EditWindow from "./EditWindow";
import {
    auth,
    db,
    getFromDatabase,
    saveToDatabase,
    deleteFromDatabase,
    getLastVisit,
    updateLastVisit,
} from "../utils/firebase.utils";
import {
    onAuthStateChanged
} from "firebase/auth";
import {
    getUser,
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

    // useEffect(() => {
    //     tasks.forEach(task => {
    //         deleteFromDatabase(1, task.id)
    //     })
    // }, [])

    const fetchTasks = async () => {
        const data = await getFromDatabase();

        const newData = []
        for (let key in data) {
            for (let key_2 in data[key]) {
                newData.push(data[key][key_2])
            }
        }

        if (data !== -1) {
            setData(newData);
        }
    }

    useEffect(() => {

    }, [])

    const getDay = () => {
        return Math.floor(new Date().getTime() / 1000 / 60 / 60 / 24);
    }

    const isNewDay = async () => {
        const lastVisit = await getLastVisit();
        console.log(lastVisit, getDay(), lastVisit && lastVisit !== getDay())
        return lastVisit && lastVisit !== getDay();
    }

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
            if (await isNewDay()) {
                console.log("It's a new day!");
                updateLastVisit();
            }

            if (user) {
                const userId = user.uid;
                const userGeneralRef = ref(db, `users/${userId}/general`);
                const userTodayRef = ref(db, `users/${userId}/today`);

                const childChange = snapshot => {
                    console.log("gseunioj")
                    fetchTasks()
                }

                onChildAdded(userGeneralRef, (snapshot) => {
                    childChange(snapshot)
                });
                onChildAdded(userTodayRef, (snapshot) => {
                    childChange(snapshot)
                });

                onChildChanged(userGeneralRef, (snapshot) => {
                    childChange(snapshot)
                });
                onChildChanged(userTodayRef, (snapshot) => {
                    childChange(snapshot)
                });

                onChildRemoved(userGeneralRef, (snapshot) => {
                    childChange(snapshot)
                });
                onChildRemoved(userTodayRef, (snapshot) => {
                    childChange(snapshot)
                });
            }
        });
    }, []);

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

    function updatePositions(taskId, from, to, updatedFields){
        let currentTasks = tasks.map(task => 
            task.id === taskId 
                ? { ...task, ...updatedFields }
                : task
        );
        
        const taskType = currentTasks.find(task => task.id === taskId).type;

        const listTasks = currentTasks.filter(task => task.type === taskType);

        listTasks.forEach((task) => {
            if (task.id !== taskId){
                if (from <= task.position && task.position <= to){
                task.position -= 1
                } else if (from >= task.position && task.position >= to){
                    task.position += 1
                }
            }
        });

        setData([...currentTasks])
        listTasks.forEach(task => {
            if (task.type === taskType) {
                saveToDatabase(props.id, task);
            }
        });
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
            saveToDatabase(props.id, task);
        });
        deleteFromDatabase(props.id, taskId);
    }

    function closeEdit(){
        setEditingTask(null)
    }

    function createTask(task){
        return(
            <Task 
            key = {task.id}
            task = {task}
            tasks={tasks}
            checkOff = {checkOff}
            secondsToTime = {secondsToTime}
            updateTask = {updateTask}
            deleteTask={deleteTask}
            updatePositions={updatePositions}
            length={currentTasks.length}
            editingState={editingState}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            />
        )
    }

    function updateTask(taskId, updatedFields) {
        const updatedTasks = tasks.map(task =>
            task.id === taskId
            ? { ...task, ...updatedFields }
            : task
        );

        setData(updatedTasks);
        saveToDatabase(props.id, findTaskWithId(taskId, updatedTasks));
    }

    function checkOff(taskId){
        const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task =>
        task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        );

        setData(updatedTasks);
        saveToDatabase(props.id, findTaskWithId(taskId, updatedTasks));
    }

    const todayTasks = tasks ? tasks.filter(task => task.type === "today").sort((a, b) => a.position - b.position) : []
    const generalTasks = tasks ? tasks.filter(task => task.type === "general").sort((a, b) => a.position - b.position) : []

    const currentTasks = props.id === 1 ? generalTasks : todayTasks;
    const incomplete = currentTasks ? currentTasks.filter(task => !task.completed) : [];
    const completed = currentTasks ? currentTasks.filter(task => task.completed) : [];

    useEffect(() => {
        if (currentTasks.length == 0){
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
                    updatePositions={updatePositions}
                />
            )}
        </div>
    )
}