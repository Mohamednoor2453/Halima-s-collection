const express = require('express')
const path = require('path')


const router = express.Router()
router.use(express.static('public'))

//sending home page to user
router.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../public/home.html'));
})

//sending admin page to user
router.get('/admin', (req, res)=>{
    res.sendFile(path.join(__dirname, '../public/admin.html'))
})
module.exports = router