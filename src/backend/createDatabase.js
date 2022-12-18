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
    Age Integer)`,
      (err) => {
        if (err) {
          console.log("not Created Students")
        } else {
          console.log("Created Students")
        }
      }
    );
    console.log("success!")
  }

});

 //db.close();
export default db;
