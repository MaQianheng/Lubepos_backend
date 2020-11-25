let express = require('express');
let router = express.Router();
const {CustomerModel, CarModel} = require('../db/db_models')

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

    CustomerModel.countDocuments({}, function (err, count) {
        if (err) {
            return res.status(200).json({
                err_code: 4,
                message: `Read customers count fail ${err.message}`
            })
        }
        CustomerModel.find({}, {__v: 0}, (err, customers) => {
            if (err) {
                return res.status(200).json({
                    err_code: 5,
                    message: `Read customers info fail ${err.message}`
                })
            }
            return res.status(200).json({
                err_code: 0,
                customersCount: count,
                customers: customers
            })
        }).skip(((intCurrentPageCount === 0 ? 1 : intCurrentPageCount) - 1) * 10).limit(intCurrentPageCount === 0 ? 0 : 10);
    });
})

/* GET users listing. */
router.get('/insert', function (req, res, next) {
    const {name, phone, email} = req.query
    CustomerModel({
        name: name,
        phone: phone,
        email: email
    }).save((err, customer) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: err.message
            })
        }
        // res.cookie('userid',user._id,{maxAge:1000*60*60*24})
        return res.status(200).json({
            err_code: 0,
            customer
        })
    });
});

router.get('/update', (req, res) => {
    let {_id, name, phone, email} = req.query
    CustomerModel.findByIdAndUpdate({_id: _id}, {name, phone, email}, {}, (err, customer) => {
        if (err) {
            return res.status(200).json({
                err_code: 0,
                message: err.message
            })
        }
        return res.status(200).json({
            err_code: 0,
            customer
        })
    });
})

router.get('/delete', (req, res) => {
    let {_id} = req.query
    _id = _id.split(",")
    CustomerModel.deleteOne({_id: {$in: _id}}, (err, customer) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: err.message
            })
        }
        if (customer.deletedCount > 0) {
            CarModel.deleteMany({owner: {$in: _id}}, (err, car) => {
                if (err) {
                    return res.status(200).json({
                        err_code: 1,
                        message: err.message
                    })
                }
                return res.status(200).json({
                    err_code: 0,
                    customer,
                    car,
                })
            })
        } else {
            return res.status(200).json({
                err_code: 1,
                message: "No such record"
            })
        }
    });
})

router.get('/test', (req, res) => {
    let {_id} = req.query
    console.log(_id)
    _id = _id.split(",")
    CarModel.deleteMany({owner: {$in: _id}}, (err, car) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: err.message
            })
        }
        return res.status(200).json({
            err_code: 0,
            car
        })
    })
})
module.exports = router;
