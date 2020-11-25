let express = require('express');
let router = express.Router();
const {ItemModel, SaleModel} = require('../db/db_models')
// const {startSession} = require('mongoose')

/* GET users listing. */
// router.get('/items', function(req, res, next) {
//   console.log("user router")
// });

router.get('/query', (req, res) => {
    let {startTimeStamp, endTimeStamp, currentPageCount} = req.query
    if (startTimeStamp >= endTimeStamp) {
        return res.status(200).json({
            err_code: 1,
            message: "Invalid date"
        })
    }

    let intCurrentPageCount
    try {
        if (!currentPageCount) {
            intCurrentPageCount = 1
        } else {
            intCurrentPageCount = parseInt(currentPageCount)
        }
    } catch (err) {
        return res.status(200).json({
            err_code: 4,
            message: `Parse int fail ${err.message}`
        })
    }

    let condition = {$and: [{createdTimeStamp: {$gte: startTimeStamp}}, {createdTimeStamp: {$lte: endTimeStamp}}]}
    SaleModel.countDocuments(condition, function (err, totalCount) {
        if (err) {
            return res.status(200).json({
                err_code: 4,
                message: `Read sales total count fail ${err.message}`
            })
        }
        SaleModel.find(condition, {}, (err, sales) => {
            if (err) {
                return res.status(200).json({
                    err_code: 2,
                    message: err.message
                })
            }

            return res.status(200).json({
                err_code: 0,
                totalCount,
                sales
            })
            // sort({'createdTimeStamp': 1}): 按照createdTimeStamp字段从小到大排序
        }).sort({'createdTimeStamp': 1}).skip(((intCurrentPageCount === 0 ? 1 : intCurrentPageCount) - 1) * 10).limit(intCurrentPageCount === 0 ? 0 : 10);
    });
})

router.get('/insert', async function (req, res, next) {
    let {totalPrice, itemsId, itemsName, amount, unitPrice, price, id, name, plateNumber, brand, model} = req.query
    itemsId = itemsId.split(",")
    itemsName = itemsName.split(",")
    amount = amount.split(",")
    unitPrice = unitPrice.split(",")
    price = price.split(",")
    let length = itemsId.length
    if (itemsId.length !== length || itemsName.length !== length || amount.length !== length || unitPrice.length !== length || price.length !== length) {
        return res.status(200).json({
            err_code: 1,
            message: "Invalid data"
        })
    }

    // 如果多人同时操作添加sale可能导致前端数据不准确：
    // ex：用户A打开web时，item1有3个amounts，假设用户B在用户A操作之前添加了3个amounts的item1的订单。因为A没有刷新页面，A看到的还是3个amounts，但是实际上在数据库中的记录已经是0。
    // 所以此处在添加每一个订单前要逐一检查所选items是否有足够的amounts
    let itemsObj = {}
    let remainingAmount = []
    for (let i = 0; i < itemsId.length; i++) {
        let item = null
        try {
            item = await ItemModel.findById(itemsId[i]).exec()
        } catch (err) {
            return res.status(200).json({
                err_code: 2,
                message: `${err.message}`
            })
        }
        // 如果amounts不足，中止本次操作，回传给前端
        if (item.amount < amount[i]) {
            return res.status(200).json({
                err_code: 3,
                message: `${itemsName[i]} has insufficient amounts`
            })
        } else {
            itemsObj[itemsName[i]] = {
                amount: amount[i],
                unitPrice: unitPrice[i],
                price: price[i]
            }
            remainingAmount.push(item.amount - amount[i])
        }
    }

    let customerObj = {
        id,
        name,
        plateNumber,
        brand,
        model
    }

    SaleModel({
        items: itemsObj,
        customer: customerObj,
        totalPrice: totalPrice,
        createdTimeStamp: Date.now()
    }).save(async (err, sales) => {
        if (err) {
            return res.status(200).json({
                err_code: 2,
                message: err.message
            })
        }
        for (let i = 0; i < itemsId.length; i++) {
            try {
                await ItemModel.updateOne({_id: itemsId[i]}, {amount: remainingAmount[i]});
            } catch (err) {
                // SaleModel().deleteOne()
                return res.status(200).json({
                    err_code: 2,
                    message: "Update fail"
                })
            }
        }
        return res.status(200).json({
            err_code: 0,
            sales: sales
        })
    })
});

// router.get("/test", async (req, res) => {
//     let {totalPrice, itemsId, itemsName, amount, unitPrice, remainingAmount, price, id, name, plateNumber, brand, model} = req.query
//     // 120.00 [ '5f9525e01169084cb2567370' ] [ 'product 1' ] [ '1' ] [ '120' ] [ '49' ] [ '120' ] 5f9aeb34b680344055bc4156 3 2145 Audi 100
//     itemsId = itemsId.split(",")
//     itemsName = itemsName.split(",")
//     amount = amount.split(",")
//     remainingAmount = remainingAmount.split(",")
//     unitPrice = unitPrice.split(",")
//     price = price.split(",")
//     let length = itemsId.length
//     if (itemsId.length !== length || itemsName.length !== length || amount.length !== length || unitPrice.length !== length || remainingAmount.length !== length || price.length !== length) {
//         return res.status(200).json({
//             err_code: 1,
//             message: "Invalid data"
//         })
//     }
//
//     let completedAsyncTasks = 0
//
//     // 如果多人同时操作添加sale可能导致前端数据不准确：
//     // ex：用户A打开web时，item1有3个amounts，假设用户B在用户A操作之前添加了3个amounts的item1的订单。因为A没有刷新页面，A看到的还是3个amounts，但是实际上在数据库中的记录已经是0。
//     // 所以此处在添加每一个订单前要逐一检查所选items是否有足够的amounts
//     for (let i = 0; i < itemsId.length; i++) {
//         let item = null
//         try {
//             item = await ItemModel.findById(itemsId[i]).exec()
//         } catch (err) {
//             return res.status(200).json({
//                 err_code: 2,
//                 message: `${err.message}`
//             })
//         }
//         // 如果amounts不足，中止本次操作，回传给前端
//         if (item.amount < amount[i]) {
//             return res.status(200).json({
//                 err_code: 3,
//                 message: `${itemsName[i]} has insufficient amounts`
//             })
//         } else {
//             remainingAmount.push(item.amount - amount[i])
//         }
//     }
//
//     return res.status(200).json({
//         err_code: 0
//     })
//
//     let itemsObj = {}
//     for (let i = 0; i < itemsId.length; i++) {
//         itemsObj[itemsName[i]] = {
//             amount: amount[i],
//             unitPrice: unitPrice[i],
//             price: price[i]
//         }
//     }
//     let customerObj = {
//         id,
//         name,
//         plateNumber,
//         brand,
//         model
//     }
//
//     SaleModel({
//         items: itemsObj,
//         customer: customerObj,
//         totalPrice: totalPrice,
//         createdTimeStamp: Date.now()
//     }).save(async (err, sales) => {
//         if (err) {
//             return res.status(200).json({
//                 err_code: 2,
//                 message: err.message
//             })
//         }
//         for (let i = 0; i < itemsId.length; i++) {
//             try {
//                 await ItemModel.updateOne({_id: itemsId[i]}, {amount: remainingAmount[i]});
//             } catch (err) {
//                 // SaleModel().deleteOne()
//                 return res.status(200).json({
//                     err_code: 2,
//                     message: "Update fail"
//                 })
//             }
//         }
//         return res.status(200).json({
//             err_code: 0,
//             sales: sales
//         })
//     })
// })

module.exports = router;
