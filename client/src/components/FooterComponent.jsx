/*
  The footer component.
*/
import React from "react";
import { useNavigate } from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBars, faSearch} from '@fortawesome/free-solid-svg-icons';

// import styles from "../style/header.module.css";


const FooterComponent = (props) => {
  const navigate = useNavigate();

  const style ={
      display: 'flex',
      backgroundColor: '#232f3e',
      color: 'white',
      fontSize: 13,
      padding: 20
  }

  return(
    <div style={style}>
        <div style={{margin: 'auto'}}>
            <p style={{ height: 20}}>Address: Bul. Zhan Dark, Kull 2, Tirane</p>
            <p style={{ height: 20}}>Contact: <a href="tel:+355682189112">+355682189112</a></p>
            <p style={{ height: 20}}>© 2022 Albanian E-commerce. All rights reserved</p>
        </div>
    </div>
  )
}

export {FooterComponent};