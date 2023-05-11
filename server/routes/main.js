const express = require('express')

const router = express.Router()

router.get('',(req,res) => {
    var local = {
        title: "BlogSphere",
        desc: "Blogsphere best site"
    }
    res.render('index',{local})
})

router.get('/about',(req,res) => {
    var local = {
        title: "BlogSphere",
        desc: "Blogsphere best site"
    }
    res.render('about',{local})
})

module.exports = router