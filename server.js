const express = require('express')
const app = express()
const bcryipt = require('bcrypt')


app.use(express.json())

const users = []

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {

    try {
        const salt = await bcryipt.genSalt()
        const hashPassword = await bcryipt.hash(req.body.password, salt)

        const user = { name: req.body.name, password: hashPassword }

        users.push(user)
        res.status(201).send()
    }
    catch{
        res.status(500).send()
    }
})

app.post('/users/login', async (req, res) => {

    const user = users.find(user => user.name === req.body.name)
    if (user == null)
        return res.status(400).send('Cannot find user')

    try {
        const isValid = await bcryipt.compare(req.body.password, user.password)
        if (isValid)
            res.send("Success")
        else
            res.send("not allowed")
    }
    catch{
        res.status(500).send()
    }
})

app.listen(3000)

