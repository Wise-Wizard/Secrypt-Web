//jshint esversion:8
require('dotenv').config();
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();

app.set("view engine",'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use("/CSS", express.static(__dirname+"/CSS"));

app.use(session({
    secret: "Encrypting Password.",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.listen(3000,function(){
    console.log("Server Up and Running");
});

app.get("/",function(req, res){
    res.render("home");
});


//Mongoose Server
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/SecryptDB');
}

const userSchema=mongoose.Schema({
    email: String,
    password: String,
    secret: String,
});

userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/register")

    .get((req, res)=>{
        res.render("register");
    })
    .post((req, res)=>{
       User.register({username: req.body.username}, req.body.password, function(err,user){
            if(err){
                console.log(err);
                res.redirect("/");
            }
            else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
       });
    });


app.route("/login")

    .get((req, res)=>{
        res.render("login");
    })
    .post((req, res)=>{
       const user= new User({
        username:req.body.username,
        password: req.body.password,
       });
       req.logIn(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
        });
    });



app.get("/secrets", function(req, res){
    User.find({"secret": {$ne: null}},function(err, foundUsers){
        if(err){
            console.log(err);
        }
        else if(foundUsers){
            res.render("secrets", {userSecrets: foundUsers});
        }
    });
});

app.route("/submit")

    .get((req, res)=>{
        if(req.isAuthenticated()){
            res.render("submit");
        }
        else{
            res.redirect("/");
        }
    })
    .post((req, res)=>{
        const submittedSecret=req.body.secret;
        User.findById(req.user.id, function(err, foundUser){
            if(err){
                console.log(err);
            }
            else{
                foundUser.secret=submittedSecret;
                foundUser.save(function(){
                    res.redirect("/secrets");
                });
            }
        });
    });

app.get("/logout", function(req, res){
    req.logout(function(err){
        console.log(err);
    });
    res.redirect("/");
});

