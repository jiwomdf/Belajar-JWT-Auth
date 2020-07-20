require('dotenv').config()

const express = require('express')
const app = express()
const bcryipt = require('bcrypt')

const jwt = require('jsonwebtoken')

app.use(express.json())

const users = []

const posts = [
    {
        username: "jiwo",
        title: "how to be a good programmer"
    }
]

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
            createJwt(res, user)
        else
            res.send("not allowed")
    }
    catch{
        res.status(500).send()
    }
})

function createJwt(res, user) {

    const userId = { name: user.name }

    const accessToken = jwt.sign(userId, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
}


app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username == req.user.name))
})


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null)
        return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        req.user = user
        next()
    })
}

app.listen(3000)

