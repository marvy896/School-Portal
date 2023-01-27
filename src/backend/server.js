import express, { response } from "express";
import path from "path";
import db from "./createDatabase.js";
import md5 from "md5";
import bodyParser from "body-parser";
import multer from "multer";
import {removeColumn} from "../sharedFunctions/utils.js"

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
app.use("/src", express.static("src"));
app.use("/uploads", express.static("uploads"));

//LOGIN SECTION-------------------------------------------------------------------------------
//Validation of User: This checks the uniqu username and commpares the password provided
//Then shows the user that logged in
app.post("/StudentsLogin", (req, res) => {
  let [Year_Enrolled, StudentsId] = req.body.userId.split("/");
  let sql =
    " SELECT * FROM Students where  Year_Enrolled =?  and  StudentsId =?";
  let data = {
    Year_Enrolled: Year_Enrolled,
    StudentsId: StudentsId,
    Password: req.body.Password,
  };
  let params = [data.Year_Enrolled, data.StudentsId];
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

//Staff Section-------------------------------------------------------------
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
//update Staff
app.post("/updateStaff", upload.single("ImgLink"), (req, res) => {
 // let sql = "UPDATE Staff SET  FirstName = ?,LastName = ?,Password = ?,Username = ?,StateOfOrigin = ?,ImgLink = ?, Rank = ? WHERE StaffId = ?"
 let data = {
  FirstName: req.body.FirstName,
  LastName: req.body.LastName,
  Password: req.body.Password,
  Username: req.body.Username,
  StateOfOrigin: req.body.StateOfOrigin,
  ImgLink: (req.file ? req.file.path.replace("\\", "/"): undefined),
  Rank: req.body.Rank,
  StaffId: req.body.StaffId
 }
 let sqlStaff = []
 let params = []
 if(data.FirstName){
  sqlStaff.push("FirstName = ?");
  params.push(data.FirstName)
 }
 if(data.LastName){
  sqlStaff.push("LastName = ?");
  params.push(data.LastName)
 }
 if(data.Password){
  sqlStaff.push("Password = ?");
  params.push(md5(data.Password))
 }
 if(data.Username){
  sqlStaff.push("Username = ?");
  params.push(data.Username)
 }
 if(data.StateOfOrigin){
  sqlStaff.push("StateOfOrigin = ?");
  params.push(data.StateOfOrigin)
 }
 if(data.ImgLink){
  sqlStaff.push("ImgLink = ?");
  params.push(data.ImgLink)
 }
 if(data.Rank){
  sqlStaff.push("Rank = ?");
  params.push(data.Rank)
 }
 params.push(data.StaffId)
 let sql = ` UPDATE Staff SET ${sqlStaff.join(",")} WHERE StaffId = ?`

 if (
  !data.StaffId || sqlStaff.length == 0
) {
  return res.status(404).json({ message: "Invalid data" });
}
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
})
//gets all the staff
app.get("/staffUsers", (req, res) => {
  let sql = "select * from Staff";
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    rows = removeColumn(rows, "Password") 
    res.json({
      message: "success",
      data: rows,
    });
  });
});

//delete for staff
app.post("/deleteStaff", (req, res) => {
  let sql = "DELETE FROM Staff WHERE StaffId =?";
  let data = {
    StudentsId: req.body.StaffId
  }
  let params = [
    data.StaffId
  ];
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

//Students Section-------------------------------------------------------------------------------
// This lets users insert data to the Students Database
app.post("/registerStudents", upload.single("passport"), (req, res) => {
  //to get rndom numbers on registration, Math.floor(Math.random() * 10) + 1
  let random = Math.floor(Math.random() * 200000) + 100000;
  let sql =
    "INSERT INTO Students ( StudentsId, FirstName, LastName, Date_of_Birth, Year_Enrolled, Password, Passport) VALUES (?,?,?,?,?,?,?)";
  let data = {
    StudentsId: random,
    FirstName: req.body.fname,
    LastName: req.body.lname,
    Date_of_Birth: req.body.Agname,
    Year_Enrolled: req.body.YearEnrolled,
    Password: req.body.password,
    Passport: req.file.path.replace("\\", "/"),
  };

  if (
    !data.FirstName ||
    !data.LastName ||
    !data.Date_of_Birth
  ) {
    return res.status(404).json({ message: "Invalid data" });
  }
  let params = [
    data.StudentsId,
    data.FirstName,
    data.LastName,
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
      random,
    });
  });
});

//Update of Students Tables
app.post("/updateStudents", upload.single("Passport"), (req, res) => {
  // let sql = "UPDATE Students SET  FirstName = ?,LastName = ?,Date_of_Birth = ?,Year_Enrolled = ?, Password =?, Passport =? WHERE StudentsId = ?"
  console.log(req.file)
  let data = {
  FirstName: req.body.FirstName,
  LastName: req.body.LastName,
  Date_of_Birth: req.body.Date_of_Birth,
  Year_Enrolled: req.body.Year_Enrolled,
  Password: req.body.PassWord,
  Passport:  (req.file ? req.file.path.replace("\\", "/"): undefined),
  StudentsId: req.body.StudentsId
 }

let sqlUpdate = []
let params = [];
if (data.FirstName){
  sqlUpdate.push("FirstName = ?")
  params.push(data.FirstName)
}
if( data.LastName){
  sqlUpdate.push("LastName = ?")
  params.push(data.LastName)
}
if( data.Date_of_Birth){
  sqlUpdate.push("Date_of_Birth = ?")
  params.push(data.Date_of_Birth)
}
if( data.Year_Enrolled){
  sqlUpdate.push("Year_Enrolled = ?")
  params.push(data.Year_Enrolled)
}
if( data.Password){
  sqlUpdate.push("Password = ?")
  params.push(md5(data.Password))
}
if( data.Passport ){
  sqlUpdate.push("Passport = ?")
  params.push(data.Passport)
}
params.push(data.StudentsId)
let sql3 =`Update Students SET ${sqlUpdate.join(",")} WHERE StudentsId = ?` 

 if (
  !data.StudentsId || sqlUpdate.length == 0
) {
  return res.status(404).json({ message: "Invalid data" });
}
  db.all(sql3, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
    });
  });
})

//gets all the students
app.get("/StudentsData", (req, res) => {
  let sql = "select * from Students";
  let params = [ ];
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
//Get Specific Student
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
//delete for students
app.post("/deleteStudents", (req, res) => {
  let sql = "DELETE FROM Students WHERE StudentsId=?";
  let data = {
    StudentsId: req.body.StudentsId
  }
  let params = [
    data.StudentsId
  ];
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

//Course Section-------------------------------------------------------------
//this inserts Courses table
app.post("/RegisterCourse", (req, res) => {
  let sql = "INSERT INTO Courses (CourseName) VALUES (?)";
  let data = {
    CourseName: req.body.CourseName,
  };
  if (!data.CourseName) {
    res.status(400).send({ message: "not successful" });
    return;
  }
  let params = [data.CourseName];
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
//update Course
app.post("/updateCourse", (req, res) => {
  let sql = "UPDATE Courses SET  CourseName = ? WHERE CourseId = ?"
 let data = {
  CourseName: req.body.CourseName
 }
  let params = [
    data.CourseName
  ];
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
})
app.get("/getCourse", (req, res) => {
  let sql = "Select * From Courses  Order By CourseName";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ message: "error from sever" });
    }
    res.status(201).json({
      message: "successful",
      rows,
    });
  });
});
//delete Courses
app.post("/deleteCourse", (req, res) => {
  let sql = "DELETE FROM Courses WHERE CourseId =?";
  let data = {
    StudentsId: req.body.CourseId
  }
  let params = [
    data.CourseId
  ];
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

//Class Section---------------------------------------------------------
//this inserts class table
app.post("/RegisterClass", (req, res) => {
  let sql = "INSERT INTO Class (ClassName,StaffID, CourseID) VALUES (?,?,?)";
  let data = {
    ClassName: req.body.ClassName,
    StaffID: req.body.StaffID,
    CourseID: req.body.CourseID,
  };
  if (!data.ClassName || !data.StaffID || !data.CourseID) {
    res.status(400).send({ message: "not successful" });
    return;
  }
  let params = [data.ClassName, data.StaffID, data.CourseID];
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

app.get("/getClasses", (req, res) => {
  let sql =
    "Select ClassId,ClassName,CourseName,Staff.FirstName from Class LEFT JOIN Courses ON Class.CourseId = Courses.CourseId LEFT JOIN Staff ON Staff.StaffId =Class.StaffId;";

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ message: "error from sever" });
    }
    res.status(201).json({
      message: "successful",
      rows,
    });
  });
});

//update Class
app.post("/updateClass", (req, res) => {
  let sql = "UPDATE Class SET  ClassName = ?,StaffID = ?,CourseId = ? WHERE ClassId = ?"
 let data = {
  ClassName: req.body.ClassName,
  StaffID: req.body.StaffID,
  CourseId: req.body.CourseId,
  ClassId: req.body.ClassId
 }
  let params = [
    data.ClassName,
    data.StaffID,
    data.CourseId,
    data.ClassId
  ];
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
//delete class
app.post("/deleteClass ", (req, res) => {
  let sql = "DELETE FROM Class  WHERE ClassId =?";
  let data = {
    StudentsId: req.body.ClassId
  }
  let params = [
    data.ClassId
  ];
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

//Class-Students Section------------------------
//this inserts Class_Students table
app.post("/RegisterClass_Students", (req, res) => {
  let sql = "INSERT INTO Class_Students (StudentsId, ClassId) Values (?,?)";
  let data = {
    StudentsId: req.body.StudentsId,
    ClassId: req.body.ClassId,
  };
  if (!data.StudentsId || !data.ClassId) {
    res.status(400).send({ message: "not successful" });
    return;
  }
  let params = [data.StudentsId, data.ClassId];
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
app.get("/getClassStudents", (req, res) => {
  //use sql join to get the students and class name, not *
  let sql = "SELECT Students.StudentsId, Students.FirstName,Class.ClassId,Class.ClassName,Class.StaffId,Courses.CourseName, Class.CourseId,Class_Students.StudentsId from Class_Students LEFT JOIN Students ON Students.StudentsId = Class_Students.StudentsId LEFT JOIN Class ON Class.ClassId = Class_Students.ClassId LEFT JOIN Courses On Courses.CourseId = Class.CourseId; "
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
    });
  });
});
app.get("/getClassStudentsEach", (req, res) => {
  //use sql join to get the students and class name, not *
  let sql = " SELECT Students.StudentsId, Students.FirstName,Class.ClassId,Class.ClassName,Class.StaffId,Courses.CourseName, Class.CourseId,Class_Students.StudentsId from Class_Students LEFT JOIN Students ON Students.StudentsId = Class_Students.StudentsId LEFT JOIN Class ON Class.ClassId = Class_Students.ClassId  LEFT JOIN Courses On Courses.CourseId = Class.CourseId WHERE Class.ClassId =?;"
  let data ={
    ClassId: req.body.ClassId
  }
  let params = [
    data.ClassId
  ]
  db.all(sql,params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Success",
      data: rows,
    });
  });
});
//Forgot PASSWORD
app.post("/updatePassword", (req, res) =>{
  // let [PassWord, PassWord2] = req.body.PassWord
  let sql = "UPDATE Students SET Password = ? Where StudentsId =?"
  let data = {
    StudentsId: req.body.StudentsId,
    PassWord:  req.body.PassWord,
    PassWord2: req.body.PassWord2
  }
  console.log(data)
  if (data.PassWord === data.PassWord2){
   let params =[
     md5(data.PassWord),
     data.StudentsId,
   ]
    
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
 }
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
