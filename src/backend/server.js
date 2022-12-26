import express, { response } from "express";
import path from "path";
import db from "./createDatabase.js";
import md5 from "md5";
import bodyParser from "body-parser";
import multer from "multer";
import { send } from "process";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// Middleware
const upload = multer({ storage: storage });
// let upload = multer({ dest: 'uploads/' })
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("dist"));
let port = 3000;
app.use(express.json({ extended: false }));
app.use("/", express.static("src/frontend"));
app.use("/img", express.static("img"));
app.use("/uploads", express.static("uploads"));

//Validation of User: This checks the uniqu username and commpares the password provided
//Then shows the user that logged in
app.post("/StudentsLogin", (req, res) => {
  let sql = " SELECT * FROM Students where Year_Enrolled =?";
  let data = {
    Year_Enrolled: req.body.Year_Enrolled,
    Password: req.body.Password,
  };
  let params = [data.Year_Enrolled];
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
      res.status(303);
      res.setHeader(
        "Location",
        `/StudentProfile.html?id=${rows[0].StudentsId}`
      );
      //return res.sendFile(path.resolve("src/frontend/StudentProfile.html"));
      res.json({ StudentsId: rows[0].StudentsId });
    } else {
      res.status(400).send("something went wrong!");
    }
    console.log(rows);
  });
});

app.get("/getSpecStudent", (req, res) => {
  let profile = "SELECT * FROM Students where StudentsId = ?";
  let students = req.url.split("?")[1];
  let stu = new URLSearchParams(students);
  let data = [stu.get("StudentsId")];
  console.log(data);
  db.all(profile, data, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err });
      return;
    }
    if (!rows.length) {
      return res.status(404).json({ message: "user does not exist" });
    }
    delete rows[0].Password;
    res.json(rows[0]);
  });
});

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
app.post("/registerStaff", upload.single("filename"), (req, res) => {
  let sql =
    "INSERT INTO Staff (FirstName, LastName, Password, Username, StateOfOrigin,Rank, ImgLink) VALUES (?,?,?,?,?,?,?)";
  let data = {
    FirstName: req.body.finame,
    LastName: req.body.laname,
    Password: req.body.password,
    Username: req.body.Username,
    StateOfOrigin: req.body.Oname,
    Rank: req.body.Rname,
    ImgLink: req.file.path.replace("\\", "/"),
  };
  console.log(req.file);
  if (
    !data.FirstName ||
    !data.LastName ||
    data.Password.length < 8 ||
    !!isNaN(parseInt(data.Rank)) ||
    parseInt(data.Rank) >= 8 ||
    parseInt(data.Rank) < 0 ||
    !data.StateOfOrigin ||
    !data.Username
  ) {
    return res.status(404).json({ message: "Invalid data" });
  }
  let params = [
    data.FirstName,
    data.LastName,
    md5(data.Password),
    data.Username,
    data.StateOfOrigin,
    data.Rank,
    data.ImgLink,
  ];
  console.log(params);

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
app.post("/registerStudents", upload.single("passport"), (req, res) => {
  let sql =
    "INSERT INTO Students (FirstName, LastName, Class, Date_of_Birth, Year_Enrolled, Password, Passport) VALUES (?,?,?,?,?,?,?)";
  let data = {
    FirstName: req.body.fname,
    LastName: req.body.lname,
    Class: req.body.Cname,
    Date_of_Birth: req.body.Agname,
    Year_Enrolled: req.body.YearEnrolled,
    Password: req.body.password,
    Passport: req.file.path.replace("\\", "/"),
  };
  if (
    !data.FirstName ||
    !data.LastName ||
    !!isNaN(parseInt(data.Class)) ||
    parseInt(data.Class) >= 6 ||
    parseInt(data.Class) < 0 ||
    !data.Date_of_Birth
  ) {
    return res.status(404).json({ message: "Invalid data" });
  }
  let params = [
    data.FirstName,
    data.LastName,
    data.Class,
    data.Date_of_Birth,
    data.Year_Enrolled,
    md5(data.Password),
    data.Passport,
  ];
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
app.post("/deleteStaff", (req, res) => {
  let sql = "DELETE FROM Staff WHERE StaffId=?";
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
    });
  });
});
app.post("/deleteStudents", (req, res) => {
  let sql = "DELETE FROM Students WHERE StudentsId=?";
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
    });
  });
});
app.get("/totalStudents", (req, res) => {
  let sql = "SELECT count(*) as TotalStudents from Students";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows[0],
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
