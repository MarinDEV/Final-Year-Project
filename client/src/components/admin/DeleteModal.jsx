/*
    A popup Modal for Admins trying to delete a user.
 */
import React,{useEffect, useState} from 'react';
import api from "../../api";
import {Modal,Row,Col,Figure,Button} from 'react-bootstrap';

const DeleteModal = (props) => {

    const handleClose = () => {
        props.setshow(false)
    };

    const handleConfirm = () => {
        props.deleteuser();
    }

    return(
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            onHide={handleClose}
        >
            <Modal.Header closeButton >
                <Modal.Title id="contained-modal-title-vcenter">
                    Confirm Action
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete user {props.name}?</p> 
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>Cancel</Button>
                <Button variant="success" onClick={handleConfirm}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteModal;