const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const adminLayout = "../views/layout/admin";
const jwtSecret = process.env.JWT_SECERT;

router.get("/admin", async (req, res) => {
  try {
    const local = {
      title: "Admin",
      description: "Simple Blog",
    };
    res.render("admin/index", { local, layout: adminLayout });
  } catch (e) {
    console.log(e);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "Invalid creds" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid creds" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

const authMiddleWare = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(412).json({ message: "Unauthorized" });
  }
  try {
    const decode = jwt.verify(token, jwtSecret);
    req.userId = decode.userId;
    next();
  } catch (e) {
    console.log(e);
    return res.status(412).json({ message: "Unauthorized" });
  }
};

router.get("/dashboard", authMiddleWare, async (req, res) => {
  try {
    const data = await Post.find();
    var local = {
      title: "BlogSphere",
      desc: "Blogsphere best site",
    };
    res.render("admin/dashboard", { local, data, layout: adminLayout });
  } catch (e) {
    console.log(e);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashpassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashpassword });
      res.status(201).json({ message: "Created User", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "Username already in use" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
    res.render("admin/index", { local, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

router.get("/add-post", authMiddleWare, async (req, res) => {
  try {
    const local = {
      title: "Add Post",
      description: "",
    };

    res.render("admin/add-post", { local, layout: adminLayout });
  } catch (e) {}
});

router.post("/add-post", authMiddleWare, async (req, res) => {
  try {
    const newPost = new Post({ title: req.body.title, body: req.body.body });
    await Post.create(newPost);
    res.redirect("/dashboard");
  } catch (e) {
    console.log(e);
  }
});

router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });

  router.put('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });

  router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });

  router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });

module.exports = router;
