const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const userSchema = new mongoose.Schema({
  username:String,
})

const User = mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema({
  user_id:{type:String,required:true},
  description:String,
  duration:Number,
  date:Date
})

app.post('/api/users',async(req,res)=>{
  try{
  const userObj = new User({username:req.body.username});
  const savedUser = await userObj.save();
  console.log(savedUser);
  res.json(savedUser);
  }catch(err){
    console.log(err)
  }})


app.get('/api/users',async(req,res)=>{
  const users = await User.find({}).select("_id username");
  if(!users){
    res.send("no users");
  }else{
    res.json(users);
  }
})

app.post('/api/users/:_id/exercises',async(req,res)=>{
  const id =req.params._id;
  console.log(id);
  const{ description,duration,date} = req.body
  try{
    const user = await User.findById(id);
    if(!user){
      res.send("coundn't find by user");
    }else{
      const exercisesObj = new Exercise({
        user_id:user._id,
        description:description,
        duration:parseInt(duration),
        date:date ? new Date(date) : new Date()
      })
      const savedExercise = await exercisesObj.save();
      res.json({
        _id:user._id,
        username:user.username,
        description:savedExercise.description,
        duration:savedExercise.duration,
        date:new Date(savedExercise.date).toDateString()
      })
    }
  }catch(err){
    console.log(err);
    res.send("there was an error");
  }

})

app.get('/api/users/:_id/logs',async (req,res)=>{
  const id = req.params._id;
  const {from ,to, limit} = req.query;
  const user = await User.findById(id);
  if(!user){
    res.send("coundn't find the user");
  }
    let dateObj = {}
      if(from){
        dateObj["$gte"]=new Date(from);
      }
      if(to){
        dateObj["$lte"]=new Date(to);
      }
      let filter={
        user_id:id
      }

      if(from || to){
        filter.date = dateObj;
      }
   
      const exercises = await Exercise.find(filter).limit(+limit ?? 500);
      const log = exercises.map((exercise)=>{
        return {
          description:exercise.description,
          duration:exercise.duration,
          date:exercise.date.toDateString()
        }
      })

      res.json({
        username:user.username,
        count:exercises.listen,
        _id:user._id,
        log,
      })
})

const Exercise = mongoose.model('Exercise', exerciseSchema);
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
  console.log("conected db");
}).catch((err)=>{
  console.log("err"+err);
})



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
