import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import './GlobalVariables';
import '../css/Home.css'
import swal from 'sweetalert';


const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [navigate, setNavigate] = useState("");

    const onSubmit = async event => {
        event.preventDefault();

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({"email": email, "password": password, "phone": phone, "name":name });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        // let response;
        fetch(global.apiEndpoints.signuptransit , requestOptions)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success) {
                sessionStorage.setItem('username', email);
                setNavigate(true);

            } else {
                swal({
                    title: "Error!",
                    text: data.message,
                    icon: "error",
                    button: "Try Again.",
                  });
            }

        });

    };

    if(navigate) {
        return <Navigate to="/ConfirmSignUp" />
    }
    
    return (
        <div className="main-section">
            <div className="form-container log-in-container">
                <h1>POTLUCK</h1>
                <h2> Transit Provider SignUp </h2>
                <div className="form-group">
                    <form onSubmit={onSubmit}>
                        <input type="text" placeholder="Email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                        <input type="password" placeholder="Password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                        <input type="Name" placeholder="Name" name="name" value={name} onChange={(event) => setName(event.target.value)} required />
                        <input type="tel" placeholder="Phone Number" name="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
                        <button type="submit">SignUp</button> 
                    </form>
                </div>
                <h3> Already have an account? <a href="/LogIn">Log In</a></h3>
            </div>
            <div className="image-container">
                <img src="https://live.staticflickr.com/65535/51195628139_81d91eb537_b.jpg" alt="PotLuck" />
            </div>
        </div>
    );
};

export default SignUp;
