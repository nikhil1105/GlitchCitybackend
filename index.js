const express = require("express");
const cors = require("cors");
require('dotenv').config()
const mongoose = require('mongoose')
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: axios } = require("axios");
const User = require('./models/userschema')
const UploadRoute = require('./routes/UploadRoute')

const app = express();
app.use(express.json());
app.use(bodyparser.json())
app.use(cors({ origin: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI).then(()=>{

     
app.post("/authenticate", async (req, res) => {
    const { username } = req.body;
   
  
      try {
          const r = await axios.put('https://api.chatengine.io/users/',
          {
              username:username,secret:username,first_name:username
          },
          {
              headers:{"private-key":"48b4586e-edff-4931-aeae-d2f5d424a8b0"}
          }
          )
          return res.status(r.status).json(r.data)
      } catch (error) {
          return res.status(error.response.status).json(error.response.data)
      }
  
  });

  app.post('/register', async (req,res)=>{
    try {
        const {email,username,password} = req.body
        const hashpass = await bcrypt.hash(password,10)
        const newuser = new User({email,username,password:hashpass})
        await newuser.save()
        res.status(201).json({message:'user created successfully'})

    } catch (error) {
        res.status(500).json({error:"signup error"})
    }
  })

  app.get('/register',async (req,res)=>{
    try {
        const users = await User.find()
        res.status(201).json(users)
    } catch (e) {
        res.status(500).json({error:'users not found'})
    }
  })
  
  app.post('/login',async (req,res) =>{
    try {
        const {username,password} = req.body
        const user = await User.findOne({username})
        if (!user) {
            return res.status(401).json({error:'invalid credentials'})
        }
        const pass = await bcrypt.compare(password,user.password)
        if (!pass) {
            return res.status(401).json({error:'invalid credentials'})
        }
        const token = jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'1hr'})
        res.json({message:'login successful'})
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"error in logging"})
    }
  })

   app.use(UploadRoute)

   

    
app.listen(PORT,()=>{
    console.log('server and DB connected',PORT);
});
})


