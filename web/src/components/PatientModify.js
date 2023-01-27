import React, {useState, useEffect} from "react";
import { useParams, useNavigate, generatePath } from "react-router-dom";
import './GlobalVariables'


const PatientModify = () => {


    const [data, setData] = useState({__data: ""});

    let { id } = useParams();
    let navigate = useNavigate();

    let PatientReschedulePath = generatePath('/PatientReschedule/:id', { id });
    let PatientCancelPath = generatePath('/PatientCancel/:id', { id });

    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    const appointment_date = 
    new Date(localStorage.getItem('appointment')).toLocaleDateString([],options);     

    useEffect(() => {
    apiGet();
    }, []);

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
            fetch(global.apiEndpoints.getpatientdetails , requestOptions)
            .then((response) => response.json())
            .then((data) => {
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
                    <p>Appointment</p>
                </div>
                <div className="info-actual">
                    <p>{appointment_date}</p>
                </div>
            </div>
        </div>
        <div className="middle-section">
            <div className="middle-heading">
                <p>Choose how would you like to modify the patient appointment</p>
            </div>
        </div>
        <div className="bottom-section">
            <div className="bottom-options">
                <button type="submit" onClick={() => {navigate(PatientCancelPath)}}>Cancel</button>
                <button type="submit" onClick={() => {navigate(PatientReschedulePath)}}>Reschedule</button>
            </div>
        </div>
        </>
    )

}
export default PatientModify;