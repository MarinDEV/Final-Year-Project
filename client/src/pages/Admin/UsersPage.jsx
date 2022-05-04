import React,{useEffect, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/Context";
import api from "../../api";
import {Table, Button} from 'react-bootstrap';
import RoleModal from  '../../components/admin/RoleModal';
import DeleteModal from  '../../components/admin/DeleteModal';


const UsersPage = () => {
    const navigate = useNavigate();
    const {role, loaded} = useContext(AuthContext);
    const roles = ["Default","Admin","Seller","Courier"];
    const [users, setUsers] = useState([]);

    const [selectedUser, setSelectedUser] = useState({
        name: '',
        role: ''
    });
    const [newRole, setNewRole] = useState('');
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);

    // Gets all users from the database and sets hook.
    useEffect(() => {
        api.getAllUsers().then((res) => {
            setUsers(res.data.users);
        });
    }, []);

    // Redirects to login page if user is not admin
    useEffect(() => {
        if(role != "Admin" && loaded){
            navigate(`${process.env.PUBLIC_URL}/login`)
        }
    }, [role, loaded]);

    // Shows the respective modal when an action is performed.
    const handleClick = (e, i) => {
        const userId = e.target.value;
        users.forEach((user) => {
            if(user._id == (userId)){
                setSelectedUser(user);
            } 
        })
        if(i == 0){
            setShow(true);
        }else{
            setShow2(true);
        }
    }

    // Sets the role of a user
    const setRole = () => {
        setShow(false);
        api.setUserRole({id: selectedUser._id, role: newRole}).then((res) => {
            if(res.data.message == 'fail') return;
            let arr = [...users];
            arr.forEach((user,index) => {
                if(user._id == selectedUser._id){
                    user.role = newRole;
                }
            });
            setUsers(arr);
        });
    }

    // Deletes a user
    const deleteUser = () => {
        setShow2(false);
        api.deleteUser({id: selectedUser._id}).then((res) => {
            if(res.data.message == 'fail') return;
            let arr = [...users];
            let arr2 = []
            arr.forEach((user,index) => {
                if(user._id != selectedUser._id){
                    arr2.push(user);
                }
            });
            setUsers(arr2);
        });
    }

    if(role == "Admin"){
        return (
            <div>
                <RoleModal
                    show={show}
                    name={selectedUser.name}
                    role={selectedUser.role}
                    setshow={setShow}
                    newrole={newRole}
                    setrole={setRole}
                />
                <DeleteModal
                    show={show2}
                    name={selectedUser.name}
                    setshow={setShow2}
                    deleteuser={deleteUser}
                />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Change Role</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{index}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                {
                                    roles.map((role, ind) => {
                                        if(role == user.role) return null
                                        return <Button key={ind} variant="secondary" value={user._id} style={{marginLeft:'5px', marginRight: '5px'}} onClick={(e) =>{ handleClick(e,0); setNewRole(role)}}>{role}</Button>
                                    })
                                }
                                </td>
                                <td>
                                    <Button variant="danger" value={user._id} style={{marginLeft:'5px', marginRight: '5px'}} onClick={(e) => {handleClick(e,1);}}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )
    }else{
        return(null);
    }
}

export default UsersPage;