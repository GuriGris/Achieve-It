import { useState } from "react"

export default function EditWindow(props){
   const {hours: startHours, minutes: startMinutes, seconds: startSeconds} = props.secondsToTime(props.task.startTime)
   const {hours: hoursLeft, minutes: minutesLeft, seconds: secondsLeft} = props.secondsToTime(props.task.currentTime)

   const [newName, setNewName] = useState(props.task.name)
   const [newStartHours, setNewStartHours] = useState(startHours)
   const [newStartMinutes, setNewStartMinutes] = useState(startMinutes)
   const [newHoursLeft, setNewHoursLeft] = useState(hoursLeft)
   const [newMinutesLeft, setNewMinutesLeft] = useState(minutesLeft)
   const [newStartReps, setNewStartReps] = useState(props.task.startReps)
   const [newCurrentReps, setNewCurrentReps] = useState(props.task.reps)
   const [newPosition, setNewPosition] = useState(props.task.position)

   function handleSave(e){
       e.preventDefault();

        let updatedFields = { name: newName, position: newPosition };
        
        if (props.task.mode === "Time") {
            updatedFields.startTime = props.timeToSeconds(newStartHours, newStartMinutes, 0);
            updatedFields.currentTime = props.timeToSeconds(newHoursLeft, newMinutesLeft, 0);
        } else {
            updatedFields.startReps = newStartReps;
            updatedFields.reps = newCurrentReps;
        }
        
        props.updateTask(props.task.id, updatedFields, {from: props.task.position, to: newPosition});
       
       props.closeEdit();
   }

   return(
       <div className="modalEdit">
           <div className="editContainer">
               <h3 className="editHeading">Edit Task</h3>
               <form className="editMain" onSubmit={handleSave}>
                    <div className="fadeModal">
                        <div className="scrollModal">
                            <div className="editName editDiv">
                                <label>Task Name:</label>
                                <input value={newName} onChange={(e) => setNewName(e.target.value)}/>
                            </div>

                            {props.task.mode === "Time" ? 
                            <>
                                <div className="editDiv editTime">
                                    <label>Start Time:</label>
                                    <div>
                                        Hours: <input type="number" min="0" max="23" value={newStartHours} 
                                        onChange={(e) => {
                                            setNewStartHours(parseInt(e.target.value))
                                            if (parseInt(e.target.value) < newHoursLeft){
                                                setNewHoursLeft(parseInt(e.target.value))
                                            }
                                        }}/>
                                    </div>
                                    <div>
                                        Minutes: <input type="number" min="0" max="59" value={newStartMinutes} 
                                        onChange={(e) => {
                                                setNewStartMinutes(parseInt(e.target.value))
                                                if (parseInt(e.target.value) < newMinutesLeft){
                                                    setNewMinutesLeft(parseInt(e.target.value))
                                                }
                                        }}/>
                                    </div>
                                </div>

                                <div className="editDiv editTime">
                                    <label>Time Left:</label>
                                    <div>
                                        Hours: <input type="number" min="0" max={newStartHours} value={newHoursLeft} onChange={(e) => setNewHoursLeft(parseInt(e.target.value))}/>
                                    </div>
                                    <div>
                                        Minutes: <input type="number" min="0" max={newStartMinutes} value={newMinutesLeft} onChange={(e) => setNewMinutesLeft(parseInt(e.target.value))}/>
                                    </div>
                                </div>
                            </>
                            :
                            <>
                                <div className="editDiv editReps">
                                    <label>Start Reps:</label>
                                    <input type="number" min="2" max="99" value={newStartReps} 
                                        onChange={(e) => {
                                            setNewStartReps(parseInt(e.target.value))
                                            if (parseInt(e.target.value) < newCurrentReps){
                                                setNewCurrentReps(parseInt(e.target.value))
                                            }
                                        }}/>
                                </div>

                                <div className="editDiv editReps">
                                    <label>Reps Left:</label>
                                    <input type="number" min="1" max={newStartReps} value={newCurrentReps} onChange={(e) => setNewCurrentReps(parseInt(e.target.value))}/>
                                </div>
                            </>
                            }

                            <div className="editDiv editReps">
                                    <label>Position:</label>
                                    <input type="number" min="1" max={props.maxPosition} value={newPosition} onChange={(e) => setNewPosition(parseInt(e.target.value))}/>
                            </div>
                        </div>
                    </div>

                   <div className="editButtons">
                       <button type="button" className="cancelButton" onClick={props.closeEdit}>Cancel</button>
                       <button type="submit" className="saveButton">Save</button>
                   </div>
               </form>
           </div>
       </div>
   )
}