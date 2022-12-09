import sqlite3 from "sqlite3";
let sqlite = sqlite3.verbose();
//var sqlite3 = require("sqlite3").verbose();
// let db = new sqlite.Database("database.sqlite3");
let DBSOURCE = "database.sqlite3";

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
          Username Text, 
          StateOfOrigin Text, 
          Rank Integer)`,
      (err) => {
        if (err) {
        } else {
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
        } else {
        }
      }
    );
  }
});

// db.close();
export default db;
