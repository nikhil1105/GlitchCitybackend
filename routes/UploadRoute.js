const {Router} = require('express')
const UploadMiddleware = require('../middleware/multermiddleware');
const uploadmodle = require('../models/uploadmodle');

const router = Router()

router.post('/api/save',UploadMiddleware.single('photo'),(req,res)=>{
    const photo = req.file.filename
    console.log(photo);
    uploadmodle.create({
        photo
    }).then((data)=>{
        console.log('upload success');
        console.log(data);
        res.send(data)
    }).catch((e)=>{
        console.log('error',e);
    })
})

router.get('/api/get', async (req,res)=>{
    const allPhotos = await uploadmodle.find().sort({
        createAt:'descending'
    })
    res.send(allPhotos)
})

module.exports=router

