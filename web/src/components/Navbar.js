import React from "react";
import {useLocation, useNavigate } from "react-router-dom";
import '../css/Navbar.css'

const Navbar = () => {

    const logout = async event => {
        // event.preventDefault();
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({"access_token": sessionStorage.getItem('refresh_token') });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        // let response;
        fetch(global.apiEndpoints.transitlogout , requestOptions)
        .then((response) => response.json())
        .then((data) => {
            sessionStorage.clear();
            navigate(`/`)
        });
    };

    const location = useLocation()
    let navigate = useNavigate();

    console.log(location)
    return(
        <>
        <header>
            <div className="container">
                <div className="pot-header"><p onClick={() => {navigate(`/`)}}>POTLUCK</p>
                {(location.pathname =="/generateLink" || location.pathname =="/LinkGenerated")  && 
                <span className="right" onClick={() => {logout()}}>Logout</span>
                }
                </div>
                
            </div>
        </header>
        </>
    )

}
export default Navbar;