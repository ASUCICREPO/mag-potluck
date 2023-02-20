import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import swal from 'sweetalert';
import './GlobalVariables';

const ConfirmSignUp = () => {
    const [code, setCode] = useState("");
    const [navigate, setNavigate] = useState("");
    useEffect (() => {
        
        if(!sessionStorage.getItem('username')){
            navigate('/SignUp');
        }
    }, [])

    const onSubmit = async event => {
        event.preventDefault();
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
    
        var raw = JSON.stringify({"username": sessionStorage.getItem('username'), "code":code });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(global.apiEndpoints.signuptransitconfirm,requestOptions)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.error) {
                swal({
                    title: "Error!",
                    text: data.message,
                    icon: "error",
                    button: "Try Again.",
                  });
                
            } else {
                setNavigate(true);
            }
        });
        // UserPool.signUp(email, password, name, phone, [], null, (err, data) => {
        //     if (err) {
        //         console.error(err);
        //     }
        //     console.log(data);
        // });
    };

    if(navigate) {
        return <Navigate to="/LogIn" />
    }
    
    return (
        // <div>
        //     <form onSubmit={onSubmit}></form>
        // </div>
        <div className="main-section">
            <div className="form-container log-in-container">
                <h1>POTLUCK</h1>
                <h2> Transit Provider Verify SignUp </h2>
                <div className="form-group">
                    <form onSubmit={onSubmit}>
                        <input type="number" placeholder="Verification Code" name="code" value={code} onChange={(event) => setCode(event.target.value)} required />
                        <button type="submit">SignUp</button> 
                    </form>
                </div>
            </div>
            <div className="image-container">
                <img src="https://live.staticflickr.com/65535/51195628139_81d91eb537_b.jpg" alt="PotLuck" />
            </div>
        </div>
    );
};

export default ConfirmSignUp;
