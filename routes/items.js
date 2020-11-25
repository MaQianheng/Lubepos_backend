let express = require('express');
let router = express.Router();
const {ItemModel} = require('../db/db_models')

router.get('/query', (req, res) => {
    const {currentPageCount} = req.query
    let intCurrentPageCount
    try {
        if (!currentPageCount) {
            intCurrentPageCount = 1
        } else {
            intCurrentPageCount = parseInt(currentPageCount)
        }
    } catch (err) {
        return res.status(500).json({
            err_code: 4,
            message: `Parse int fail ${err.message}`
        })
    }

    ItemModel.countDocuments({}, function (err, count) {
        if (err) {
            return res.status(200).json({
                err_code: 4,
                message: `Read items count fail ${err.message}`
            })
        }
        ItemModel.find({}, {__v: 0}, (err, items) => {
            if (err) {
                return res.status(200).json({
                    err_code: 5,
                    message: `Read items info fail ${err.message}`
                })
            }
            return res.status(200).json({
                err_code: 0,
                itemsCount: count,
                items: items
            })
        }).skip(((intCurrentPageCount === 0 ? 1 : intCurrentPageCount) - 1) * 10).limit(intCurrentPageCount === 0 ? 0 : 10);
    });
})

/* GET users listing. */
router.get('/insert', function (req, res, next) {
    // const userid = req.cookies.userid
    const {name, type, brand, amount, price} = req.query
    ItemModel({
        name: name,
        type: type,
        brand: brand,
        amount: amount,
        price: price
    }).save((err, item) => {
        if (err) {
            return res.status(200).json({
                err_code: 5,
                message: err.message
            })
        }
        // res.cookie('userid',user._id,{maxAge:1000*60*60*24})
        return res.status(200).json({
            err_code: 0,
            item: item
        })
    })
});

// amount: 87
// brand: "brand 1"
// name: "product 1"
// price: 120
// type: "products"
// _id: "5f9525e01169084cb2567370"

router.get('/update', (req, res) => {
    const {amount, brand, name, price, type, _id} = req.query
    ItemModel.findByIdAndUpdate({_id: _id}, {amount, brand, name, price, type}, {}, (err, item) => {
        if (err) {
            return res.status(200).json({
                err_code: 0,
                message: err.message
            })
        }
        return res.status(200).json({
            err_code: 0,
            item
        })
    });
})

router.get('/delete', (req, res) => {
    let {_id} = req.query
    _id = _id.split(",")
    ItemModel.deleteOne({_id: {$in: _id}}, (err, item) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: err.message
            })
        }
        return res.status(200).json({
            err_code: 0,
            item
        })
    });
})

module.exports = router;
