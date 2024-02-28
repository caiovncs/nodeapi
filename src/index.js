const http = require('http')
// servidor http => objeto que recebe requisições http e retorna uma resposta 

const wait = (time) =>
  new Promise(resolve =>
    setTimeout(resolve, time)
  )

const todosDatabase = (() => {
  let idSequence = 1
  const todos = {}

  const insert = async (todo) => {
    await wait(500)
    const id = idSequence++
    const data = { ...todo, id }
    todos[id] = data
    return data
  }

  const list = async () => {
    await wait(100)
    return Object.values(todos)
  }

  const get = async (id) => {
    await wait(100)
    return todos[id]
  }

  const update = async (todo) => {
    await wait(500)
    todos[todo.id] = todo
    return todo
  }

  const del = async (id) => {
    await wait(500)
    delete todos[id]
  }

  return {
    insert,
    list,
    get,
    update,
    del,
  }

})()

const server = http.createServer((request, response) => {
    // nesse callback fica a logica de como lidar com a request

    //GET hello/nome -> hello nome
    if(request.method == 'GET' && /^\/hello\/\w+$/.test(request.url)) {
        const [,, name] = request.url.split('/')
        response.writeHead(200)
        response.end(`Hello ${name}\n`)
        return
    }
        
    //GET /hello -> hello worl
    if(request.method == 'GET' && request.url.startsWith('/hello')) {
        response.writeHead(200)
        response.end("Hello world\n")
        return
    }

    // POST /echo
    if(request.method == 'POST' && request.url.startsWith('/echo')) {
        response.writeHead(200)
        request.pipe(response)
        return
    }

    //****************** API TODOS*/
    //{id, title, text}

    // GET /todos:id
    if (request.method === 'GET' && /^\/todos\/\d+$/.test(request.url)) {
        const [,, idRaw] = request.url.split('/');
        const id = parseInt(idRaw)
        
        todosDatabase.get(id)
        .then((todo) => {
            if(!todo) {
                response.writeHead(404, { 'Content-Type': 'application/json' })
                response.end({ message: 'DEU ERROOOOO'})
            } else {
                response.writeHead(200, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(todo))
            }
        })
    return
    }

    //DELETE /todos:id
    if(request.method === 'DELETE' && /^\/todos\/\d+$/.test(request.url)) {
        const [,, idRaw] = request.url.split('/');
        const id = parseInt(idRaw)

        todosDatabase.del(id)
        .then(() => {
            response.writeHead(204)
            response.end()
        })
        return
    }

    //PUT /todos:id
    if (request.method === 'PUT' && /^\/todos\/\d+$/.test(request.url)) {
        let bodyRaw = ''
        const [,, idRaw] = request.url.split('/')
        const id = parseInt(idRaw)
    
        request.on('data', data => bodyRaw += data)
    
        request.once('end', () => {
          const todo = { ...JSON.parse(bodyRaw), id }
    
          todosDatabase.update(todo)
            .then(updated => {
              response.writeHead(200, JsonHeader)
              response.end(JSON.stringify(updated))
            })
        })
    
        return
    }

    //POST /todos
    if(request.method == 'POST' && request.url.startsWith('/todos')) {
        let bodyRaw = ''

        request.on('data', data => bodyRaw += data)

        request.once('end', () => {
            const todo = JSON.parse(bodyRaw);

            todosDatabase.insert(todo)
            .then(inserted => {
                response.writeHead(201, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify(inserted))
            })
        })
        return
    }

    //GET /todos

    if(request.method == 'GET' && request.url.startsWith('/todos')) {
        todosDatabase
        .list()
        .then(todos => {
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ todos }))
        })
        return
    }

    response.writeHead(404)
    response.end("resource not found")
}) 

server.listen(3000, '0.0.0.0', () => {
    console.log('server started')
})

// porta tcp onnde escuta as requisições