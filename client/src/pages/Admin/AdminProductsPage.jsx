import React,{useEffect, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/Context";
import api from "../../api";
import {Table, Button} from 'react-bootstrap';
import EditProductModal from '../../components/seller/EditProductModal'

const AdminProductsPage = (props) => {

    const navigate = useNavigate();
    const {role, loaded} = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState({});
    const [show,setShow] = useState(false);

    // Redirects to login if user is not admin
    useEffect(() => {
        if(role != "Admin" && loaded){
            navigate(`${process.env.PUBLIC_URL}/login`)
        }
    }, [role, loaded]);

    // Gets all products from database
    useEffect(() => {
        api.getAllProducts().then((res) => {
            setProducts(res.data.products);
        });
    }, []);

    // Changes a products status
    const handleStatusChange = (product, status) => {
        const productId = product._id;
        api.changeStatus({productId, previousStatus: product.status, status}).then((res) => {
            if(res.data.message == "success"){
                let arr = [...products];
                let index = arr.indexOf(product);
                product.status=status;
                arr[index] = product;
                setProducts(arr);
            }
        })
    }

    // Sets a product on the table
    const setProduct = (productPrev, product) => {
        let arr = [...products];
        const index = arr.indexOf(productPrev);

        arr[index] = product;
        console.log(arr);
        setProducts(arr);
    }

    if(role == "Admin"){
        return (
            <div>
                <EditProductModal
                    product={selectedProduct}
                    show={show}
                    setshow={setShow}
                    setproduct={setProduct}
                />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th></th>
                        <th>#</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price ($)</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        products.map((product, index) => (
                            <tr key={index}>
                                <td><Button variant="dark" style={{cursor: 'pointer'}} onClick={() => {setSelectedProduct(product); setShow(true)}}>View</Button></td>
                                <td>{index}</td>
                                <td>{product.name.replace(/(.{40})..+/, "$1…")}</td>
                                <td>{product.sku}</td>
                                <td>{product.price}</td>
                                <td>{product.stock}</td>
                                {
                                    product.status == "Active" ?

                                    <td style={{color: 'green'}}>Active</td>

                                    : product.status == "Pending" ?

                                    <td>Pending</td>

                                    : product.status == "Denied" ?

                                    <td style={{color: 'orange'}}>Denied</td>

                                    : product.status == "Disabled" ?

                                    <td style={{color: 'red'}}>Disabled</td>

                                    : 

                                    <td> {product.status}</td>
                                }
                                {
                                    <>
                                        <td>
                                            <Button variant="success" style={{marginRight: 5}} onClick={() => handleStatusChange(product, "Active")}>Active</Button>
                                            <Button variant="secondary" style={{marginRight: 5, marginLeft: 5}} onClick={() => handleStatusChange(product, "Pending")}>Pending</Button>
                                            <Button variant="warning" style={{marginLeft: 5, marginRight: 5}} onClick={() => handleStatusChange(product, "Denied")}>Denied</Button>
                                            <Button variant="danger" style={{marginLeft: 5}} onClick={() => handleStatusChange(product, "Disabled")}>Disable</Button>
                                        </td>
                                    </>
                                }
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
            </div>
        )
    }else{
        return(null);
    }
}

export default AdminProductsPage;

