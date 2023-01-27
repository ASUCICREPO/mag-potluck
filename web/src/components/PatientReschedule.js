import React, { useState, useEffect } from "react";
import Axios from 'axios';
import { generatePath, useParams, useNavigate } from "react-router-dom";
import './GlobalVariables'

// import '../css/PatientModify.css'

const PatientReschedule = () => {

    // const updateurl = "https://earzkgb41e.execute-api.us-east-1.amazonaws.com/prod/health/updatepatient"
    // const emailurl = "https://earzkgb41e.execute-api.us-east-1.amazonaws.com/prod/health/sendmail"
    const [data, setData] = useState({
        apttype: "",
        date: "",
        time: ""

    });

    function submit(e){
        e.preventDefault();
        Axios.post(global.apiEndpoints.updatepatient , {
            appointment_status: "Reschedule",
            scheduled_ts: data.date + ' ' + data.time,
            id: id,
            update_ts: Date.now().toString()
        })
        .then(res=>{
            console.log(res.data)
            
            // console.log(newdate)
            // const newtime = (data.time).value
            // // new Date(data.time).toLocaleTimeString([],options); 
            // console.log(data.time.value)

        })
        let PatientFinalPath = generatePath('/PatientFinal/:id', { id });
        const newdate = new Date(data.date).toLocaleDateString([],options); 

        Axios.post(global.apiEndpoints.healthemail ,{
            recipient: data.transitprovideremail,
            action: "update",
            t_provider: data.transitprovidername,
            patient_name: data.firstname + ' ' + data.middelname + ' ' + data.lastname ,
            initial_date: origappointment,
            healthcare_name: data.healthcareprovidername,
            healthcare_number: "+13456789234",
            new_date: newdate + ' ' + data.time
        })
        .then(() => {
            localStorage.setItem('action', "updated");
            navigate(PatientFinalPath)

        });
    }; 

    let { id } = useParams();
    const navigate = useNavigate();

    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    const origappointment = new Date(localStorage.getItem('appointment')).toLocaleDateString([],options);
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
            fetch(global.apiEndpoints.getpatientdetails , requestOptions)
            .then((response) => response.json())
            .then((data) => {
                console.log("PatientDetails: " + data.body);
                var datajson = JSON.parse(data.body)
                setData(datajson);
            });
        }

    function handle(e){
        const newdata = { ...data }
        newdata[e.target.id] = e.target.value
        setData(newdata)
        console.log(newdata)
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
                <p>How would you like to reschedule the appointment?</p>
            </div>
        </div>
        <div className="bottom-section">
            <form onSubmit={(e) => submit(e)}>
                <div className="bottom-info">
                    <select onChange={(e) => handle(e)} id="apttype" value={data.apttype} placeholder="Type of Appointment" name="apttype" required>
                        <option value="" disabled selected hidden>Type of Appointment</option>
                        <option value="In Person">In Person</option>
                        <option value="Virtual">Virtual</option>
                    </select>
                    {/* <input type="" placeholder="Type of Appointment" name="apttype" required/> */}
                    <input onChange={(e) => handle(e)} id="date" value={data.date} type="date" placeholder="Date" name="date" required />
                    <input onChange={(e) => handle(e)} id="time" value={data.time} type="time" placeholder="Time" name="time" required />
                </div>
                <div className="bottom-options">
                    <button onClick={() => navigate(-1)}>Go Back</button>
                    <button type="submit" onClick={() => setAppointmentDate("RESCHEDULED")}>Submit</button>   
                </div>  
            </form>
        </div>
        </>
    )

}
export default PatientReschedule;