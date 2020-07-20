require('dotenv').config()

const express = require('express')
const app = express()
const bcryipt = require('bcrypt')

const jwt = require('jsonwebtoken')

app.use(express.json())

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token

    if (refreshToken == null)
        return res.sendStatus(401)

    if (!refreshTokens.includes(refreshToken))
        return res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return status.sendStatus(403)

        const userId = { name: user.name }

        const accessToken = generateAccessToken(userId)
        res.json({ accessToken: accessToken })
    })
})

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
        console.log("user created")
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

app.delete('/users/logout', async (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function createJwt(res, user) {

    const userId = { name: user.name }

    const accessToken = generateAccessToken(userId)
    const refreshToken = jwt.sign(userId, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
}

function generateAccessToken(userId) {
    return jwt.sign(userId, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}

app.listen(3000)

