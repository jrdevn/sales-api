import axios from "axios";
import {PRODUCT_API_URL} from '../../../config/constants/secrets.js';

class ProductClient {
    async checkProductStock(productsData, token, transactionid) {
        try {
            const headers = {
                Authorization: token,
                transactionid
            };
            console.info(`
                Sending request to Product-API with data: ${JSON.stringify(productsData)} and transactionId: ${transactionid}`);
            let response = false;
            await axios
                .post(`${PRODUCT_API_URL}/check-stock`, 
                        { products: productsData },
                        {headers})
                .then((res) => {
                    console.info(`Success response from Product-API. Transaction id: ${transactionid}`);
                    response = true;    
                })
                .catch((err) => {
                    console.error(`Error response from Product-API. Transaction id: ${transactionid}`);
                    response = false;
                });
                return response;
        } catch (err) {
            console.error(`Error response from Product-API. Transaction id: ${transactionid}`);
            return false;
        }
    }
}

export default new ProductClient();