const express = require('express')
const mongoose = require('mongoose')
const app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname))

const Message = mongoose.model('Message', {
  name: String,
  message: String,
})

app.get('/messages', async (req, res) => {
  const allMessages = await Message.find({})

  res.send(allMessages)
})

app.post('/messages', async (req, res) => {
  try {
    const { name, message } = req.body

    const dbMessage = new Message({ name, message })
    await dbMessage.save()

    if (await Message.findOne({ message: 'badword' })) {
      await Message.deleteOne({ _id: dbMessage._id })
    } else {
      io.emit('message', dbMessage)
      res.send(dbMessage)
    }
  } catch (error) {
    res.sendStatus(500)
  }
})

app.get('/messages/:user', async (req, res) => {
  const allMessagesOfUser = await Message.find({ name: req.params.user })

  res.send(allMessagesOfUser)
})

io.on('connection', (socket) => {
  console.log('a user connected')
})

mongoose.connect(
  'mongodb+srv://mongo-admin:L5rNn8QlQizxReGV@cluster0.fgmu4.mongodb.net/chat-app?retryWrites=true&w=majority',
  (err) => {
    if (err) console.log('MongoDB connection error', err)
    console.log('MongoDB connected')
  }
)

http.listen(3000, () => {
  console.log('Listening on port 3000')
})
