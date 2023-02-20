import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import './GlobalVariables';
import swal from 'sweetalert';

import '../css/Home.css'


const Home = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [navigate, setNavigate] = useState("");


    const onSubmit = async event => {
        event.preventDefault();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({"username": email, "password": password });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        // let response;
        fetch(global.apiEndpoints.transitlogin , requestOptions)
        .then((response) => response.json())
        .then((res) => {
            console.log(res);
            if (res.success) {
                sessionStorage.setItem('access_token', res.data.access_token);
                sessionStorage.setItem('refresh_token', res.data.refresh_token);
                setNavigate(true);
            } else {
                swal({
                    title: "Error!",
                    text: res.message,
                    icon: "error",
                    button: "Try Again.",
                  });
            }

        });
    };

    if(navigate) {
        return <Navigate to="/generateLink" />
    }

    return(
        <>
        <div className="main-section">
            <div className="form-container log-in-container">
                <h1>POTLUCK</h1>
                <h2> Transit Provider Login </h2>
                <div className="form-group">
                    <form onSubmit={onSubmit}>
                        <input type="text" placeholder="Email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                        <input type="password" placeholder="Password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                        <button type="submit">Login</button> 
                    </form>
                </div>
                <h3> Don't have an account? <a href="/SignUp">Sign Up </a></h3>
            </div>
            <div className="image-container">
                <img src="https://live.staticflickr.com/65535/51195628139_81d91eb537_b.jpg" alt="PotLuck" />
            </div>
	    </div>
        </>
    );
};
export default Home;
