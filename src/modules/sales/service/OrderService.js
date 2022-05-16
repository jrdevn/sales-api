import OrderRepository from '../repository/OrderRepository.js';
import {sendMessageToProductStockUpdateQueue} from '../../product/rabbitmq/productStockUpdateSender.js';
import {PENDING, ACCEPTED, REJECTED} from '../status/OrderStatus.js';
import OrderException from '../exception/OrderException.js';
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, SUCCESS} from '../../../config/constants/httpStatus.js';
import ProductClient from '../../product/client/ProductClient.js';


class OrderService {

    // api
    async createOrder(req) {
        try {
            let orderData = req.body;
            let {transactionid, serviceid} = req.headers;
            console.info(
                `Request to POST new order with data ${JSON.stringify(orderData)} 
                            | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            this.validateOrderData(orderData);
            const {authUser} = req;
            const {authorization} = req.headers;
            let order = this.createInitialOrderData(orderData, authUser, transactionid, serviceid);
            await this.validateProductStock(order, authorization, transactionid);
            let createdOrder = await OrderRepository.save(order);
            this.sendMessageOrder(createdOrder, transactionid);
            let response =  {
                status: SUCCESS,
                createdOrder
            };
            console.info(
                `Request to POST new order with data ${JSON.stringify(response)} 
                            | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            return response;
        } catch (err) {
            return {
                status: err.status ? err.status : INTERNAL_SERVER_ERROR, 
                message: err.message
            }
        }
    }

    async updateOrder(orderMessage) {
        try {
            const order = JSON.parse(orderMessage);
            if (order.salesId && order.status) {
                let existingOrder = await OrderRepository.findById(order.salesId);
                if (existingOrder && order.status !== existingOrder.status) {
                    existingOrder.status = order.status;
                    existingOrder.updatedAt = new Date();
                    await OrderRepository.save(existingOrder);
                }
            } else {
                console.warn(`The order message was not complete. TransactionId: ${orderMessage.transactionid}`);
            }
        } catch (err) {
            console.error('Could not parse order message from queue. Transaction ');
            console.error(`Error: ${err.message}`);
        }
    }

    validateOrderData(data) {
        if (!data  || !data.products) {
            throw new OrderException(BAD_REQUEST, 'The products must be informed.')
        }
    }


    async validateProductStock(order, token, transactionId) {
        let stockIsOk = await ProductClient.checkProductStock(order.products, token, transactionId);
        if (!stockIsOk) {
            throw new OrderException(BAD_REQUEST, 'The stock out for products');
        }
    }

    createInitialOrderData(orderData, authUser, transactionid, serviceid) {
        return {
            status: PENDING,
            user: authUser,
            createdAt: new Date(),
            updatedAt: new Date(),
            transactionId: transactionid,
            serviceId: serviceid,
            products: orderData.products,
        };
    }

    sendMessageOrder(createdOrder, transactionid) {
        const message = {
            salesId: createdOrder.id,
            products: createdOrder.products,
            transactionid: transactionid
        };
        sendMessageToProductStockUpdateQueue(message);
    }

    // api
    async findById(req) {
        try {
            const {id} = req.params;
            console.log('toma: ' + id);
            let {transactionid, serviceid} = req.headers;
            console.info(
                `Request to GET order by Id ${id}} 
                            | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            this.validateInformedId(id);
            const existingOrder = await OrderRepository.findById(id);
            if (!existingOrder) {
                throw new OrderException(BAD_REQUEST, "The order not found!");
            }
            let response =  {
                existingOrder,
                status: SUCCESS,
            };
            console.info(
                `Response to GET order by Id ${id}: ${JSON.stringify(response)} 
                            | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            return response;
        } catch (err) {
             return {
                status: err.status ? err.status : INTERNAL_SERVER_ERROR, 
                message: err.message
             };
        };
    }

    validateInformedId(id) {
        if (!id) {
            throw new OrderException(BAD_REQUEST, "The order ID must be informed!");
        }
    }

    validateInformedProductId(id) {
        if (!id) {
            throw new OrderException(BAD_REQUEST, "The order productId must be informed!");
        }
    }

    // api
    async findAll(req) {
        try {
            let {transactionid, serviceid} = req.headers;
            console.info(
                `Request to GET all orders | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            const orders = await OrderRepository.findAll();
            if (!orders) {
                throw new OrderException(BAD_REQUEST, "No orders not found!");
            }
            let response =  {
                status: SUCCESS,
                orders,
            };
            console.info(
                `Response to GET all orders: ${JSON.stringify(response)} | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            return response;
        } catch (err) {
             return {
                status: err.status ? err.status : INTERNAL_SERVER_ERROR, 
                message: err.message
             };
        };
    }

    // api
    async findByProductId(req) {
        try {
            const {productId} = req.params;
            let {transactionid, serviceid} = req.headers;
            console.info(
                `Request to GET find by productId: ${productId} | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            this.validateInformedProductId(productId);
            const orders = await OrderRepository.findByProductId(productId);
            if (!orders) {
                throw new OrderException(BAD_REQUEST, "No orders not found!");
            }
            let response = {
                status: SUCCESS,
                salesIds: orders.map((order) => {
                    return order.id
                }),
            };
            console.info(
                `Response to GET find by productId ${productId}: ${JSON.stringify(response)}
                 | transactionId: ${transactionid} | serviceId: ${serviceid}`
            );
            return response;

        } catch (err) {
             return {
                status: err.status ? err.status : INTERNAL_SERVER_ERROR, 
                message: err.message
             };
        };
    }
 }

export default new OrderService();