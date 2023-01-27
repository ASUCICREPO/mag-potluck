import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import './GlobalVariables';
import UserPool from "../UserPool";
import { useNavigate } from "react-router-dom";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
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
                console.log(res.data.access_token);
                localStorage.setItem('access_token', res.data.access_token);
                setNavigate(true);
            } else {
                alert(res.message)
            }

        });
    };

    if(navigate) {
        return <Navigate to="/generateLink" />
    }
    // const navigate = useNavigate();

    // const onSubmit = (event) => {
    //     event.preventDefault();

    //     const user = new CognitoUser({
    //         Username: email,
    //         Pool: UserPool,
    //     });

    //     const authDetails = new AuthenticationDetails({
    //         Username: email,
    //         Password: password,
    //     });

    //     user.authenticateUser(authDetails, {
    //         onSuccess: (data) => {
    //             console.log("onSuccess: ", data);
    //             console.log(data.accessToken.jwtToken);
    //             localStorage.setItem('token', data.accessToken.jwtToken);
    //             navigate('/generateLink')
    //         },
    //         onFailure: (err) => {
    //             console.error("onFailure: ", err);
    //         },
    //         newPasswordRequired: (data) => {
    //             console.log("newPasswordRequired: ", data);
    //         }
    //     });
    // };
    
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
            </div>
            <div className="image-container">
                <img src="https://live.staticflickr.com/65535/51195628139_81d91eb537_b.jpg" alt="PotLuck" />
            </div>
	    </div>
        </>
    );
};
export default Home;
