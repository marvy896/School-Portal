import sqlite3 from "sqlite3";
let sqlite = sqlite3.verbose();
let DBSOURCE = "database.sqlite3Main";


let db = new sqlite.Database(DBSOURCE, (err) => {
  if (err) {
    console.log("Can not connect to database");
    throw err;
  } else {
    console.log("database connected");
    db.run(
      `CREATE TABLE Staff 
        (StaffId INTEGER Primary Key AutoIncrement, 
          FirstName Text, 
          LastName Text, 
          Password Text, 
          Username Text NOT NULL UNIQUE, 
          StateOfOrigin Text, 
          ImgLink Text,
          Rank Integer)`,
      (err) => {
        if (err) {
          console.log(" not Created Staff")
        } else {
          console.log(" Created Staff")
        }
      }
    );
   
    db.run(
      `CREATE TABLE Students 
  (StudentsId INTEGER Primary Key AutoIncrement, 
    FirstName Text, 
    LastName Text, 
    Class Integer, 
    Date_of_Birth DATE,
    Year_Enrolled Integer,
    Password Text,
    Passport Text)`,
      (err) => {
        if (err) {
          console.log("not Created Students")
        } else {
          console.log("Created Students")
        }
      }
    );
db.run(
  `CREATE TABLE Courses 
(CourseId INTEGER Primary Key AutoIncrement, 
CourseName Text)`,
(err) => {
if (err) {
  console.log("not Created Courses", err)
} else {
  console.log("Created CLASS Courses")
}
}
);
db.run(
  `CREATE TABLE Class 
(ClassId INTEGER Primary Key AutoIncrement, 
ClassName Text, 
StaffID INTEGER,
CourseId INTEGER,
FOREIGN KEY(StaffId) REFERENCES Staff(StaffId),
FOREIGN KEY(CourseId) REFERENCES Staff(CourseId)
)`,
(err) => {
if (err) {
  console.log("not Created CLASS", err)
} else {
  console.log("Created CLASS TABLE")
}
}
);
db.run(
  `CREATE TABLE Class_Students  
(StudentsId integer,
  ClassId Integer,
  FOREIGN KEY(StudentsId) REFERENCES Students(StudentsId),
  FOREIGN KEY(ClassId) REFERENCES Class(ClassId),
  PRIMARY KEY(ClassId, StudentsId))`,
(err) => {
if (err) {
  console.log("not Created Class_Students", err)
} else {
  console.log("Created CLASS Class_Students")
}
}
);
  }
});

 //db.close();
export default db;
