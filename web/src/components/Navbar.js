import React from "react";
import { NavLink } from "react-router-dom";
import '../css/Navbar.css'

const Navbar = () => {
    return(
        <>
        <header>
            <div className="container">
                <NavLink to="/" className="pot-header"><p>POTLUCK</p> </NavLink>
            </div>
        </header>
        </>
    )

}
export default Navbar;