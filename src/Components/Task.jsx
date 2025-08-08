import { useState, useEffect } from "react";

export default function Task(props){
    const [runningTime, setRunningTime] = useState(false)
    const [startTime, setStartTime] = useState(Date.now())

    const { hours, minutes, seconds } = props.secondsToTime(props.task.currentTime);
    const hasTime = props.task.currentTime;
    const formattedTime = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`
    const secondsProgress = seconds > 0 ? ((seconds)/ 60) * 100 : 100;

    const { hours: startHours, minutes: startMinutes } = props.secondsToTime(props.startTime);
    const formattedStartTime = `${startHours > 0 ? startHours + "h" : ("")}${startMinutes > 0 && startHours > 0 ? " " : ""}${startMinutes > 0 ? startMinutes + "min" : ("")}`;

    function removeRep(){
        if (props.task.reps > 1){
            props.updateTask(props.task.id, { reps: props.task.reps - 1 });
        } else {
            props.checkOff(props.task.id)
            props.updateTask(props.task.id, { reps: props.task.startReps });
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
            const timeLeft = Math.max(0, props.task.currentTime - elapsed);
            
            props.updateTask(props.task.id, { currentTime: timeLeft });

            if (timeLeft === 0) {
                setRunningTime(false);
                props.checkOff(props.task.id)
                props.updateTask(props.task.id, { currentTime: props.task.startTime })
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [runningTime, startTime])

    const repsPercentage = Math.floor(((props.task.startReps - props.task.reps) / props.task.startReps) * 100) + "%"
    const timePercentage = Math.floor(((props.task.startTime - props.task.currentTime) / props.task.startTime) * 100) + "%"

    return(
        <div className={`taskWrapper ${props.editingState ? "editing" : null}`}>
            <div className="task">
                {props.editingState && !props.editingTask ? 
                    <img 
                    src="Images/deleteIcon.svg"
                    alt="trashcan icon"
                    onClick={() => props.deleteTask(props.task.id)}
                    className="deleteTask"
                    />
                :
                    <p className="taskPosition">{props.task.position}.</p>
                }
                
                <li
                onClick={() => props.checkOff(props.task.id)}
                title={props.task.name}
                style={{
                    textDecoration: props.task.completed ? "line-through" : "none",
                    color: props.task.completed ? "gray" : "black"
                }}
                className="taskName"
                >
                {props.task.name}
                </li>

                {props.task.completed ? (
                    <div className="doneDisplay">
                        {props.mode == "Time" && hasTime ? 
                            <p>
                                {formattedStartTime}
                            </p>
                        : props.task.startReps > 2 ?
                            <p>
                                {props.task.startReps}x
                            </p>
                        :
                        null}
                    </div>
                    ) : (
                    <div className="taskModeContainer">
                        {props.task.mode == "Time" && hasTime ? 
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
                        : props.task.startReps >= 2 ?
                            <p className="reps" onClick={removeRep}>{props.task.reps > 0 ? props.task.reps + "x" : ""}</p>
                        :
                        null}
                    </div>
                    )}
                {props.editingState ? (
                    <img 
                    src="Images/edit.svg"
                    alt="Edit icon" 
                    className="editButton"
                    onClick={() => props.setEditingTask(props.task)}
                    />
                ) : ( props.task.completed ? 
                <img src="Images/done.svg" alt="Green checkmark" className="checkmark"/>
                :
                <div className="progressPercentage" style={{display: !hasTime && props.task.startReps < 2 ? "none" : "flex"}}>
                    {props.task.mode === "Time" ? timePercentage : repsPercentage}
                </div>
                )}
            </div>
        </div>
    )
}