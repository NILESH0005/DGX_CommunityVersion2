import multer from "multer";
import path from "path";
import fs from "fs";

// Utility to sanitize folder names
const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9-_]/g, "_"); // prevent unsafe chars

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       // Get module & folder from query (with proper defaults)
//       const moduleName = sanitizeName(req.query.module || "general");
//       const folderName = sanitizeName(req.query.folder || "misc");

//       // Build dynamic path - ensure it uses the provided module/folder
//       const uploadPath = path.join("uploads", moduleName, folderName);

//       console.log('Upload path:', uploadPath);
//       console.log('Query params:', req.query);

//       fs.mkdirSync(uploadPath, { recursive: true });

//       cb(null, uploadPath);
//     } catch (err) {
//       cb(err);
//     }
//   },

//   filename: (req, file, cb) => {
//     const uniqueSuffix =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       const uploadPath = path.join("uploads");
//       fs.mkdirSync(uploadPath, { recursive: true });

//       cb(null, uploadPath);
//     } catch (err) {
//       cb(err);
//     }
//   },

//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Check if query params exist
      const hasModule = req.query.module;
      const hasFolder = req.query.folder;

      let uploadPath = "uploads"; // default path

      if (hasModule && hasFolder) {
        const moduleName = sanitizeName(req.query.module);
        const folderName = sanitizeName(req.query.folder);
        uploadPath = path.join(uploadPath, moduleName, folderName);
      }

      console.log('Upload path:', uploadPath);
      console.log('Query params:', req.query);

      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|mov|ipynb|py/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isIpynb = ext === ".ipynb";

  if (isIpynb || allowed.test(file.mimetype)) return cb(null, true);

  cb(new Error("Invalid file type!"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter,
});
