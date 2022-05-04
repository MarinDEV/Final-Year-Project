import React,{useEffect, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/Context";
import api from "../../api";
import {Table, Button} from 'react-bootstrap';
import EditProductModal from '../../components/seller/EditProductModal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare} from '@fortawesome/free-solid-svg-icons';


const ViewProducts = () => {
    const navigate = useNavigate();
    const {role, loaded} = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState({});
    const [show,setShow] = useState(false);

    // Redirects to main page if user is not a seller
    useEffect(() => {
        if(role != "Seller" && loaded){
            navigate(`${process.env.PUBLIC_URL}/`)
        }
    }, [role, loaded]);

    // Gets all seller products from the database and sets the hook.
    useEffect(() => {
        api.getSellerProducts().then((res) => {
            setProducts(res.data.products);
        });
    }, []);

    // Activates EditProductModal
    const handleClick = (product) => {
        setShow(true);
        setSelectedProduct(product);
    }

    // Updates a product from the list 
    const setProduct = (productPrev, product) => {
        let arr = [...products];
        const index = arr.indexOf(productPrev);
        arr[index] = product;
        setProducts(arr);
    }


    if(role == "Seller"){
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
                        <th>#</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price ($)</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th><Button variant="success" onClick={() => navigate(`${process.env.PUBLIC_URL}/seller/add`)}>Add Product</Button></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        products.map((product, index) => (
                            <tr key={index} style={{ backgroundColor: product.status == "Active" ? '#73ba73' : product.status == "Denied" ? '#ffedad' : product.status == "Disabled" ? '#ffa3a3'  : null}}>
                                <td>{index}</td>
                                <td>{product.name.replace(/(.{40})..+/, "$1…")}</td>
                                <td>{product.sku}</td>
                                <td>{product.price}</td>
                                <td>{product.stock}</td>
                                <td>{product.status}</td>
                                <td><Button variant="warning" onClick={() => {handleClick(product)}}>Edit</Button></td>
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

export default ViewProducts;