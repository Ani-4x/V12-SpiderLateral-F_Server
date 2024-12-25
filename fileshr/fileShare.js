const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Folder to store uploaded files
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });
  
  const upload = multer({ storage });

  export default upload