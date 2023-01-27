import React from "react";
import { NavLink } from "react-router-dom";
import '../css/Navbar.css'

const Navbar = () => {
    return(
        <>
        
        <header>
            <div className="container container-flex">
                <NavLink to="/" className="pot-header"><p>POTLUCK</p> </NavLink>
            </div>
            <nav>
                <div className="navbar-container">
                    
                </div>
            </nav>
        </header>
        </>
    )

}
export default Navbar;