const {UserModel} = require('../db/db_models')
let filter = {password: 0, __v: 0}

exports.validate = async (userId) => {
    let user
    try {
        user = await UserModel.findById(userId, '_id username').exec();
    } catch (e) {
        return {err_code: 1, message: e.message}
    }
    if (user) {
        return {err_code: 0, user}
    } else {
        return {err_code: 2, message: 'User does not existed'}
    }
    // UserModel.findOne({_id: userId}, filter, (err, user) => {
    //     if (err) {
    //         return {err_code: 1, message: err.message}
    //         // return res.status(500).json({
    //         //     err_code: 500,
    //         //     message: err.message
    //         // })
    //     }
    //     if (!user) {
    //         return {err_code: 2, message: 'User does not existed'}
    //         // return res.status(200).json({
    //         //     err_code: 1,
    //         //     message: 'User does not existed'
    //         // })
    //     }
    //     console.log(user)
    //     return {err_code: 0, user}
    //     // return res.status(200).json({
    //     //     err_code: 0,
    //     //     user
    //     // })
    // })
}