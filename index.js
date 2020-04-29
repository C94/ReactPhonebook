require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('type', (req, res) => {
  return JSON.stringify(req.body)
})

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

// GET REQUEST FOR ALL IDs FROM DB
app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

// GET REQUEST FOR CERTAIN ID FROM DB
app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person.toJSON())
  })
})

// GET REQUEST FOR INFO (# of people documents, server time)
app.get('/info', (req, res) => {
  Person.collection.countDocuments().then(count => {
    res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
  })
})

// DELETE Request
app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

// POST Request new person to DB
app.post('/api/persons', (req, res) => {
  const body = req.body
  console.log(body)

  const person = new Person ({
    name: body.name,
    number: body.number,
    date: new Date()
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
})

// PUT Request for updating person in DB 
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  console.log(body)

  const person = {
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: body.number })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

// HANDLE ERROR FOR UNKNOWN ENDPOINT
const unknownEndpoint = ((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
})
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(404).send({ error: 'malformatted id' })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})