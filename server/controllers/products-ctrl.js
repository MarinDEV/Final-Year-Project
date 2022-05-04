const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
/* 
    Gets a list of products by searching the names for the 
    search term and filtering based on the selected category. 
*/ 
getProducts = async (req,res) => {
    try{
        const term = req.query.term;
        const category = req.query.category;
        const database = dbo.getDb();
        const collection = database.collection("products");

        if(!term && category){
            const products = []
            const results = await collection.find().forEach((product) => {
                products.push(product);
            });
            if(category == 0){
                const filteredProducts = products.filter(product => product.status == "Active");
                return res.json({products: filteredProducts});
            }else{
                const arr = products.filter((product) => product.categories.includes(parseInt(category)) && product.status == "Active");
                return res.json({products: arr});
            }
        }else{
            const results = await collection.aggregate([
                {
                    $search: {
                        index: "default",
                        text: {
                            query: term,
                            path: ["name","description"],
                            fuzzy: {
                                maxEdits: 1,
                            },
                        },
                    },
                },
            ])
            .toArray();

            // Filter by category && show only "Active" products
            const filteredResults = results.filter(product => (product.categories.includes(parseInt(category)) || category == 0) && product.status == "Active");
            res.json({products: filteredResults});
        }
    }catch(error){
        res.json({products: []});
        console.log(error);
    }
};


/*
    Gets the product by id and returns it.
    If product doesn't exist it returns null.
*/
getProduct = async (req, res) => {
    let db_connect = dbo.getDb();
    const product = await db_connect.collection("products").findOne({_id: ObjectId(req.query.id)});
    return res.json({product: product})
}

const getFeaturedProducts = async (req, res) => {
    let db_connect = dbo.getDb();   
    let arr = await db_connect.collection("products").find({featured: true}).toArray();
    return res.json({products: arr})
}

const getProductsByIds = async (req,res) => {
    let db_connect = dbo.getDb();
    const stringProducts = JSON.parse(req.query.ids);
    
    const pr = stringProducts.map((product) => 
    ({product: new ObjectId(product.product), cartId: product.cartId, quantity: product.quantity, status: product.status}));
    console.log(pr);

    let products = [];
    await db_connect.collection("products").find().forEach((product) => {
        pr.forEach((p) => {
            if(product._id.equals(p.product)){
                products.push({...product, cartId: p.cartId ,quantity: p.quantity, status: p.status});
            }
        });
    }).then(() => res.json({products: products}));
}
 

module.exports = {
    getProducts,
    getProduct,
    getFeaturedProducts,
    getProductsByIds
}