const sinon = require('sinon');
const Controller = require('../controllers/ProductController');
const externalApiService = require('../services/ExternalApiService');
const productPriceService = require('../services/ProductPriceService');

describe('Product controller', () => {
    let req = {
        body: {
            "name": "The Hunters (DVD)",
            "current_price": {
                "value": 23.00,
                "currency_code": "USD"
            }
        },
        params: {
            productId: "13860431"
        }
    },
        // error = new Error({ error: "blah blah" }),
        res = {},
        expectedResult;

    const promise = data => new Promise((resolve, reject) => resolve(data));

    const rejectPromise = data => new Promise((resolve, reject) => reject(data));

    let externalApiStub;
    let productPriceStub;
    let next = (x) => x;

    describe('getProductById', () => {
        beforeEach(() => {
            res = {
                json: sinon.spy(),
                status: sinon.stub().returns({ end: sinon.spy() })
            };
            expectedResult = req.body;
            externalApiStub = sinon.stub(externalApiService, 'makeApiCall').callsFake(() => {
                return promise({
                    product: {
                        item: {
                            product_description: {
                                title: "The Hunters (DVD)"
                            }
                        }
                    }
                })
            });

            productPriceStub = sinon.stub(productPriceService, 'getPriceByProductId').callsFake(() => {
                return promise({
                    "productId": 13860431,
                    "current_price": {
                        "value": 23,
                        "currency_code": "USD"
                    }
                })
            })


        });

        afterEach(() => {
            externalApiStub.restore();
            productPriceStub.restore();
        });

        it('should return product object when it is present', (done) => {
            Controller.getProductById(req, res, next);
            // sinon.stub(externalApiService, 'makeApiCall').yields(null, {
            //     data: {
            //         product: {
            //             item: {
            //                 product_description: {
            //                     title: "The Hunters (DVD)"
            //                 }
            //             }
            //         }
            //     }
            // });
            // this.stub(productPriceService, 'getPriceByProductId').yields(null, {
            //     "productId": 13860431,
            //     "current_price": {
            //         "value": 23,
            //         "currency_code": "USD"
            //     }
            // })
            // let serviceStub = sinon.stub(Lookup, 'makeApiCall');
            // serviceStub.returns(Promise.resolve(expectedResult))
            // Controller.getProductById(req, res, next);
            console.log(req.params.productId, typeof req.params.productId, "=============")
            sinon.assert.calledWith(externalApiService.makeApiCall, `https://redsky.target.com/v2/pdp/tcin/${req.params.productId}`);
            sinon.assert.calledWith(productPriceService.getPriceByProductId, 13860431);
            // sinon.assert.calledWith(res.json, sinon.match({ name: req.body.name }));
            // sinon.assert.calledWith(res.json, sinon.match({ current_price: req.body.current_price }));
            done();
        });

        it('should return error if some error occurs', done => {
            externalApiStub.restore();
            externalApiStub = sinon.stub(externalApiService, 'makeApiCall').callsFake(() => {
                return reject({
                    "error": "something went wrong"
                })
            })

            sinon.assert.calledWith(externalApiService.makeApiCall, `https://redsky.target.com/v2/pdp/tcin/`);
            done();
        })
    });

    describe('updatePrice', () => {
        let productPriceUpdateStub;
        beforeEach(() => {
            Controller.updatePrice(req, res, next);
            productPriceUpdateStub = sinon.stub(productPriceService, 'updatePriceByProductId').callsFake(() => {
                return promise({
                    "productId": 13860431,
                    "current_price": {
                        "value": 23,
                        "currency_code": "USD"
                    }
                })
            })
        })

        afterEach(() => {
            productPriceUpdateStub.restore();
        })

        it('should return updated object', (done) => {

            sinon.assert.calledWith(productPriceService.updatePriceByProductId, 13860431, {
                "value": 99.99,
                "currency_code": "USD"
            });
            done();
        })
    })
})