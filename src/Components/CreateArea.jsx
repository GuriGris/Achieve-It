import { useState, useRef } from "react"
import TaskOptions from "./TaskOptions"
import { setData, useData } from "../authStore"
import { saveTaskToDatabase } from "../utils/firebase.utils"

export default function CreateArea(props){
    const [name, setName] = useState("")
    const [time, setTime] = useState({hours: 0, minutes: 0, seconds: 0})
    const [mode, setMode] = useState("Time")
    const [reps, setReps] = useState(2)

    const tasks = useData();
    const setTasks = setData;

    const timeDisplay = `${time.hours < 10 ? "0" : ""}${time.hours}:${time.minutes < 10 ? "0" : ""}${time.minutes}`;
    const repsDisplay = (
        <input 
            type="number" 
            value={reps} 
            onChange={(e) => setReps(parseInt(e.target.value))}
            onBlur={(e) => {
                if (e.target.value === "" || reps < 2) {
                    setReps(2);
                }
            }}
            min="2"
            max="99"
        />
    );

    function addTask(){
        if (mode == "Repetitions" &&  2 > reps || reps > 99){
            alert("Please select a number between 1 and 99 for repetitions")
            setReps(2)
            return
        }

        const currentTasks = tasks.filter(task => 
            task.type === (props.id === 1 ? "general" : "today")
        );

        const startTime = props.timeToSeconds(time.hours, time.minutes, time.seconds)
        const newTask = {
            id: Date.now() + Math.floor(Math.random() * 10000),
            name: name,
            completed: false,
            type: props.id === 1 ? "general" : "today",
            startTime: startTime,
            currentTime: startTime,
            startReps: mode === "Repetitions" ? reps : 0,
            reps: mode === "Repetitions" ? reps : 0,
            mode: mode,
            position: currentTasks.length + 1
        }
        if (name.trim()) {
            setTasks([...tasks, newTask]);
            saveTaskToDatabase(newTask)
        }
        setTime({hours: 0, minutes: 0, seconds: 0})
        setReps(2)
        setName("")
    }

    function addTime(){
        if (time.minutes != 55){
            setTime({...time, minutes: time.minutes + 5})
        } else{
            setTime({...time, hours: time.hours + 1})
            setTime({...time, minutes: 0})
        }
    }

    function removeTime(){
        if (time.minutes != 0){
            setTime({...time, minutes: time.minutes - 5})
        } else{
            if (time.hours > 0){
                setTime({...time, hours: time.hours - 1})
                setTime({...time, minutes: 55})
            }
        }
    }

    function addReps(){
        if (reps < 99) {
            setReps(reps + 1)
        }
    }

    function removeReps(){
        if (reps > 2) {
            setReps(reps - 1)
        }
    }

    function capitalize(name){
        let a = name.slice(0, 1)
        let b = name.slice(1, name.length)
        a = a.toUpperCase();
        return a + b
    }

    return(
        <div className="createArea">
            {/* <p>tasks: {tasks}</p> */}
            <input 
            type="text" 
            className="taskInput" 
            onChange={(e) => setName(capitalize(e.target.value))} 
            value={name} 
            autoComplete="off" 
            autoCorrect="off" 
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            }}
            />
            
            <div className="bottomCreate">
                <button className="modeButton">
                    <div 
                        className={`modeOption ${mode === "Time" ? "activeMode" : ""}`}
                        onClick={() => setMode("Time")}
                        style={{borderBottom: "solid var(--border-md) black"}}
                    >
                        <p>Time</p>
                    </div>
                    <div 
                        className={`modeOption ${mode === "Repetitions" ? "activeMode" : ""}`}
                        onClick={() => setMode("Repetitions")}
                    >
                        <p>Reps</p>
                    </div>
                </button>

                {mode === "Time" ? 
                <TaskOptions 
                    display={timeDisplay}
                    add={addTime}
                    remove={removeTime}
                    minutes={time.minutes}
                    hours={time.hours}
                />
                :
                <TaskOptions 
                    display={repsDisplay} 
                    add={addReps}
                    remove={removeReps}      
                    reps={reps}    
                />
                }

                <button className="addButton" onClick={addTask}>Add</button>
            </div>
        </div>
    )
}