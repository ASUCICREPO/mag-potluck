import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import LinkPage from './components/LinkPage';
import PatientDetails from './components/PatientDetails';
import PatientModify from './components/PatientModify';
import PatientReschedule from './components/PatientReschedule';
import PatientCancel from './components/PatientCancel';
import LinkGenerated from './components/LinkGenerated';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignUp from "./components/SignUp";
import ConfirmSignUp from "./components/ConfirmSignUp";
import PatientFinal from "./components/PatientFinal";

const App = () => {
  return(
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/LogIn" element={<Home />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/generateLink" element={<LinkPage />} /> 
        {/* <Route path="/LinkGenerated" element={<LinkGenerated />} />   */}
        <Route path="/PatientDetails/:id" element={<PatientDetails />} />  
        <Route path="/PatientModify/:id" element={<PatientModify />} />
        <Route path="/PatientReschedule/:id" element={<PatientReschedule />} />
        <Route path="/PatientCancel/:id" element={<PatientCancel />} />  
        <Route path="/ConfirmSignUp" element={<ConfirmSignUp />} />  
        <Route path="/LinkGenerated" element={<LinkGenerated />} />  
        <Route path="/PatientFinal/:id" element={<PatientFinal />} />  

    </Routes>
    <Footer />
    </>
  )
}

export default App;