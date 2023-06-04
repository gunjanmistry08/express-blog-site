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
        res.render('index',{local, posts,currentPage:page,nxtPage:hasNextPage? nextPage : null,currentRoute: '/'})
    } catch (error) {
        console.log(error);
    }
})

router.get('/post/:id', async (req,res) => {
    try {
     const local = {
         title: "NodeJS BLog",
         description: "Simple blog abcd"
     }
     let slug = req.params.id
    const data = await Post.findById({_id: slug})
    res.render('post', {local,data, currentRoute: `/post/${slug}`})
 } catch (error) {
    console.log(error)
    
 }
})

router.post('/search/', async (req,res) => {
    try {
        const local = {
            title: "Search",
            description: "Search"
        }
        let searchTerm = req.body.searchTerm
        const searchClean = searchTerm.replace(/[^a-zA-z0-9]/g,"")

        const data = await Post.find({
            $or: [
                {title: {$regex: new RegExp(searchClean,"i")}},
                {body: {$regex: new RegExp(searchClean,"i")}}
            ]
        })

        res.render("search",{ data,local,  currentRoute: '/'})
        
    } catch (error) {
        console.log(error);
    }
}),

router.get('/about',(req,res) => {
    var local = {
        title: "BlogSphere",
        desc: "Blogsphere best site"
    }
    res.render('about',{local,  currentRoute: '/about'})
})

module.exports = router