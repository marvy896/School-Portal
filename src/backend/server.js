import express, { response } from "express";
// import sqlite from 'sqlite3';
import db from './createDatabase.js'
// const sqlite3 = sqlite.verbose();

import bodyParser from "body-parser" // Middleware
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('dist'))
const port = 3000
app.use(express.json({extended: false}));
app.use("/", express.static('src/frontend'));
app.use("/img",express.static('img'));


app.post('/login', (req, res) => {
    let Username = req.body.Username;
    let password = req.body.password;
    if (Username == "marvel" && password == 1234){
     res.sendStatus(200);
    } else{
     res.sendStatus(400);
    }
    console.log(req.body);
   });

app.post("/registerStaff", (req, res) => {
    let sql = 'INSERT INTO Staff (FirstName, LastName, Password, Username, StateOfOrigin, Rank) VALUES (?,?,?,?,?,?)'
    let data = {
        FirstName: req.body.finame,
        LastName: req.body.laname,
        Password: req.body.password,
        Username: req.body.Username,
        StateOfOrigin: req.body.Oname,
        Rank: req.body.Rname
    }
    let params = [data.FirstName, data.LastName, data.Password, data.Username, data.StateOfOrigin, data.Rank]
    db.run(sql, params, function (err, result){
        if(err){
            res.status(400).json({error: err.message});
            return;
        }
        console.log(req.body)
        res.status(201).json({
            message: 'successful',
            data,
            result,
        })
    })
// res.sendStatus(201)
})
app.post("/registerStudents", (req, res) => {
    let sql = 'INSERT INTO Students (FirstName, LastName, Class, Age) VALUES (?,?,?,?)'
    let data = {
        FirstName: req.body.fname,
        LastName: req.body.lname,
        Class: req.body.Cname,
        Age: req.body.Agname
    }
    let params = [data.FirstName, data.LastName, data.Class, data.Age]
    db.run(sql, params, function(err, result){
        if(err){
            res.status(400).json({error: err.message});
            return;
        }
        res.status(201).json({
            message: 'successful',
            data,
            result,
        })
    })
})

app.get("/staffUsers", (req, res) => {
    let sql = "select * from Staff"
    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/StudentsData", (req, res) => {
    let sql = "select * from Students"
    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

   app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })