export default function Options(props){
    function deleteTask(){
        props.updatePositions(props.taskId, props.position, props.length)
        props.deleteTask(props.taskId)
    }

    return(
        <div className="optionsContainer">
             <div onClick={deleteTask}>
                <p style={{color: "#dc3545"}}>Delete Task</p>
                <img src="Images/delete.svg" alt="Trashcan Icon" />
             </div>

             <div onClick={() => props.openEdit(props.task)}>
                <p>Edit</p>
                <img src="Images/edit.svg" alt="Edit Icon" />
             </div>
        </div>
    )
}