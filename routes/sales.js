let express = require('express');
let router = express.Router();
const {BillModel, SaleModel} = require('../db/db_models')

/* GET users listing. */
// router.get('/items', function(req, res, next) {
//   console.log("user router")
// });

router.get('/insert', function (req, res, next) {
    // const userid = req.cookies.userid
    const {totalPrice} = req.query
    let itemId = req.query.itemId.split(",")
    let amount = req.query.amount.split(",")
    if (itemId.length !== amount.length) {
        return res.status(500).json({
            err_code: 500,
            message: "Invalid data"
        })
    }

    new BillModel({
        totalPrice: totalPrice
    }).save((err, bill) => {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: err.message
            })
        }
        let arr = [];
        for (let i=0;i<itemId.length;i++) {
            arr.push({
                "billId": bill._id,
                "itemId": itemId[i],
                "amount": parseInt(amount[i])
            })
        }
        // console.log(arr)
        SaleModel.insertMany(arr).then(function () {
            // console.log("Data inserted")
            return res.status(200).json({
				err_code: 0,
				data:{
				    _id: bill._id
				}
			})
        }).catch(function (err) {
            BillModel.deleteOne({_id: bill.id}).then(function () {
                // 删除成功，返回插入失败信息
                return res.status(200).json({
                    err_code: 1,
                    message: err.message
                })
            }).catch(function (err) {
                // 删除失败，返回删除失败信息
                return res.status(200).json({
                    err_code: 1,
                    message: err.message
                })
            })
        });
    })
});

module.exports = router;
