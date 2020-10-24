let express = require('express');
let router = express.Router();
// let formidable = require("formidable");
let multer = require('multer');
let fs = require("fs");
const {CustomerModel, CarModel} = require('../db/db_models')

const recordCarInfo = (res, req, arr) => {
    const {plateNumber, year, color, ownerId, brand, model} = req.body
    CustomerModel.findOne({_id: ownerId}, (err, customer) => {
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
            owner: ownerId,
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

const readCarsInfo = (res, condition, intPageCount) => {
    CarModel.countDocuments({}, (err, count) => {
        if (err) {
            return res.status(200).json({
                err_code: 4,
                message: `Read items count fail ${err.message}`
            })
        }
        CarModel.find(condition, {_id: 0, __v: 0}, (err, cars) => {
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
        }).populate({path: 'owner', select: {name: 1}}).skip((intPageCount - 1) * 20).limit(20);
    })
}

router.use(multer({dest: './dist'}).array('carImages'));
/* GET users listing. */
router.post('/insert', async function (req, res) {

    let {files} = req
    console.log(files);
    if (files.length !== 0) {
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
                break
            }
            // console.log(files[i])
            let fileName = `${files[i].filename}.${files[i].originalname.split(".").pop()}`
            let des_path = `./public/images/${fileName}`
            fs.rename(`./dist/${files[i].filename}`, des_path, () => {
                imageURLS.push(fileName)
                if (imageURLS.length === files.length) {
                    recordCarInfo(res, req, imageURLS)
                }
            });
        }
    } else {
        recordCarInfo(res, req, [])
    }

    // console.log(imageURLS)
    // return res.status(200).json({
    //     err_code: 0,
    //     data: {
    //         message: ""
    //     }
    // })

    // save record to db

    // form.parse(req)
    //     .on('field', (field, value) => {
    //         // console.log('Field', name, field)
    //         console.log(field, value);
    //     })
    //     .on('fileBegin', (name, file) => {
    //         if (fileTypes.indexOf(file.type) === -1) {
    //             res.end()
    //             return
    //         }
    //         console.log(file.type)
    //     })
    //     .on('file', (name, file) => {
    //         // console.log('Uploaded file', name, file)
    //     })
    //     .on('progress', function (bytesReceived, bytesExpected) {
    //         // self.emit('progess', bytesReceived, bytesExpected)
    //         let percent = (bytesReceived / bytesExpected * 100) | 0;
    //         process.stdout.write('Uploading: %' + percent + '\r');
    //     })
    //     .on('aborted', () => {
    //         console.error('Request aborted by the user')
    //     })
    //     .on('error', (err) => {
    //         console.error('Error', err)
    //         throw err
    //     })
    // form.once('end', () => {
    //     return res.status(200).json({
    //         err_code: 0,
    //         data: {}
    //     })
    // })

    // form.on('field', function (field, value) {
    //     console.log(field, value);
    //     return;
    //     fields[field] = value;
    // })
    //     .on('fileBegin', function (name, file) {
    //         var fileType = file.type.split('/').pop();
    //         //rename the incoming file
    //         file.path = form.uploadDir + "/" + req.user.id + _ + toolbox.uniqid() + '.' + fileType;
    //     })
    //     .on('file', function (field, file) {
    //         //on file received
    //         console.log(field, file);
    //         files.push([field, file]);
    //     })
    //     .on('progress', function (bytesReceived, bytesExpected) {
    //         //self.emit('progess', bytesReceived, bytesExpected)
    //         var percent = (bytesReceived / bytesExpected * 100) | 0;
    //         process.stdout.write('Uploading: %' + percent + '\r');
    //     })
    //     .on('end', function () {
    //         console.log('-> upload done');
    //         console.log(files);
    //         console.log(fields);
    //         returnJson.file_data = files;
    //         returnJson.fields_data = fields;
    //         res.json(returnJson);
    //     });

    // const form = formidable({multiples: true, uploadDir: "public/images/", keepExtensions: true});
    // form.parse(req, (err, fields, files) => {
    //     console.log('fields:', fields);
    //     console.log('files:', files);
    //     if (files) {
    //         for (let i = 0; i < files["files"].length; i++) {
    //             imageURLS.push(files["files"][i].path)
    //         }
    //     }
    //     console.log(imageURLS)
    //     return res.status(200).json({
    //         err_code: 0,
    //         data: {}
    //     })
    // });

    // let form = new formidable.IncomingForm();
    // form.parse(req, function(error, fields, files) {
    //     console.log("parsing done");
    //     console.log(files);
    //     console.log(files.files.path);
    //     fs.writeFileSync(`public/${files.name}`, fs.readFileSync(files.files.path));
    // });


    // var form = new formidable.IncomingForm();
    // //设置编辑
    // form.encoding = 'utf-8';
    // //设置文件存储路径
    // form.uploadDir = "./public/images/";
    // //保留后缀
    // form.keepExtensions = true;
    // //设置单文件大小限制
    // form.maxFieldsSize = 2 * 1024 * 1024;
    // //form.maxFields = 1000;  设置所以文件的大小总和
    //
    // form.parse(req, function(err, fields, files) {
    //   //console.log(fields);
    //   console.log(files.thumbnail.path);
    //   console.log('文件名:'+files.thumbnail.name);
    //         var t = (new Date()).getTime();
    //         //生成随机数
    //         var ran = parseInt(Math.random() * 8999 +10000);
    //         //拿到扩展名
    //         var extname = path.extname(files.thumbnail.name);
    //
    //   //path.normalize('./path//upload/data/../file/./123.jpg'); 规范格式文件名
    //   var oldpath =   path.normalize(files.thumbnail.path);
    //
    //   //新的路径
    //   let newfilename=t+ran+extname;
    //   var newpath =  './public/images/'+newfilename;
    //   console.warn('oldpath:'+oldpath+' newpath:'+newpath);
    //   fs.rename(oldpath,newpath,function(err){
    //     if(err){
    //           console.error("改名失败"+err);
    //     }
    //     res.render('index', { title: '文件上传成功:', imginfo: newfilename });
    //   });
    //
    //
    //   //res.end(util.inspect({fields: fields, files: files}));
    // });

    // return res.status(200).json({
    //     err_code: 0,
    //     data: {}
    // })
});

router.get('/query', (req, res) => {
    const {color, brand, model, searchField, searchText, currentPageCount} = req.query
    let intPageCount
    try {
        if (!currentPageCount) {
            intPageCount = 1
        } else {
            intPageCount = parseInt(currentPageCount)
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
            readCarsInfo(res, condition, intPageCount)
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
                    console.log(condition)
                    readCarsInfo(res, condition, intPageCount)
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
        readCarsInfo(res, condition, intPageCount)
    }
    // CarModel.find(condition, (err, car) => {
    //     if (err) {
    //         return res.status(200).json({
    //             err_code: 4,
    //             data: {
    //                 message: `Read fail ${err.message}`
    //             }
    //         })
    //     }
    //     return res.status(200).json({
    //         err_code: 0,
    //         data: {
    //             car: car
    //         }
    //     })
    // }).skip((intPageCount - 1) * 20).limit(20);
});

module.exports = router;
