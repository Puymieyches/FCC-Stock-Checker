const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('One Stock, GET /api/stock-prices/', () => {
        test('Viewing one stock', (done) => {
            chai.request(server)
                .get('/api/stock-prices/')
                .set("content-type", "application/json")
                .query({ stock: "GOOG" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body.stockData);
                    assert.property(res.body.stockData, 'stock');
                    assert.property(res.body.stockData, 'price');
                    assert.property(res.body.stockData, 'likes');
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.exists(res.body.stockData.price, "There's a number");
                    done();
                });
        });
        test('Viewing one stock and liking it', (done) => {
            chai.request(server)
                .get('/api/stock-prices/')
                .set("content-type", "application/json")
                .query({ stock: "GOOG", like: 'true' })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isObject(res.body.stockData);
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.exists(res.body.stockData.price, "There's a number");
                    assert.isAbove(res.body.stockData.likes, 0, 'Should at least be 1');
                    done();
                });
        });
    });
    suite('Same Stock, GET /api/stock-prices/', () => {
        test('Viewing the same stock and liking it again', (done) => {
            chai.request(server)
                .get('/api/stock-prices/')
                .set("content-type", "application/json")
                .query({ stock: "GOOG", like: 'true' })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isObject(res.body.stockData);
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.exists(res.body.stockData.price, "There's a number");
                    assert.isAbove(res.body.stockData.likes, 0, 'Should at least be 1');
                    done();
                }); 
        });
    });
    suite('Two Stocks, GET /api/stock-prices/', () => {
        test('Viewing two stocks', (done) => {
            chai.request(server)
                .get('/api/stock-prices/')
                .set("content-type", "application/json")
                .query({ stock: ["GOOG", "AMZN"] })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.equal(res.body.stockData.length, 2);
                    assert.equal(res.body.stockData[0].stock, "GOOG");
                    assert.equal(res.body.stockData[1].stock, "AMZN");
                    assert.exists(res.body.stockData[0].price, "There's a number");
                    assert.exists(res.body.stockData[1].price, "There's a number");
                    done();
                });
        });
        test('Viewing two stocks and liking them', (done) => {
            chai.request(server)
                .get('/api/stock-prices/')
                .set("content-type", "application/json")
                .query({ stock: ['GOOG', 'AMZN'], like: 'true' })
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.equal(res.body.stockData.length, 2);
                    assert.equal(res.body.stockData[0].stock, "GOOG");
                    assert.equal(res.body.stockData[1].stock, "AMZN");
                    assert.exists(res.body.stockData[0].price, "There's a number");
                    assert.exists(res.body.stockData[1].price, "There's a number");
                    assert.exists(res.body.stockData[0].rel_likes, 'Should at least be 1');
                    assert.exists(res.body.stockData[1].rel_likes, 'Should at least be 1');
                    done();
                });
        });
    });
});
