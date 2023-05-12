const express = require('express')
const Post = require('../models/Post')

const router = express.Router()

router.get('',async (req,res) => {
    var local = {
        title: "BlogSphere",
        desc: "Blogsphere best site"
    }
    
    try {
        let perPage = 10
        let page = req.query.page || 1
        const posts = await Post.aggregate([{$sort:{createdAt: -1}}]).skip(perPage*page -perPage).limit(perPage).exec()
        const postCount = await Post.count()
        const nextPage = parseInt(page)+1
        const hasNextPage = nextPage <= Math.ceil(postCount/perPage)
        res.render('index',{local, posts,currentPage:page,nxtPage:hasNextPage? nextPage : null})
    } catch (error) {
        console.log(error);
    }
})

router.get('/about',(req,res) => {
    var local = {
        title: "BlogSphere",
        desc: "Blogsphere best site"
    }
    res.render('about',{local})
})

module.exports = router