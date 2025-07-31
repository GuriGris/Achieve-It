import React, { useState, useEffect } from "react"
import InfoText from "./InfoText"
import CreateArea from "./CreateArea"
import Task from "./Task"
import EditWindow from "./EditWindow"

export default function TaskBox(props){
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem(`tasks-${props.id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [editingTask, setEditingTask] = useState(null)

    useEffect(() => {
        localStorage.setItem(`tasks-${props.id}`, JSON.stringify(tasks));
    }, [tasks]);

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
    }

    function deleteTask(taskId){
        setTasks(prevTasks => prevTasks.filter(task => 
            task.id !== taskId 
        ));
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
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === taskId 
                ? {...task, ...updatedFields}
                : task
        ));
    }

    function checkOff(taskID){
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === taskID ? 
                {...task, completed: !task.completed}
                : 
                task
        ));
    }

    const todayTasks = tasks.filter(task => task.type === "today").sort((a, b) => a.position - b.position)
    const generalTasks = tasks.filter(task => task.type === "general").sort((a, b) => a.position - b.position)

    const currentTasks = props.id === 1 ? generalTasks : todayTasks;
    const incomplete = currentTasks.filter(task => !task.completed);
    const completed = currentTasks.filter(task => task.completed);

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