import express, { response } from "express";
import path from "path";
import db from "./createDatabase.js";
import md5 from "md5";
import bodyParser from "body-parser"; 


// Middleware
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("dist"));
let port = 3000;
app.use(express.json({ extended: false }));
app.use("/", express.static("src/frontend"));
app.use("/img", express.static("img"));

//Validation of User: This checks the uniqu username and commpares the password provided
//Then shows the user that logged in
app.post("/login", (req, res) => {
  let sql = " SELECT * from Staff where Username = ?";
  let data = {
    Username: req.body.Username,
    Password: req.body.Password,
  };
  let params = [data.Username];
  db.all(sql, params, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err });
      return;
    }
    if (!rows.length) {
      return res.status(404).json({ message: "user does not exist" });
    }
    console.log(req.body);
    if (md5(req.body.Password) === rows[0].Password) {
      // const { Password, ...rest } = rows[0];
      return res.sendFile(path.resolve("src/frontend/mainPanel.html"));
    } else {
      res.status(400).send("something went wrong!");
    }
    console.log(rows);
  });
});


// This lets users insert data to the Staff Database 
app.post("/registerStaff", (req, res) => {
  let sql =
    "INSERT INTO Staff (FirstName, LastName, Password, Username, StateOfOrigin, Rank) VALUES (?,?,?,?,?,?)";
  let data = {
    FirstName: req.body.finame,
    LastName: req.body.laname,
    Password: req.body.password,
    Username: req.body.Username,
    StateOfOrigin: req.body.Oname,
    Rank: req.body.Rname,
  };
  if (!data.FirstName  || !data.LastName || data.Password.length < 8 || !!isNaN(parseInt(data.Rank))|| parseInt(data.Rank) >= 8 || parseInt(data.Rank) < 0  || !data.StateOfOrigin || !data.Username){
   return  res.status(404).json({message: "Invalid data"})
  }
  let params = [
    data.FirstName,
    data.LastName,
    md5(data.Password),
    data.Username,
    data.StateOfOrigin,
    data.Rank,
  ];
  console.log(params)

  
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.log(req.body);
    res.status(201).json({
      message: "successful",
      data,
      result,
    });
  });
});

// This lets users insert data to the Students Database 
app.post("/registerStudents", (req, res) => {
  let sql =
    "INSERT INTO Students (FirstName, LastName, Class, Age) VALUES (?,?,?,?)";
  let data = {
    FirstName: req.body.fname,
    LastName: req.body.lname,
    Class: req.body.Cname,
    Age: req.body.Agname,
  };
  if(!data.FirstName || !data.LastName  ||!!isNaN(parseInt(data.Class))|| parseInt(data.Class) >= 6|| parseInt(data.Class) < 0 || !data.Age){
    return  res.status(404).json({message: "Invalid data"})
  }
  let params = [data.FirstName, data.LastName, data.Class, data.Age];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(201).json({
      message: "successful",
      data,
      result,
    });
  });
});

//gets all the staff
app.get("/staffUsers", (req, res) => {
  let sql = "select * from Staff";
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

//gets all the students
app.get("/StudentsData", (req, res) => {
  let sql = "select * from Students";
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
