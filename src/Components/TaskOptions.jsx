export default function TaskOptions(props){
    return(
    <div className="taskOptions">
        <p>
            {props.display}
        </p>

        <div className="changeOptions">
            <div onClick={props.remove}>
                <img src="Images/minus.svg"  alt="minus button"/>
            </div>
            <div onClick={props.add}>
                <img src="Images/plus.svg" alt="plus button"/>
            </div>
        </div>

    </div>
    )
}