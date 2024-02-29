const express = require('express')
const { TodosRepository } = require('./todos/repository')

const app = express()
app.use(express.json())

app.get('/hello', (req, res) => {
    res.status(200).send('hello world')
})

app.get('/hello/:name', (req, res) => {
    const name = req.params.name
    res.status(200).send(`hello ${name}`)
})

// TODOOO APIIII EXPRESSSSSS
const todosRepository = TodosRepository

const NotFound = {
    error: 'Not Found',
    message: 'Resource not found'
}

app.get('/todos', (_req, res) => {
    todosRepository.list()
    .then((todos) => {
        res.status(200).send({todos})
    })
})

app.get('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const todo = await todosRepository.get(id)

    if(!todo) {
        res.status(404).send(NotFound)
        return
        return
    }  
    res.status(200).send(todo)
})

app.post('/todos', async (req, res) => {
    const todo = req.body
    const inserted = await todosRepository.insert(todo)

    res
    .status(201)
    .header('Location', `/todos/${inserted.id}`)
    .send(inserted)
})

app.delete('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const found = await todosRepository.get(id)

    if(!found) {
        res.status(404).send(NotFound)
        return
    }
    await todosRepository.del(id)
    res.status(204).send()
})


app.put('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const todo = { ...res.body, id }

    const found = await todosRepository.get(id)
    if(!found) {
        res.status(404).send(NotFound)
        return
    }
    const updated = await todosRepository.update(todo)
    res.status(204).send(updated)
})

////////////////

app.listen(3000, '0.0.0.0', () => {
    console.log('server started')
})
.once('error', (error) => {
    console.log(error)
    process.exit(1)
})