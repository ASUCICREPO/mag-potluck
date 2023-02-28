import React, { useState, useEffect } from "react";
import Axios from 'axios';
import { generatePath, useParams, useNavigate } from "react-router-dom";
import './GlobalVariables'

// import '../css/PatientModify.css'

const PatientCancel = () => {

    function submit(e){
        e.preventDefault();
        Axios.post(global.apiEndpoints.updatepatient,{
            appointment_status: "Cancel",
            update_ts: Date.now().toString(),
            scheduled_ts: "",
            id: id,
            appointment_type: "Cancel"
        })
        .then(res=>{
            console.log(res.data)
        })
        let PatientFinalPath = generatePath('/PatientFinal/:id', { id });

        Axios.post(global.apiEndpoints.healthemail,{
            recipient: data.transitprovideremail,
            action: "cancel",
            t_provider: data.transitprovidername,
            patient_name: data.firstname + ' ' + data.middelname + ' ' + data.lastname ,
            initial_date: origappointment,
            healthcare_name: data.healthcareprovidername,
            //healthcare_number: "+000000000000000"
        })
        .then(() => {
            sessionStorage.setItem('action', "cancelled");
            navigate(PatientFinalPath)

        });
    }; 
    const [data, setData] = useState("");

    let { id } = useParams();
    const navigate = useNavigate();

    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    const origappointment = new Date(sessionStorage.getItem('appointment')).toLocaleDateString([],options);
    const [appointment_date, setAppointmentDate] = useState(origappointment);
     
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
            fetch(global.apiEndpoints.healthemail.getpatientdetails , requestOptions)
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
                <p>Are you sure you wish to cancel this appointment?</p>
            </div>
        </div>
        <div className="bottom-section">
            <form onSubmit={(e) => submit(e)}>
                <div className="bottom-options">        
                    <button onClick={() => navigate(-1)}>Go Back</button>
                    <button type="submit" onClick={() => setAppointmentDate("CANCELLED") }>Submit</button> 
                </div>
            </form>
        </div>
        </>
    )

}
export default PatientCancel;