import React, { useState, useEffect } from "react";
import '../css/LinkPage.css';
import { Navigate, useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import './GlobalVariables';


const LinkPage = () => {

    const navigate = useNavigate()
    useEffect (() => {
        
        if(!localStorage.getItem('access_token')){
            navigate('/LogIn');
        }
    }, [])

    const [fName, setfName] = useState("");
    const [mName, setmName] = useState("");
    const [lName, setlName] = useState("");
    const [hName, sethName] = useState("");
    const [navig, setNavigate] = useState("");

    // let PatientModifyPath = generatePath('/GeneratedLink/:id', { id });

    const onSubmit = async event => {
        event.preventDefault();
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({"f_name": fName, "m_name": mName, "l_name": lName, "h_name": hName, "access_token": localStorage.getItem('access_token'), "initial_entry_ts": Date.now().toString()});
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        // let response;
        fetch(global.apiEndpoints.registerpatient , requestOptions)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.statusCode) {
                var datajson = JSON.parse(data.body)
                var patientdata = {"name": fName + " " + mName + " " + lName, "link": datajson.link, "healthcareName": hName}
                localStorage.setItem('patientdata', JSON.stringify(patientdata));
                setNavigate(true);
            } else {
                swal({
                    title: "Error!",
                    text: data.errorMessage,
                    icon: "error",
                    button: "Try Again.",
                  });
            }

        });
    };

    if(navig) {
        return <Navigate to="/LinkGenerated" />
    }

    return(
        <>
        <div className="form-section">
            <h2> Generate Patient Link </h2>
            <div className="actual-form">
                <form onSubmit={onSubmit}>
                        <input id="fName" value={fName} type="text" placeholder="First Name" name="First Name" onChange={(event) => setfName(event.target.value)} required />
                        <input id="mName" value={mName} type="text" placeholder="Middle Name" name="Middle Name" onChange={(event) => setmName(event.target.value)} required />
                        <input id="lName" value={lName} type="text" placeholder="Last Name" name="Last Name" onChange={(event) => setlName(event.target.value)} required />
                        <input id="hName" value={hName} type="text" placeholder="Healthcare Provider Name" name="Healthcare Provider Name" onChange={(event) => sethName(event.target.value)} required />
                        <button type="submit">Generate Link</button> 
                </form>
            </div>
        </div>
        </>
    )
}


export default LinkPage;