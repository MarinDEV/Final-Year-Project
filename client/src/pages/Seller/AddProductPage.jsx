import styles from '../../style/pages/addproductspage.module.css';
import {Form, Container, Button, Alert} from 'react-bootstrap';
import {useState, useEffect, useContext} from 'react';
import api from '../../api';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/Context";


const AddProductPage = () => {
    
    const {role, loaded} = useContext(AuthContext);

    // Redirects to main page if user is not a Seller
    useEffect(() => {
        if(role != "Seller" && loaded){
            navigate(`${process.env.PUBLIC_URL}/`)
        }
    }, [role, loaded]);

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [addedCategories, setAddedCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();

    const [prodName, setProdName] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState();
    const [quantity, setQuantity] = useState();
    const [dimensions, setDimensions] = useState();
    const [images, setImages] = useState({})
    const [showAlert, setShowAlert] = useState(false);

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

    // Removes the categories alert if a category is added.
    useEffect(() => {
        if(addedCategories.length != 0 ){
            setShowAlert(false);
        }
    },[addedCategories]);

    // Add a category to the product
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

    // Check if that category is selected 
    const isSelected = (category) => {
        let selected = false;
        addedCategories.forEach((cat) => {
            if(cat._id == category._id) {
                selected = true;
            }
        });
        return selected;
    }

    const handleClose = (category) => {
        let arr = addedCategories.filter((cat) => (cat._id != category._id))
        setAddedCategories(arr);
    }

    // Checks if categories are empty and shows alert if so.
    const validateCategories = () => {
        if(addedCategories.length == 0) {
            setShowAlert(true);
        }
    }

    // Handle add product
    const handleClick = (e) => {
        e.preventDefault(); 
        validateCategories();
        api.requestAddProduct({
            name: prodName,
            description: prodDesc,
            sku: sku,
            price: price,
            quantity: quantity,
            images: [images.image1,images.image2,images.image3,images.image4],
            categories: addedCategories,
            dimensions: dimensions
        }).then((res) => {
            if(res.data.message == "success"){
                navigate(`${process.env.PUBLIC_URL}/seller/products`);
            }
        });
    }

    if(role == "Seller"){
        return (
            <Form onSubmit={(e) => {handleClick(e)}}>
                <section className={styles.mainDiv}>
                    <Button variant="warning" style={{marginTop: 30, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} onClick={() => {navigate(`${process.env.PUBLIC_URL}/seller/products`)}}>Back</Button>
                    <Container className={styles.mainContainer} style={{borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                        <h3>Add a product</h3>
                        <Form.Group>
                            <Form.Control 
                                required 
                                className={styles.name} 
                                placeholder="Product Name"
                                value={prodName}
                                onChange={(e) => {handleNameChange(e)}}
                            /><br></br>
                            <Form.Control 
                                required 
                                className={styles.desc}
                                placeholder="Product Description"
                                value={prodDesc}
                                onChange={(e) => {handleDescChange(e)}}
                                as="textarea"
                            /><br></br>
                            <Form.Control 
                                className={styles.name}
                                placeholder="SKU"
                                value={sku}
                                onChange={(e) => {handleSkuChange(e)}}
                            /><br></br>
                            <Form.Group className={styles.priceGroup}>
                                <Form.Control 
                                    required 
                                    placeholder="Price (USD)"
                                    step="0.01"
                                    type="number"
                                    className={styles.priceInput}
                                    value={price}
                                    onChange={(e) => {handlePriceChange(e)}}
                                    min="0"
                                />
                                <Form.Control 
                                    required 
                                    placeholder="Quantity"
                                    type="number"
                                    className={styles.quantityInput}
                                    value={quantity}
                                    onChange={(e) => {handleQuantityChange(e)}}
                                    min="0"
                                />
                                <Form.Control 
                                    required 
                                    placeholder="Dimensions (m3)"
                                    type="number"
                                    step="0.01"
                                    className={styles.dimensionsInput}
                                    value={dimensions}
                                    onChange={(e) => {handleDimensionsChange(e)}}
                                    min="0"
                                />
                                <br></br>
                            </Form.Group>
                        </Form.Group>
                    </Container>
                    <Container className={styles.mainContainer}>
                        <h3>Images</h3>
                        <Form.Group>
                            <Form.Control 
                                required 
                                className={styles.name} 
                                placeholder="URL (Required)"
                                onChange={(e) => {
                                    setImages({...images, image1: e.target.value})
                                }}
                            /><br></br>
                            <Form.Control 
                                className={styles.name} 
                                placeholder="URL"
                                onChange={(e) => {
                                    setImages({...images, image2: e.target.value})
                                }}
                            /><br></br>
                            <Form.Control 
                                className={styles.name} 
                                placeholder="URL"
                                onChange={(e) => {
                                    setImages({...images, image3: e.target.value})
                                }}
                            /><br></br>
                            <Form.Control 
                                className={styles.name} 
                                placeholder="URL"
                                onChange={(e) => {
                                    setImages({...images, image4: e.target.value})
                                }}
                            /><br></br>
                        </Form.Group>
                    </Container>
                    <Container className={styles.mainContainer} style={{marginBottom:0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
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
                                return <Alert key={index} variant="info" dismissible className={styles.alert} onClose={() => handleClose(category)}><p>{category.name}</p></Alert>
                            })
                        }
                    </Container>
                    <Button type="submit" variant="success" style={{marginBottom: 30, borderTopLeftRadius: 0, borderTopRightRadius: 0}}>Add Product</Button>
                </section>
            </Form>
        )
    }else{
        return null
    }
}
export default AddProductPage;