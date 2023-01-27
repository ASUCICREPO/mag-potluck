import React, {useState, useEffect} from "react";
import { useParams, generatePath, useNavigate } from "react-router-dom";
import './GlobalVariables'

import '../css/PatientDetails.css'
const PatientDetails = () => {

    const [data, setData] = useState({__data: ""});
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    const currDate = new Date().toLocaleDateString([],options);
    
    useEffect(() => {
        apiGet();
        }, []);

    let { id } = useParams();
    let PatientModifyPath = generatePath('/PatientModify/:id', { id });
    let navigate = useNavigate();

    const onSubmit = async event => {
        event.preventDefault();
        localStorage.setItem('appointment', date + ' ' + time );
        navigate(PatientModifyPath)
    };
    

    function apiGet(){        
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
        
            var raw = JSON.stringify({"id": id });
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            // let response;
            fetch( global.apiEndpoints.getpatientdetails, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                console.log("PatientDetails: " + data.body);
                var datajson = JSON.parse(data.body)
                setData(datajson);
            });
        }   

    return(
        <>
        <div className="top-section">
            <div className="info-box">
                <div className="info-header">
                    <p>Client</p>
                </div>
                <div className="info-actual">
                    <p>{data.firstname} {data.middelname} {data.lastname}</p>
                </div>
            </div>
            <div className="info-box">
                <div className="info-header">
                    <p>Transit Provider</p>
                </div>
                <div className="info-actual">
                    <p>{data.transitprovidername}</p>
                </div>
            </div>
            <div className="info-box">
                <div className="info-header">
                    <p>Today's Date</p>
                </div>
                <div className="info-actual">
                    <p>{currDate}</p>
                </div>
            </div>
        </div>
        <div className="middle-section">
            <div className="middle-heading">
                <p>Enter current appointment details</p>
            </div>
        </div>
        <div className="bottom-section">
            <div className="bottom-info">
                <form onSubmit={onSubmit}>
                    <input type="date" placeholder="Date" name="date" value={date} onChange={(event) => setDate(event.target.value)}required />
                    <input type="time" placeholder="Time" name="time" value={time} onChange={(event) => setTime(event.target.value)}required />         
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
        </>
    )

}
export default PatientDetails;