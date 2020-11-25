const mongoose = require('mongoose')

mongoose.set('useUnifiedTopology', true)
mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://localhost:27017/lubepos', {useNewUrlParser: true})

const UserModel = mongoose.model('user', mongoose.Schema({
	username:{type:String,required:true},
	password:{type:String,required:true}
}))

// car -> customer
const CarModel = mongoose.model('car', mongoose.Schema({
    plateNumber: {type: String, required: true, unique: true},
    year: {type: Number, required: true},
    color: {type: String, required: true},
    owner: {type: mongoose.Schema.ObjectId, ref: 'customer', required: true},
    brand: {type: String, required: true},
    model: {type: String, required: true},
    imageURLs: {type: Array, required: false}
  // from: {type: String, required: true}, // 发送用户的id
  // to: {type: String, required: true}, // 接收用户的id
  // chat_id: {type: String, required: true}, // from和to组成的字符串
  // content: {type: String, required: true}, // 内容
  // read: {type:Boolean, default: false}, // 标识是否已读
  // create_time: {type: Number} // 创建时间
}))

const ItemModel = mongoose.model("item", mongoose.Schema({
    name: {type: String, required: true, unique: true},
    type: {type: String, required: true, enum: ["products", "services"]},
    brand: {type: String, required: false},
    amount: {type: Number, required: false, default: -1},
    price: {type: Number, required: true}
}))

// bill ->> sale
const BillModel = mongoose.model("bill", mongoose.Schema({
    totalPrice: {type: Number, required: true},
    createdTimeStamp: {type: Number, required: true, default: Date.now()}
}))

// sale ->> item
// {
//     id: "",
//     items: {
//         itemId: amount
//     },
//     totalPrice: ""
// }
const SaleModel = mongoose.model("sale", mongoose.Schema({
    // billId: {type: String, required: true},
    items: {type: Object, required: true},
    customer: {type: Object, required: true},
    totalPrice: {type: Number, required: true},
    createdTimeStamp: {type: Number, required: true}
}))

const CustomerModel = mongoose.model("customer", mongoose.Schema({
    name: {type: String, required: true, unique: true},
    phone: {type: String, required: true},
    email: {type: String, required: true}
}))

exports.UserModel = UserModel
exports.CarModel = CarModel
exports.ItemModel = ItemModel
exports.BillModel = BillModel
exports.SaleModel = SaleModel
exports.CustomerModel = CustomerModel