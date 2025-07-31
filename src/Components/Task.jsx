import { useState, useEffect } from "react";

import Options from "./Options";

export default function Task(props){
    const [runningTime, setRunningTime] = useState(false)
    const [startTime, setStartTime] = useState(Date.now())
    const [options, setOptions] = useState(false)
    const [mouseOver, setMouseOver] = useState(false)

    const { hours, minutes, seconds } = props.secondsToTime(props.currentTime);
    const hasTime = props.currentTime;
    const formattedTime = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`
    const secondsProgress = seconds > 0 ? ((seconds)/ 60) * 100 : 100;

    const { hours: startHours, minutes: startMinutes } = props.secondsToTime(props.startTime);
    const formattedStartTime = `${startHours > 0 ? startHours + "h" : ("")}${startMinutes > 0 && startHours > 0 ? " " : ""}${startMinutes > 0 ? startMinutes + "min" : ("")}`;

    function removeRep(){
        if (props.reps > 1){
            props.updateTask(props.task.id, { reps: props.reps - 1 });
        } else {
            props.checkOff(props.task.id)
            props.updateTask(props.task.id, { reps: props.startReps });
        }
    }

    function changeTimeState(){
        if (!runningTime) {
            setStartTime(Date.now());
        }
        setRunningTime(!runningTime);
    }

    useEffect(() => {
        if (!runningTime) return;

        let interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const timeLeft = Math.max(0, props.currentTime - elapsed);
            
            props.updateTask(props.task.id, { currentTime: timeLeft });

            if (timeLeft === 0) {
                setRunningTime(false);
                props.checkOff(props.task.id)
                props.updateTask(props.task.id, { currentTime: props.startTime })
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [runningTime, startTime])

    const repsPercentage = Math.floor(((props.startReps - props.reps) / props.startReps) * 100) + "%"
    const timePercentage = Math.floor(((props.startTime - props.currentTime) / props.startTime) * 100) + "%"

    return(
        <div className="taskWrapper" onMouseOver={() => setMouseOver(true)} onMouseLeave={() => `${setMouseOver(false)} ${setOptions(false)}`}>
            <div className="task">
                <li
                onClick={() => props.checkOff(props.task.id)}
                title={props.name}
                style={{
                    textDecoration: props.task.completed ? "line-through" : "none",
                    color: props.task.completed ? "gray" : "black"
                }}
                >
                {props.name}
                </li>

                {props.task.completed ? (
                    <div className="doneDisplay">
                        {props.mode == "Time" && hasTime ? 
                            <p>
                                {formattedStartTime}
                            </p>
                        : props.startReps > 2 ?
                            <p>
                                {props.startReps}x
                            </p>
                        :
                        null}
                    </div>
                    ) : (
                    <div className="taskModeContainer">
                        {props.mode == "Time" && hasTime ? 
                            <>
                            <img 
                            src={`/Images/${runningTime ? "pause" : "play"}.svg`}
                            alt="Play icon" 
                            className="startTimeBtn"
                            onClick={changeTimeState}
                            />
                            <div className="taskTime">
                                    <p>
                                        {formattedTime}
                                    </p>
                                <div className="secondsBar">
                                    <div className="secondsProgress" style={{width: `${secondsProgress}%`}}></div>
                                </div>
                            </div>
                            </>
                        : props.startReps >= 2 ?
                            <p className="reps" onClick={removeRep}>{props.reps > 0 ? props.reps + "x" : ""}</p>
                        :
                        null}
                    </div>
                    )}
                
                {props.task.completed ? 
                <img src="Images/done.svg" alt="Green checkmark" className="checkmark"/>
                :
                <div className="progressPercentage" style={{opacity: !hasTime && props.startReps < 2 ? "0" : "1"}}>
                    {props.mode === "Time" ? timePercentage : repsPercentage}
                </div>
                }

            </div>

            {options && mouseOver ?
                <>
                <img 
                src="Images/options.svg"
                alt="Edit icon" 
                className="editButton"
                onClick={() => setOptions(!options)}
                style={{opacity: "1"}}
                />
                <Options
                    task={props.task}
                    taskId={props.task.id}
                    deleteTask={props.deleteTask}
                    position={props.task.position}
                    updatePositions={props.updatePositions}
                    length={props.length}
                    openEdit={props.openEdit}
                />
                </>
            :
                <img 
                src="Images/options.svg"
                alt="Edit icon" 
                className="editButton"
                onClick={() => setOptions(!options)}
                />
            }
            
        </div>
    )
}