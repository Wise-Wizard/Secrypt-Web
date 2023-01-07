//jshint esversion:8
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");

const app=express();

app.set("view engine",'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use("/CSS", express.static(__dirname+"/CSS"));

app.listen(3000,function(){
    console.log("Server Up and Running");
});

app.get("/",function(req, res){
    res.render("home");
});

app.route("/register")

    .get((req, res)=>{
        res.render("register");
    })
    .post((req, res)=>{
        const newUser=User({
            email: req.body.username,
            password: req.body.password,
        });
        newUser.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                res.render("secrets");
            }
        });
    });


app.route("/login")

    .get((req, res)=>{
        res.render("login");
    })
    .post((req, res)=>{
        User.findOne(
        {
            email:req.body.username,
            password:req.body.password,
        },function(err,foundUser){
            if(err){
                console.log(err);
            }
            else{
            if(foundUser){
                console.log(foundUser);
                res.render("secrets");
            }
            else{
                console.log("No User");
            }
        }
        });
    });



//Mongoose Server
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/SecryptDB');
}

const userSchema=mongoose.Schema({
    email: String,
    password: String,
});

const User=mongoose.model("User",userSchema);