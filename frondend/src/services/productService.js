import axios from 'axios';

const API_URL = "http://localhost:8082/api/products";
const IMAGE_BASE_URL = "http://localhost:8082/uploads/";

export const fetchAllProducts = async () => {
    const response = await axios.get(`${API_URL}/all`);
    //Map the image name to a full URL for the UI to display
    return response.data.map(product => ({
        ...product,
        image: `${IMAGE_BASE_URL}${product.productImage}`
    }));
};

export const createProduct = async (formData) => {
    //  Sending Multipart/form-data for image upload
    const response = await axios.post(`${API_URL}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const removeProduct = async (id) => {
    await axios.delete(`${API_URL}/delete/${id}`);
};

export const updateProductApi = (id, data) => {
    return axios.put(`${API_URL}/update/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};