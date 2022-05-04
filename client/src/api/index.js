import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
})

export const sampleRequest = (payload) => api.post('/message', payload, {withCredentials: true});

export const insertUser = payload => api.post(`/user/register`, payload, {withCredentials: true}); // OK 
export const loginUser = payload => api.post(`/user/login`, payload, {withCredentials: true}) // OK
export const logoutUser = payload => api.post(`/user/logout`, payload, {withCredentials: true})
export const getUser = () => api.get('/user/get',{withCredentials: true});
export const getProducts = (term, category) => api.get('/products/get', { params: { term, category }}); // OK
export const getProduct = (id) => api.get('/product/get', { params: { id: id }});
export const getProductsByIds =(ids) => api.get('/products/getbyids', { params: { ids: JSON.stringify(ids) }});
export const addCart = payload => api.post('/cart/add', payload, {withCredentials: true})
export const getCartItems = () => api.get('/cart/get', {withCredentials: true}) // OK
export const removeCartItem = payload => api.post('/cart/remove', payload,{withCredentials: true}); // OK 
export const placeOrder = payload => api.post('/cart/order', payload, {withCredentials: true});
export const getFeaturedProducts = () => api.get('/products/featured', {withCredentials: true});
export const getUserOrders = (payload) => api.get('/orders/get', {withCredentials: true});
export const getAllUsers = () => api.get('/admin/users/get', {withCredentials: true});
export const setUserRole = (payload) => api.post('/admin/users/setrole',payload, {withCredentials: true});
export const deleteUser = (payload) => api.delete('/admin/user/delete', {withCredentials: true, params: { id: payload.id } })
export const requestAddProduct = (payload) => api.post('/seller/addproduct', payload, {withCredentials: true});
export const getCategories = (payload) => api.get('/seller/categories/get', {withCredentials: true});
export const getSellerProducts = () => api.get('/seller/products/get', {withCredentials: true});
export const disableSellerProduct = (payload) => api.post('seller/product/disable', payload, {withCredentials: true});
export const getSellerOrders = () => api.get('/seller/orders/get', {withCredentials: true});
export const modifyProduct = (payload) => api.post('/seller/product/modify', payload, {withCredentials: true});
export const getAllProducts = () => api.get('/admin/products/get', {withCredentials: true})
export const changeStatus = (payload) => api.post('/admin/product/status/set', payload , {withCredentials: true})
export const getOrders = () => api.get('/courier/orders/get', {withCredentials: true});
export const changeOrderStatus = payload => api.post('/courier/status/set', payload , {withCredentials: true})
export const returnOrder = payload => api.post('/products/return', payload, {withCredentials: true})
export const readyItems = payload => api.post('/products/ready', payload, {withCredentials: true})
export const updateOrderStatus = payload => api.post('/admin/order/status/set', payload, {withCredentials: true})
export const deleteOrder = payload => api.delete('/admin/order/delete', {withCredentials: true, params: { id: payload.order._id }})
export const getNewDelivery = () => api.get('/courier/new', { withCredentials: true });
export const getDeliveryDetails = (payload) => api.get('/courier/delivery/get', { withCredentials: true, params: { id: payload.deliveryId }});
export const getCourierDelivery = () => api.get('/courier/delivery/active', {withCredentials: true});
export const nextLocation = (payload) => api.post('/courier/delivery/next', payload ,{ withCredentials: true });
export const completeDelivery = (payload) => api.post('/courier/delivery/complete', payload, {withCredentials: true});
export const getDistanceMatrix = (payload) => api.get('/courier/delivery/matrix', {withCredentials: true, params: { url: payload.url }});

const apis = {
    insertUser, loginUser, logoutUser, getUser, getProducts,getProduct, addCart, getCartItems, removeCartItem, placeOrder,
    getFeaturedProducts, getUserOrders, getProductsByIds, getAllUsers, setUserRole, deleteUser, getCategories, requestAddProduct,
    getSellerProducts, modifyProduct, getSellerOrders, getAllProducts, changeStatus, getOrders, changeOrderStatus, disableSellerProduct,
    returnOrder, readyItems, updateOrderStatus, deleteOrder, getNewDelivery, getDeliveryDetails, getCourierDelivery, nextLocation,
    completeDelivery, getDistanceMatrix
}

export default apis