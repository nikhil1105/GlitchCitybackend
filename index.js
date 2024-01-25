const express = require("express");
const cors = require("cors");
require('dotenv').config()
const mongoose = require('mongoose')
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: axios } = require("axios");
const User = require('./models/userschema')
const Admin = require('./models/adminmodel')
const UploadRoute = require('./routes/UploadRoute')

const app = express();
app.use(express.json());
app.use(bodyparser.json())
app.use(cors({ origin: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI).then(() => {


    app.post("/authenticate", async (req, res) => {
        const { username } = req.body;


        try {
            const r = await axios.put('https://api.chatengine.io/users/',
                {
                    username: username, secret: username, first_name: username
                },
                {
                    headers: { "private-key": "48b4586e-edff-4931-aeae-d2f5d424a8b0" }
                }
            )
            return res.status(r.status).json(r.data)
        } catch (error) {
            return res.status(error.response.status).json(error.response.data)
        }

    });

    app.post('/register', async (req, res) => {
        try {
            const { email, username, password } = req.body
            const hashpass = await bcrypt.hash(password, 10)
            const newuser = new User({ email, username, password: hashpass })
            await newuser.save()
            res.status(201).json({ message: 'user created successfully' })

        } catch (error) {
            res.status(500).json({ error: "signup error" })
        }
    })

    app.post('/adminreg', async (req, res) => {
        try {
            const { clgpass, username, password } = req.body
            const hashpass = await bcrypt.hash(password, 10)
            console.log(process.env.CLG_PASS == clgpass);
            if (process.env.CLG_PASS == clgpass) {

                const newuser = new Admin({ username, password: hashpass })
                await newuser.save()
                res.status(201).json({ message: 'user created successfully' })
            }
            else {
                res.status(500).json({ error: "Wrong Password" })
            }
        } catch (error) {
            res.status(500).json({ error: "signup error" })
        }
    })

    app.get('/adminreg', async (req, res) => {
        try {
            const users = await Admin.find()
            res.status(201).json(users)
        } catch (e) {
            res.status(500).json({ error: 'users not found' })
            console.log(e);
        }
    })


    app.get('/register', async (req, res) => {
        try {
            const users = await User.find()
            res.status(201).json(users)
        } catch (e) {
            res.status(500).json({ error: 'users not found' })
            console.log(e);
        }
    })


    app.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ username })
            console.log(user);
            if (!user) {
                return res.status(401).json({ error: 'Invalid Username' })
            }
            const pass = bcrypt.compare(password, user.password)
            if (!pass) {
                return res.status(401).json({ error: 'Invalid Password' })
            }
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1hr' })
            res.json({ message: 'login successful', token })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Something Went Wrong" })

        }
    })


    app.post('/adminlogin', async (req, res) => {
        try {
            const { username, password } = req.body
            const user = await Admin.findOne({ username })
            console.log(user);
            if (!user) {
                return res.status(401).json({ error: 'Invalid Username' })
            }
            const pass = bcrypt.compare(password, user.password)
            if (!pass) {
                return res.status(401).json({ error: 'Invalid Password' })
            }
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1hr' })
            res.json({ message: 'login successful', token })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Something Went Wrong" })

        }
    })


    const UserPermission = mongoose.model('UserPermission', {
        userId: String,
        status: { type: String, default: 'pending' }
    });

    app.post('/request-permission', async (req, res) => {
        const { userId } = req.body;
        console.log(userId);
        try {
            var user = await UserPermission.findOne({ userId, status: 'pending' })

            if (user) {
                return res.status(201).json({ msg: 'You already have a pending request.' });
            }

            const newPermissionRequest = new UserPermission({ userId });
            await newPermissionRequest.save()
            res.status(201).json({ message: 'user request successfully' })

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Something Went Wrong request " })

        }

    });

    app.get('/request-permission', async (req, res) => {
        try {
            const users = await UserPermission.find({status:'pending'})
            res.status(201).json(users)
        } catch (e) {
            res.status(500).json({ error: 'users not found' })
            console.log(e);
        }
    })
    app.put('/grant-permission/:userId', async (req, res) => {
        const { userId } = req.params;
        console.log(userId);

        try {
            const user = await UserPermission.findOneAndUpdate({ userId, status: 'pending' }, { $set: { status: 'approved' } })
        if (user) {
            res.status(201).json({ message: 'user request successfully' })

        }
        } catch (error) {
            res.status(500).json({ error: 'users not found' })

        }
        

    });

    app.use(UploadRoute)




    app.listen(PORT, () => {
        console.log('server and DB connected', PORT);
    });
})


