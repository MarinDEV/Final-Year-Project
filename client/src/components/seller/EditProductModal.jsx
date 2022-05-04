/*
    A popup modal that allows sellers or admins to edit a product.
 */
import React,{useEffect, useState} from 'react';
import api from "../../api";
import {Modal,Row,Col,Figure,Button, Form, Alert, Container} from 'react-bootstrap';
import styles from '../../style/pages/editproductpage.module.css';
import {useNavigate} from 'react-router-dom';

const EditProductModal = (props) => {

    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [addedCategories, setAddedCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState({});

    const [prodName, setProdName] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [dimensions, setDimensions] = useState('');
    
    const [image1, setImage1] = useState('');
    const [image2, setImage2] = useState('');
    const [image3, setImage3] = useState('');
    const [image4, setImage4] = useState('');

    const [showAlert, setShowAlert] = useState(false);

    // Sets the hooks based on user input
    const handleNameChange = (e) => {
        setProdName(e.target.value)
    }

    const handleDescChange = (e) => {
        setProdDesc(e.target.value)
    }

    const handleSkuChange = (e) => {
        setSku(e.target.value)
    }

    const handlePriceChange = (e) => {
        setPrice(e.target.value)
    }

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value)
    }

    const handleDimensionsChange = (e) => {
        setDimensions(e.target.value)
    }

    useEffect(() => {
        api.getCategories().then((res) => {
            setCategories(res.data.categories);
        })
    },[]);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    }

    // Adds a cetegory to the list of selected categories.
    const addCategory = () => {
        let arr = [...addedCategories];
        categories.forEach((category) => {
            if(category._id == selectedCategory){
                arr.push(category);
                setSelectedCategory();
            }
        });
        setAddedCategories(arr);
    }

    // Checks if a category is selected
    const isSelected = (category) => {
        let selected = false;
        addedCategories.forEach((cat) => {
            if(cat._id == category._id) {
                selected = true;
            }
        });
        return selected;
    }

    // Removes a category
    const handleCategoryClose = (category) => {
        let arr = addedCategories.filter((cat) => (cat._id != category._id))
        setAddedCategories(arr);
    }

    // Checks if at least one category has been selected
    const validateCategories = () => {
        if(addedCategories.length == 0) {
            setShowAlert(true);
        }
    }

    // Checks when a category is added to remove alert when the # of categories is larger than 1
    useEffect(() => {
        if(addedCategories.length != 0 ){
            setShowAlert(false);
        }
    },[addedCategories]);

    // Loads the product data to the Modal.
    useEffect(() => {
        setProdName(props.product.name);
        setProdDesc(props.product.description);
        setSku(props.product.sku);
        setPrice(props.product.price);
        setQuantity(props.product.stock);  
        setDimensions(props.product.dimensions);

        setImage1(props.product.media?.[0]);
        setImage2(props.product.media?.[1]);
        setImage3(props.product.media?.[2]);
        setImage4(props.product.media?.[3]);
        try{
            let arr = [];
            props.product.categories.forEach((cat) => {
                const found = categories.find(category => category.value == cat);
                arr.push(found);
            });
            setAddedCategories(arr);
        }catch(err){

        }

    }, [props.show == true]);


    // Modifies the product on submit.
    const handleConfirm = async () => {
        props.setshow(false);

        const newProduct = {...props.product, 
            name: prodName, 
            description: prodDesc,
            sku: sku,
            price: price,
            stock: quantity,
            media: [image1, image2, image3, image4],
            categories: addedCategories.map((cat) => (cat.value)),
            dimensions: parseFloat(dimensions),
            status: "Pending"
        }

        await api.modifyProduct({
            _id: props.product._id,
            name: prodName,
            description: prodDesc,
            sku: sku,
            price: price,
            quantity: quantity,
            media: [image1, image2, image3, image4],
            categories: addedCategories.map((cat) => (cat.value)),
            dimensions: parseFloat(dimensions),
            status: "Pending"
        }).then((res) => {
            if(res.data.message == "Error") return;
            props.setproduct(props.product,{...newProduct, status: res.data.status});
        });
    }

    const handleDisable = () => {
        api.disableSellerProduct({productId: props.product._id}).then((res)=> {
            props.setshow(false);
            if(res.data.success){
                props.setproduct(props.product, {...props.product, status: "Disabled"});
            }
        });
    }

    const handleClose = () => {
        props.setshow(false);
    }

    return(
        <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={props.show}
            onHide={handleClose}
        >
            <Modal.Header closeButton >
                <Modal.Title id="contained-modal-title-vcenter">
                    Edit Product
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className={styles.mainContainer}>
                        <Form.Control 
                            required 
                            className={styles.name} 
                            placeholder="Product Name"
                            value={prodName || ''}
                            onChange={(e) => {handleNameChange(e)}}
                            maxLength={100}
                        /><br></br>
                        <Form.Control 
                            required 
                            className={styles.desc}
                            placeholder="Product Description"
                            value={prodDesc || ''}
                            onChange={(e) => {handleDescChange(e)}}
                            as="textarea"
                            maxLength={2000}
                        /><br></br>
                        <Form.Control 
                            required 
                            className={styles.name}
                            placeholder="SKU"
                            value={sku || ''}
                            onChange={(e) => {handleSkuChange(e)}}
                            maxLength={50}
                        /><br></br>
                        <Form.Group className={styles.priceGroup}>
                            <Form.Control 
                                required 
                                placeholder="Price (USD)"
                                type="number"
                                step="0.01"
                                min="0"
                                className={styles.priceInput}
                                value={price || ''}
                                onChange={(e) => {handlePriceChange(e)}}
                                onWheel={(e) => {e.target.blur()}}
                            />
                            <Form.Control 
                                required 
                                placeholder="Quantity"
                                type="number"
                                min="0"
                                className={styles.quantityInput}
                                value={quantity || ''}
                                onChange={(e) => {handleQuantityChange(e)}}
                                onWheel={(e) => {e.target.blur()}}
                            />
                            <Form.Control 
                                required 
                                placeholder="Dimensions (m3)"
                                type="number"
                                step="0.01"
                                min="0"
                                className={styles.dimensionsInput}
                                value={dimensions || ''}
                                onChange={(e) => {handleDimensionsChange(e)}}
                                onWheel={(e) => {e.target.blur()}}
                            />
                            <br></br>
                        </Form.Group>
                    </Form.Group>
                    <Form.Group className={styles.imageContainer}>
                        <h3>Images</h3>
                        <Form.Control 
                            required 
                            className={styles.name} 
                            placeholder="URL (Required)"
                            onChange={(e) => {
                                setImage1(e.target.value || '')
                            }}
                            value={image1 || ''}
                            maxLength={2048}
                        /><br></br>
                        <Form.Control 
                            className={styles.name} 
                            placeholder="URL"
                            onChange={(e) => {
                                setImage2(e.target.value)
                            }}
                            value={image2 || ''}
                            maxLength={2048}
                        /><br></br>
                        <Form.Control 
                            className={styles.name} 
                            placeholder="URL"
                            onChange={(e) => {
                                setImage3(e.target.value)
                            }}
                            value={image3 || ''}
                            maxLength={2048}
                        /><br></br>
                        <Form.Control 
                            className={styles.name} 
                            placeholder="URL"
                            onChange={(e) => {
                                setImage4(e.target.value)
                            }}
                            value={image4 || ''}
                            maxLength={2048}
                        /><br></br>
                    </Form.Group>
                    <Form.Group className={styles.categoryContainer}>
                        <h3>Categories</h3>
                        <Alert variant='danger' show={showAlert}>
                            You need to select at least 1 category!
                        </Alert>
                        <Form.Select 
                            aria-label="Categories" 
                            className={styles.catSelector} 
                            onChange={(e) => handleCategoryChange(e)}
                        >
                            <option>Categories</option>
                            {
                                categories.map((category, index) => {
                                    if(isSelected(category)){
                                        return null;
                                    }else{
                                        return <option key={index} value={category._id}>{category.name}</option>
                                    }
                                })
                            }
                        </Form.Select>
                        <Button className={styles.addCat} onClick={addCategory}>Add</Button>
                        {
                            addedCategories.map((category, index) => {
                                return <Alert key={index} variant="info" dismissible className={styles.alert} onClose={() => handleCategoryClose(category)}><p>{category.name}</p></Alert>
                            })
                        }
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button style={{float: 'left'}} variant="danger" onClick={handleDisable}>Disable</Button>
                <Button variant="warning" onClick={handleClose}>Cancel</Button>
                <Button variant="success" onClick={handleConfirm}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditProductModal;