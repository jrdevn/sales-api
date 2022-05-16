import OrderService from '../service/OrderService.js';
import Order from '../model/Order.js';

class OrderController {
    async createOrder(req,res) {
        let order  = await OrderService.createOrder(req);
        console.log(order);
        return res.status(order.status).json(order);
    }

    async findById(req, res) {
        let existingOrder  = await OrderService.findById(req);
        return res.status(existingOrder.status).json(existingOrder);
    }

    async findAll(req, res) {
        let orders  = await OrderService.findAll(req);
        return res.status(orders.status).json(orders);
    }

    async findByProductId(req, res) {
        let orders  = await OrderService.findByProductId(req);
        return res.status(orders.status).json(orders);
    }


}

export default new OrderController();