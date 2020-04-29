const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('type', (req, res) => {
  return JSON.stringify(req.body)
})

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

// HARDCODED JSON PERSONS
let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

// RANDOM ID FOR NEW PERSON
const generateId = () => {
  const newId = Math.floor(Math.random() * 1000000)
  return newId
}

// GET REQUEST INDEX
app.get('/', (req, res) => {
  res.send('<h1>Phonebook</h1><a href="api/persons">api</a>')
})

// GET REQUEST FOR ALL IDs
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

// GET REQUEST FOR CERTAIN ID
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  person ? res.json(person) : res.status(400).end()
})

// GET REQUEST FOR INFO (# of people, time)
app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

// DELETE Request
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

// POST Request new person
app.post('/api/persons', (req, res) => {
  const body = req.body

  const name = String(body.name)
  const inList = persons.find(person => person.name === name)

  let errorMsg = []
  if (!body.name) errorMsg.push('Name must not be missing')
  if (!body.number) errorMsg.push('Number must not be missing')
  if (inList) errorMsg.push('Name must not already be in list')

  if (!body.name || !body.number || inList) {
    return res.status(404).json({
      error: errorMsg
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person)

  res.json(person)
})

const unknownEndpoint = ((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})