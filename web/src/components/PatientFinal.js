import React from "react";

import { FaCheckCircle } from 'react-icons/fa';


const PatientModify = () => {

    var action = sessionStorage.getItem('action')
    return(
        <>
        <div className="mid-section">
            <h2> The appointment has been {action}. Email sent! </h2>
            <FaCheckCircle/>
        </div>

        </>
    )
}
export default PatientModify;