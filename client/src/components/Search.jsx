/*
    The search component of the header
*/
import React from "react";
import {useNavigate} from "react-router-dom";

import styles from "../style/header.module.css";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";

export {Search};

function Search(){

    const navigate = useNavigate();
    const [search,setSearch] = useState("");
    const [category,setCategory] = useState([0]);

    // Run when user makes a search
    function handleSubmit(e){
        e.preventDefault();
        navigate(`${process.env.PUBLIC_URL}/search/${category}/${search}`);
    }

    return (
        <form style={{textAlign: 'center'}} onSubmit={handleSubmit}>
            <div className={styles.search}>
                <select className={styles.searchSelect} onChange={(e) => setCategory(e.target.value)} name="categories">
                    <option value="0">Category</option>
                    <option value="1">Baby</option>
                    <option value="2">Beauty</option>
                    <option value="3">Books</option>
                    <option value="4">Clothing</option>
                    <option value="5">Computers & Accessories</option>
                    <option value="6">Electronics & Photo</option>
                    <option value="7">Garden & Outdoors</option>
                    <option value="8">Health & Personal Care</option>
                    <option value="9">Home & Kitchen</option>
                    <option value="10">Industrial & Scientific</option>
                    <option value="11">Large Appliances</option>
                    <option value="12">Pet Supplies</option>
                    <option value="13">Sports & Outdoors</option>
                    <option value="14">Stationery & Office Supplies</option>
                    <option value="15">Toys & Games</option>
                </select>
                <input 
                    className={styles.searchInput} 
                    type="text" 
                    placeholder="Search products..." 
                    onChange={(e) => {setSearch(e.target.value)}}
                    value={search}
                />

                <button className={styles.searchButton} >
                    <FontAwesomeIcon icon={faSearch}/>
                </button>
            </div>
        </form>
    )
}
