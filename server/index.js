import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import userRoutes from "./routes/user.js";
import userDiscussion from "./routes/Discussion.js";
import userEvent from "./routes/EventAndWorkshop.js";
import userBlog from "./routes/Blog.js";
import userProfile from "./routes/UserProfile.js";
import dropdownRoutes from "./routes/Dropdown.js";
import { connectToDatabase } from "./database/mySql.js";
import homeRoutes from "./routes/Home.js";
import quizRoutes from "./routes/Quiz.js";
import LMS from "./routes/LMS.js";
import lmsEdit from "./routes/LmsEdit.js";
import progressRoute from "./routes/ProgressTrack.js";
import contactUs from "./routes/ContactUs.js";
import sequelize from "./config/database.js";
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use("/gifs", express.static("uploads/gifs"));
app.use("/lms", LMS);
app.use("/user", userRoutes);
app.use("/discussion", userDiscussion);
app.use("/eventandworkshop", userEvent);
app.use("/blog", userBlog);
app.use("/userprofile", userProfile);
app.use("/dropdown", dropdownRoutes);
app.use("/addUser", userRoutes);
app.use("/home", homeRoutes);
app.use("/quiz", quizRoutes);
app.use("/lmsEdit", lmsEdit);
app.use("/progressTrack", progressRoute);
app.use("/contactUs", contactUs);
// app.use(express.static(path.join(__dirname, 'client/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
// });

const learningMaterialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "D:/dgx_deployed/server/uploads/learning-materials");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const uploadLearningMaterial = multer({
  storage: learningMaterialStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPEG, and PNG are allowed."));
    }
  },
});

connectToDatabase((err) => {
  if (err) {
    console.error("Failed to connect to the database. Exiting...");
    process.exit(1);
  } else {
    console.log("Database connection successful.");
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
})();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Add this right after your other middleware configurations
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use('/api', fileRoutes);
