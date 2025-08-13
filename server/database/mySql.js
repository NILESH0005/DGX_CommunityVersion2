import sql from "msnodesqlv8";
import dotenv from "dotenv";
dotenv.config();
// const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=ANSHUL\\SQLEXPRESS;Database=GIINDIAdgx_Community;Trusted_Connection=yes;';
const connectionString = process.env.DATABASE_MYSQLURL;

let connection;

const connectToDatabase = (callback) => {
  if (connection) {
    console.log("Connection already established.");
    return callback(null, connection);
  }

  sql.open(connectionString, (err, conn) => {
    if (err) {
      console.error("Error occurred:", err);
      return callback(err);
    }
    connection = conn;
    console.log("Database connected successfully.");
    callback(null, connection);
  });
};

const closeConnection = () => {
  if (connection) {
    connection.close((err) => {
      if (err) {
        console.error("Error closing the connection:", err);
      } else {
        console.log("Database connection closed.");
        connection = null; 
      }
    });
  }
};

process.on("SIGINT", closeConnection);
process.on("SIGTERM", closeConnection);

export { connectToDatabase, closeConnection };
