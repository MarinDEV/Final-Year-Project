/*
  The header component
*/
import React from "react";
import { useNavigate } from "react-router-dom";
import {Cart} from './HeaderCart';
import {Search} from './Search';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col} from 'react-bootstrap/';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBars, faSearch} from '@fortawesome/free-solid-svg-icons';
import {Popover, OverlayTrigger} from 'react-bootstrap/';

import styles from "../style/header.module.css";
import { Account } from "./Account";


const Header = (props) => {
  const navigate = useNavigate();

  // Redirects to main page if logo is clicked
  const handleClick = () => {
    navigate(`${process.env.PUBLIC_URL}`);
  }

  return(
    <Container id="main-header" fluid>
        <Row>
          <Col lg={2}>
            <div style={{marginTop: 7, cursor: 'pointer', margin: 'auto'}}>
              <img className={styles.logoImg} src={`${process.env.PUBLIC_URL}/images/logo.png`} onClick={handleClick}></img>
            </div>
          </Col>
          <Col lg={6}>
            <Search></Search>
          </Col>
          <Col lg={4}>
            <Col lg={2} style={{display: 'inline-block', width: '50%'}}>
              <Account />
            </Col>
            <Col lg={2} style={{display: 'inline-block', width: '50%'}}>
              <Cart count='0' value='0.00'></Cart>
            </Col>
          </Col>
        </Row>
        {/* <hr></hr> */}
        {/* <Row>
          <Col lg={2} style={{paddingRight: 0}}>
            <div className={styles.categories}>
              <a href="" className={styles.categoriesA}>
                <FontAwesomeIcon icon={faBars}/>
                <span className={styles.categoriesSpan}>All Categories</span>
              </a>
            </div>
          </Col>
          <Col lg={8}>
            <div>
              <ul className={styles.ul}>
                  <li className={styles.li}><a href="#offers">Offers</a></li>
                  <li className={styles.li}><a href="#best-sellers">Best Sellers</a></li>
                  <li className={styles.li}><a href="#customer-service">Customer Service</a></li>
                  <li className={styles.li}><a href="#payment">Payment</a></li>
                  <li className={styles.li}><a href="#delivery">Delivery</a></li>
                  <li className={styles.li}><a href="#blog">Blog</a></li>
              </ul>
            </div>
          </Col>
          <Col className={styles.currency} lg={2}>
            <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={popover2}>
              <a className={styles.currencyA}>
                <span className={styles.currencySpan}>Language - EN</span>
              </a>
            </OverlayTrigger>
          </Col>
        </Row> */}
      </Container>
  )
}

const popover2 = (
  <Popover id="popover-basic">
    <div className={styles.popover2}>
        <a className={styles.flag} href="#"><img src="https://cdn.countryflags.com/thumbs/albania/flag-round-250.png"/></a>
        <a className={styles.flag} href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/United-kingdom_flag_icon_round.svg/2048px-United-kingdom_flag_icon_round.svg.png"/></a>
    </div>
  </Popover>
);

export {Header};