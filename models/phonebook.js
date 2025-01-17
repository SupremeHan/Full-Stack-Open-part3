const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to Mongo')
  })
  .catch((error) => {
    console.log('error connecting to Mongo', error.message)
  })

const phoneBookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /^(?:\d{2,3}-\d+)$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`
    },
    minLength: 8,
    required: [true, 'User phone number required']
  }
})

phoneBookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Phonebook', phoneBookSchema)
