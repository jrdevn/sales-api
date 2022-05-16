import Order from '../../modules/sales/model/Order.js';
import {v4 as uuidv4} from 'uuid';

export async function createInitialData() {
   //Order.collection.drop();
    await Order.create({
        products: [
            {
                productId: 1001,
                quantity: 2
            },
            {
                productId: 1002,
                quantity: 1
            },
            {
                productId: 1003,
                quantity: 2
            },
        ],
        user: {
            id: '12343w',
            name: 'Test user',
            email: 'usertest@gmail.com'
        },
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionId: uuidv4(),
        serviceId: uuidv4(),
    });
    await Order.create({
        products: [
            {
                productId: 1001,
                quantity: 3
            },
            {
                productId: 1002,
                quantity: 1
            },
        ],
        user: {
            id: '99898',
            name: 'Test user 2',
            email: 'usertest2@gmail.com'
        },
        status: 'REJECTED',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactionId: uuidv4(),
        serviceId: uuidv4(),
    });

    let initialData = await Order.find();
    console.log(JSON.stringify(initialData, undefined, 4)); 
}