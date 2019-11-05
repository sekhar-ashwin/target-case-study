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
        res = {};

    describe('getProductById', () => {
        let makeApiPromise;
        let makeApiPromiseResolve;
        let makeApiPromiseReject;
        let getPricePromise;
        let getPricePromiseResolve;
        let getPricePromiseReject;
        let externalApiStub;
        let productPriceStub;
        let next;

        beforeEach(() => {
            next = sinon.stub();
            makeApiPromise = new Promise((resolve, reject) => {
                makeApiPromiseResolve = resolve;
                makeApiPromiseReject = reject;
            });

            getPricePromise = new Promise((resolve, reject) => {
                getPricePromiseResolve = resolve;
                getPricePromiseReject = reject;
            });

            res = {
                json: sinon.spy(),
                status: sinon.stub().callsFake(() => res),
                send: sinon.spy()
            };
            externalApiStub = sinon.stub(externalApiService, 'makeApiCall').callsFake(() => makeApiPromise);

            productPriceStub = sinon.stub(productPriceService, 'getPriceByProductId').callsFake(() => getPricePromise);
        });

        afterEach(() => {
            externalApiStub.restore();
            productPriceStub.restore();
        });

        it('should return product object when it is present', (done) => {
            Controller.getProductById(req, res, next);
            makeApiPromise
                .then(() => {
                    sinon.assert.calledWith(externalApiService.makeApiCall, `https://redsky.target.com/v2/pdp/tcin/${req.params.productId}`);
                    sinon.assert.calledWith(productPriceService.getPriceByProductId, '13860431');
                    return getPricePromise;
                })
                .then(() => {
                    sinon.assert.calledWith(res.json, sinon.match({
                        name: req.body.name,
                        current_price: req.body.current_price
                    }));
                    done();
                });


            makeApiPromiseResolve({
                product: {
                    item: {
                        product_description: {
                            title: "The Hunters (DVD)"
                        }
                    }
                }
            });

            getPricePromiseResolve({
                "productId": 13860431,
                "current_price": {
                    "value": 23,
                    "currency_code": "USD"
                }
            });

        });

        it('should return not found if the product is not found', (done) => {
            Controller.getProductById(req, res, next);
            makeApiPromise
                .then(() => {
                    sinon.assert.calledWith(externalApiService.makeApiCall, `https://redsky.target.com/v2/pdp/tcin/${req.params.productId}`);
                    sinon.assert.notCalled(productPriceService.getPriceByProductId);
                    sinon.assert.calledWith(res.status, 404);
                    sinon.assert.calledWith(res.send, sinon.match({
                        "message": "Could not find the product you are looking for!"
                    }));
                    done();
                });

            makeApiPromiseResolve({
                product: {
                    item: {}
                }
            })
        });

        it('should return error if some error occurs', done => {
            Controller.getProductById(req, res, next);

            makeApiPromise
                .catch((err) => {
                    sinon.assert.calledWith(externalApiService.makeApiCall, `https://redsky.target.com/v2/pdp/tcin/${req.params.productId}`);
                    done();
                });

            makeApiPromiseReject({ error: 'some error' });
        })
    });



    describe('updatePrice', () => {
        let productPriceUpdateStub;
        let updatePricePromiseResolve;
        let updatePricePromiseReject;
        let updatePricePromise;
        let next;
        beforeEach(() => {
            next = sinon.stub();
            updatePricePromise = new Promise((resolve, reject) => {
                updatePricePromiseResolve = resolve;
                updatePricePromiseReject = reject;
            });
            productPriceUpdateStub = sinon.stub(productPriceService, 'updatePriceByProductId').callsFake(() => updatePricePromise)
        })

        afterEach(() => {
            productPriceUpdateStub.restore();
        })

        it('should return updated object', (done) => {
            Controller.updatePrice(req, res, next);
            updatePricePromise
                .then(() => {
                    sinon.assert.calledWith(productPriceService.updatePriceByProductId, '13860431', sinon.match({
                        "value": 23.00,
                        "currency_code": "USD"
                    }));

                    sinon.assert.called(res.json)
                    done();

                })
            
            updatePricePromiseResolve({
                id: '13860431',
                current_price : {
                    "value": 23.00,
                    "currency_code": "USD"
                }
            })
        })

        it('should throw error if any error happens', (done) => {
            Controller.updatePrice(req, res, next);

            updatePricePromise
                .catch(() => {
                    sinon.assert.calledWith(productPriceService.updatePriceByProductId, '13860431', sinon.match({
                        "value": 23.00,
                        "currency_code": "USD"
                    }));
                    done();
                })
            
            updatePricePromiseReject({
                error: "some error occured"
            })
        });
    })
})