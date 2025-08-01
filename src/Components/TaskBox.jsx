import React, { useState, useEffect } from "react";
import InfoText from "./InfoText";
import CreateArea from "./CreateArea";
import Task from "./Task";
import EditWindow from "./EditWindow";
import { auth, db, getFromDatabase, saveToDatabase } from "../utils/firebase.utils";
import { onAuthStateChanged } from "firebase/auth";
import { getUser, setAuthData, setData, useData, } from "../authStore";
import { onChildAdded, onChildChanged, onChildRemoved, onValue, ref } from "firebase/database";

export default function TaskBox(props){

    const tasks = useData();
    const setTasks = setData;
    const [editingTask, setEditingTask] = useState(null)

    useEffect(() => {
        saveToDatabase(props.id, JSON.stringify(tasks));
    }, [tasks]);

    const fetchTasks = async (id) => {
        const data = await getFromDatabase(id);

        const safeData = Array.isArray(data) ? data : [];
        console.log(safeData)
        setTasks(safeData);
    }

    useEffect(() => {
        fetchTasks(props.id);

        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                console.log(authUser && "Logged in, fetching data from database");
                setAuthData(authUser, await authUser.getIdToken());
                fetchTasks(props.id);
            } else {
                console.log("User not logged in")
            }
        });
        return () => unsubscribe();
    }, [props.id]);

    function secondsToTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    }

    function timeToSeconds(hours, minutes, seconds = 0) {
        return hours * 3600 + minutes * 60 + seconds;
    }

    function openEdit(task){
        setEditingTask(task)
    }

    function closeEdit(){
        setEditingTask(null)
    }

    function updatePositions(taskId, from, to){
        const taskType = tasks.find(task => task.id === taskId).type;

        const listTasks = tasks.filter(task => task.type === taskType).sort((a, b) => a.position - b.position);
        
        const [movedTask] = listTasks.splice(from - 1, 1)

        listTasks.splice(to - 1, 0, movedTask)

        listTasks.forEach((task, index) => {
            task.position = index + 1
        });

        setTasks([...tasks])
        saveToDatabase(props.id, JSON.stringify(tasks));
    }

    function deleteTask(taskId){
        const updatedTasks = (Array.isArray(tasks) ? tasks : []).filter(task =>
            task.id !== taskId
        );

        setTasks(updatedTasks);
        saveToDatabase(props.id, JSON.stringify(tasks));
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
            openEdit={openEdit}
            />
        )
    }

    function updateTask(taskId, updatedFields) {
        const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task =>
            task.id === taskId
            ? { ...task, ...updatedFields }
            : task
        );

        setTasks(updatedTasks);
        saveToDatabase(props.id, JSON.stringify(tasks));
    }

    function checkOff(taskId){
        const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task =>
        task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        );

        setTasks(updatedTasks);
        saveToDatabase(props.id, JSON.stringify(tasks));
    }

    const todayTasks = tasks ? tasks.filter(task => task.type === "today").sort((a, b) => a.position - b.position) : []
    const generalTasks = tasks ? tasks.filter(task => task.type === "general").sort((a, b) => a.position - b.position) : []

    const currentTasks = props.id === 1 ? generalTasks : todayTasks;
    const incomplete = currentTasks ? currentTasks.filter(task => !task.completed) : [];
    const completed = currentTasks ? currentTasks.filter(task => task.completed) : [];

    return(
        <div className="taskBox">
            <h2 className="boxHeading">{props.name}</h2>
            <InfoText text={props.infoText}/>
            <CreateArea 
            id={props.id}
            setTasks={setTasks}
            tasks={tasks}
            timeToSeconds={timeToSeconds}
            />
            <div className="taskContainer" key={incomplete}>
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