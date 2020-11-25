let express = require('express');
let router = express.Router();
// let formidable = require("formidable");
let multer = require('multer');
let fs = require("fs");
const {CustomerModel, CarModel} = require('../db/db_models')

const recordCarInfo = (res, req, arr) => {
    const {plateNumber, year, color, owner, brand, model} = req.body
    console.log(plateNumber, year, color, owner, brand, model)
    CustomerModel.findOne({_id: owner}, (err, customer) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: `Read fail ${err.message}`
            })
        }
        if (!customer) {
            return res.status(200).json({
                err_code: 2,
                message: 'The owner does not existed'
            })
        }

        CarModel({
            plateNumber: plateNumber,
            year: year,
            color: color,
            owner: owner,
            brand: brand,
            model: model,
            imageURLs: arr
        }).save((err, car) => {
            if (err) {
                return res.status(200).json({
                    err_code: 3,
                    message: `Save fail ${err.message}`
                })
            }
            return res.status(200).json({
                err_code: 0,
                car: car
            })
        })
    })
}

const updateCarInfo = (res, req, arr) => {
    // brand: {value: "Avanti", label: "Avanti"}
    // color: {value: "BLACK", label: "BLACK"}
    // imageURLs: (2) ["4414ba7cee277ccd34c5899eb6b37e7a.jpeg", "e313903b8cb3c17cb07fc4342a8b681f.jpeg"]
    // model: {value: "Coupe", label: "Coupe"}
    // newImages: [File]
    // owner: {value: "5f9aeb34b680344055bc4156", label: "3"}
    // plateNumber: "214522"
    // year: "2015"
    // _id: "5f9b7bb8bdf6ca4b7d11a3fe"
    let {_id, plateNumber, year, color, owner, brand, model, imageURLs} = req.body
    CustomerModel.findOne({_id: owner}, (err, customer) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: `Read fail ${err.message}`
            })
        }
        if (!customer) {
            return res.status(200).json({
                err_code: 2,
                message: 'The owner does not existed'
            })
        }
        if (!imageURLs) {
            imageURLs = []
        } else {
            imageURLs = imageURLs.split(",")
        }
        imageURLs = imageURLs.concat(arr)

        CarModel.findByIdAndUpdate({_id: _id}, {
            plateNumber,
            year,
            color,
            owner,
            brand,
            model,
            imageURLs
        }, {}, (err, car) => {
            if (err) {
                return res.status(200).json({
                    err_code: 0,
                    message: err.message
                })
            }
            return res.status(200).json({
                err_code: 0,
                car
            })
        });
    })
}

const handleImages = (req, res, files, nextAction) => {
    let imageURLS = []
    let fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (files.length > 5) {
        return res.status(200).json({
            err_code: 1,
            data: {
                message: "Maximum file size is 5"
            }
        })
    }

    // handle files
    for (let i = 0; i < files.length; i++) {
        if (fileTypes.indexOf(files[i].mimetype) === -1) {
            return res.status(200).json({
                err_code: 2,
                data: {
                    message: "File type not accepted"
                }
            })
        }
        // console.log(files[i])
        let fileName = `${files[i].filename}.${files[i].originalname.split(".").pop()}`
        let des_path = `./public/images/${fileName}`
        fs.rename(`./dist/${files[i].filename}`, des_path, () => {
            imageURLS.push(fileName)
            if (imageURLS.length === files.length) {
                switch (nextAction) {
                    case "INSERT":
                        recordCarInfo(res, req, imageURLS)
                        break
                    case "UPDATE":
                        updateCarInfo(res, req, imageURLS)
                        break
                    default:
                        break
                }
            }
        });
    }
}

const readCarInfo = (res, condition, intCurrentPageCount) => {
    CarModel.countDocuments({}, (err, count) => {
        if (err) {
            return res.status(200).json({
                err_code: 4,
                message: `Read items count fail ${err.message}`
            })
        }
        CarModel.find(condition, {__v: 0}, (err, cars) => {
            if (err) {
                return res.status(200).json({
                    err_code: 4,
                    message: `Read cars info fail ${err.message}`
                })
            }
            return res.status(200).json({
                err_code: 0,
                count: count,
                cars: cars
            })
        }).populate({
            path: 'owner',
            select: {name: 1}
        }).skip(((intCurrentPageCount === 0 ? 1 : intCurrentPageCount) - 1) * 20).limit(intCurrentPageCount === 0 ? 0 : 20);
    })
}

router.use(multer({dest: './dist'}).array('carImages'));
/* GET users listing. */
router.post('/insert', async function (req, res) {
    let {files} = req
    if (files.length !== 0) {
        // let imageURLS = []
        // let fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        //
        // if (files.length > 5) {
        //     return res.status(200).json({
        //         err_code: 1,
        //         data: {
        //             message: "Maximum file size is 5"
        //         }
        //     })
        // }
        //
        // // handle files
        // for (let i = 0; i < files.length; i++) {
        //     if (fileTypes.indexOf(files[i].mimetype) === -1) {
        //         return res.status(200).json({
        //             err_code: 2,
        //             data: {
        //                 message: "File type not accepted"
        //             }
        //         })
        //     }
        //     // console.log(files[i])
        //     let fileName = `${files[i].filename}.${files[i].originalname.split(".").pop()}`
        //     let des_path = `./public/images/${fileName}`
        //     fs.rename(`./dist/${files[i].filename}`, des_path, () => {
        //         imageURLS.push(fileName)
        //         if (imageURLS.length === files.length) {
        //             recordCarInfo(res, req, imageURLS)
        //         }
        //     });
        // }
        handleImages(req, res, files, "INSERT")
    } else {
        recordCarInfo(res, req, [])
    }
});

router.post('/update', async (req, res) => {
    let {files} = req
    if (files.length !== 0) {
        handleImages(req, res, files, "UPDATE")
    } else {
        updateCarInfo(res, req, [])
    }
})

router.get('/delete', (req, res) => {
    let {_id} = req.query
    _id = _id.split(",")
    CarModel.deleteMany({_id: {$in: _id}}, (err, cars) => {
        if (err) {
            return res.status(200).json({
                err_code: 1,
                message: err.message
            })
        }
        return res.status(200).json({
            err_code: 0,
            cars
        })
    });
})

router.get('/query', (req, res) => {
    const {color, brand, model, searchField, searchText, currentPageCount} = req.query
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
    let condition = {}
    if (color && color !== "All") {
        condition["color"] = color
    }
    if (brand && brand !== "All") {
        condition["brand"] = brand
    }
    if (model && model !== "All") {
        condition["model"] = model
    }
    if (searchText) {
        if (searchField === "Plate Number") {
            condition["plateNumber"] = searchText
            readCarInfo(res, condition, intCurrentPageCount)
        } else {
            CustomerModel.findOne({name: searchText}, {name: 0, phone: 0, email: 0, __v: 0}, (err, customer) => {
                if (err) {
                    return res.status(200).json({
                        err_code: 4,
                        message: `Read fail ${err.message}`
                    })
                }
                if (customer) {
                    condition["owner"] = customer._id
                    readCarInfo(res, condition, intCurrentPageCount)
                } else {
                    return res.status(200).json({
                        err_code: 4,
                        message: `Owner does not existed`
                    })
                }
            })
        }
    } else {
        console.log(condition)
        readCarInfo(res, condition, intCurrentPageCount)
    }
});

module.exports = router;
