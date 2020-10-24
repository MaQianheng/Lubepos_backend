let express = require('express');
const md5 = require('blueimp-md5')

let router = express.Router();
let filter = {password: 0, __v:0};
const {UserModel} = require('../db/db_models');

// router.use(bodyParser.urlencoded({extended : false}))
router.post('/register', function(req, res, next) {
	let {username, password} = req.body
	// console.log()
	UserModel.findOne({username:username}, filter, (err,user) => {
		if (err) {
			return res.status(500).json({
				err_code:500,
				message:err.message
			})
		}
		if (user) {
			return res.status(200).json({
				err_code:1,
				message:'Username already existed'
			})
		}
		UserModel(
			{
				username: username,
				password: md5(password)
			}
		).save((err,user) => {
			if (err) {
				return res.status(500).json({
					err_code:500,
					message:err.message
				})
			}
			// res.cookie('userid',user._id,{maxAge:1000*60*60*24})
			return res.status(200).json({
				err_code:0,
				data:{_id:user._id, username:user.username}
			})
		})
	})
});

router.post('/login', function(req, res, next) {
	const {username, password} = req.body
	// filter:过滤数据
	UserModel.findOne({username: username, password: md5(password)}, filter, (err, user) => {
		if (err) {
			return res.status(500).json({
				err_code:500,
				message:err.message
			})
		}
		if (!user) {
			return res.status(200).json({
				err_code:1,
				message:'Username or password is wrong'
			})
		}
		// res.cookie('userid',user._id,{maxAge:1000*60*60*24})
		return res.status(200).json({
			err_code:0,
			data:user
		})
	})
});

module.exports = router;
