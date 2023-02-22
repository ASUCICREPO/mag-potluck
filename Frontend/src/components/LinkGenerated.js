import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCopy } from 'react-icons/fa';
import "./GlobalVariables";
import '../css/LinkPage.css';
import swal from 'sweetalert';

const LinkGenerated = () => {
    let navigate = useNavigate();
    const [hEmail, setHEmail] = useState("");

    useEffect (() => {
        if(!sessionStorage.getItem('access_token')){
            navigate('/LogIn');
        }
        
        if(!sessionStorage.getItem('patientdata')){
            navigate('/generateLink');
        }
    }, [])

    var raw =  JSON.parse(sessionStorage.getItem('patientdata'));

    const onSubmit = async event => {
        event.preventDefault();
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw =  JSON.parse(sessionStorage.getItem('patientdata'));
        var topost = JSON.stringify({"recipient": hEmail, "link": raw.link, "patient_name": raw.name,"healthcareName": raw.healthcareName, "access_token": sessionStorage.getItem('access_token')});
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: topost,
            redirect: 'follow'
        };

        fetch(global.apiEndpoints.transitemail , requestOptions)
        .then((response) => response.json())
        .then((data) => {
            console.log(data.statusCode);
            if (data.statusCode === 200) {
                swal({
                    title: "",
                    text: "Email Sent!",
                    icon: "success",
                    button: "Done.",
                  });
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

    return(
        <>
        <div className="mid-section">
            <h2> Client Name </h2>
            <p> {raw.name} </p>
            <h2> Patient Link </h2>
            <div>{raw.link}</div>
            <button onClick={() =>  navigator.clipboard.writeText(raw.link)}><FaCopy/></button>
            <form onSubmit={onSubmit}>
                <input id="hEmail" value={hEmail} type="email" placeholder="Healthcare Provider Email" name="Healthcare Provider EMail" onChange={(event) => setHEmail(event.target.value)} required />
                <button type="submit"> Email Link</button> 
            </form>
        </div>

        </>
    )

}
export default LinkGenerated;