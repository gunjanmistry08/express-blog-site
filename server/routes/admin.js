const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser")
const {check, validationResult} = require("express-validator")
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
    var alert = [{path:"",msg:""}]
    res.render("admin/index", { local, layout: adminLayout, alert });
  } catch (e) {
    console.log(e);
  }
});

router.post("/login",[
check("username","The username must be 3+ characters long").exists().notEmpty().trim().isLength({min: 3}).trim(),
check("password", "Password is required").exists().notEmpty().trim()
], async (req, res) => {
  try {
    const local = {
      title: "Admin",
      description: "Simple Blog",
    };

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const alert = errors.array()
      console.log(alert);
      return res.status(422).render("admin/index", { local, alert, layout: adminLayout });
      // res.render("admin/index", { local, alert, layout: adminLayout });
    }
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      var alert = [{path:"login",msg:"Username or Password Incorrect"}]
      return res.status(401).render("admin/index", { local, alert, layout: adminLayout });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      var alert = [{path:"login",msg:"Username or Password Incorrect"}]
      return res.status(401).render("admin/index", { local, alert, layout: adminLayout });
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
    var alert = [{path:"",msg:""}]
    res.render("admin/add-post", { local, layout: adminLayout,alert});
  } catch (e) {}
});

router.post("/add-post", authMiddleWare,[
  check("title","The title must be 5 characters long").exists().notEmpty().trim().isLength({min: 5}),
  check("body", "The body must be 10 characters long").exists().notEmpty().trim().isLength({min: 10})
  ], async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const alert = errors.array()
      console.log(alert);
      const local = {
        title: "Add Post",
        description: "",
      };
      return res.status(422).render("admin/add-post", { local, alert, layout: adminLayout });
      // res.render("admin/index", { local, alert, layout: adminLayout });
    }
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
      var alert =[{path:"",msg:""}]
      res.render('admin/edit-post', {
        locals,
        data,
        alert,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });

  router.put('/edit-post/:id', authMiddleWare,[
    check("title","The title must be 5 characters long").exists().notEmpty().trim().isLength({min: 5}),
    check("body", "The body must be 10 characters long").exists().notEmpty().trim().isLength({min: 10})
    ], async (req, res) => {
    try {

      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
      var alert =[{path:"",msg:""}]
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        alert = errors.array()
        console.log(alert);
      const data = new Post()
        return res.status(422).render("admin/edit-post", { locals, data, alert, layout: adminLayout });
      }
  
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
