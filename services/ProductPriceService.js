const prices = require('../helperFiles/price.json');

const getPriceByProductId = (productId) => {
    return new Promise((resolve, reject) => {
        //db call or external api to get price of a product
        let data = prices.filter(price => parseInt(price.productId) === parseInt(productId));
        if (data.length) {
            return resolve(data[0]);
        } else {
            return resolve({
                "productId": productId,
                "current_price": {
                    "value": 99.99,
                    "currency_code": "USD"
                }
            })
        }
    })
}


const updatePriceByProductId = (productId, currentPrice) => {
    return new Promise((resolve, reject) => {
        //db call or api call to update price to be made

        //mock update
        let objectIndex = prices.findIndex(price => parseInt(price.productId) === parseInt(productId));
        if(objectIndex > -1) {
            prices[objectIndex]['current_price'] = currentPrice;
            return resolve(prices[objectIndex]);
        } else {
            let dummyPrice = {
                "productId": productId,
                "current_price": {
                    "value": 99.99,
                    "currency_code": "USD"
                }
            };
            prices.push(dummyPrice)
            return resolve(dummyPrice)
        }
    })
}

const productPriceService = module.exports = { getPriceByProductId, updatePriceByProductId }