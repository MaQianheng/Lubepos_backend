const mongoose = require('mongoose')
// const md5 = require('blueimp-md5')
const Schema = mongoose.Schema

mongoose.set('useUnifiedTopology', true)
mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://localhost:27017/lubepos', {useNewUrlParser: true})
const conn = mongoose.connection

conn.on('connected',() => {
	console.log('database is connected')
})