const express=require('express');
const mongoose=require('mongoose');
const userModel=require('./userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app=express();
const PORT=3000;

const mongoUrl='mongodb+srv://nodejs_assignment:nodejs_assignment@cluster0.fjz6s9v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(mongoUrl).then(()=>console.log("DB connected"))
.catch((e)=>console.log(e));

app.use(express.json());

function Auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.post('/user',async(req,res)=>{
    try{
    const { name, email, phone, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await userModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    
    res.status(200).json({
        status:'success',message:"Created successfully",userData
    })
    }catch(e){
        console.log(e);
        res.status(500).json({
        status:'failure',message:e})
    }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


app.get('/user',Auth,async(req,res)=>{
    try{
        console.log("get method is running")
        const usersData=await userModel.find();
        res.status(200).json({
        status:'success',message:"Got details successfully",usersData
    })
    }catch(e){
        console.log(e);
        res.status(500).json({
        status:'failure',message:e})
    }

})

app.get('/user/:userid',Auth,async(req,res)=>{
    try{
        console.log("getbyid running")
        const userid=req.params.userid;
        
        const userDataById=await userModel.findById(userid);
        res.status(200).json({
        status:'success',message:"Got details successfully",userDataById
    })
    }catch(e){
        console.log(e);
        res.status(500).json({
        status:'failure',message:e})
    }
    
})

app.put('/user/:id',Auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated', updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});


app.delete('/user/:userid',Auth,async(req,res)=>{
    let {userid}=req.params;
    try{
        console.log("deletebyid running")
        
        
        let userDeletedById=await userModel.findByIdAndDelete(userid);
        res.status(200).json({
        status:'success',message:"Deleted successfully"
    })
    }catch(e){
        console.log(e);
        res.status(500).json({
        status:'failure',message:e})
    }
})

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))