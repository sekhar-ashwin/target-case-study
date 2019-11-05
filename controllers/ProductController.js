const externalApiService = require('../services/ExternalApiService');
const config = require('../config/dev.json');
const baseUrl = config.baseUrl || `https://redsky.target.com/v2/pdp/tcin/`;
const productPriceService = require('../services/ProductPriceService');

const getProductById = (req, res, next) => {
    let finalResponse = {
        id: parseInt(req.params.productId)
    };
    //calls external target api
    externalApiService.makeApiCall(`${baseUrl}${req.params.productId}`)
        .then(data => {
            if (Object.keys(data.product.item).length) { //check for product existance
                finalResponse['name'] = data.product.item.product_description.title;
                //call service to find price of the product
                return productPriceService.getPriceByProductId(req.params.productId);
            } else {
                res.status(404).send({
                    "message": "Could not find the product you are looking for!"
                });
                //or we can send back an empty json object
            }
        })
        .then(priceDetails => {
            finalResponse['current_price'] = priceDetails['current_price'];
            res.json(finalResponse)
        })
        .catch(err => {
            return next(err)
        });
}

const updatePrice = (req, res, next) => {
    productPriceService.updatePriceByProductId(req.params.productId, req.body.current_price)
        .then(updateResonse => res.json(updateResonse))
        .catch(err => next(err));
}


module.exports = { getProductById, updatePrice }