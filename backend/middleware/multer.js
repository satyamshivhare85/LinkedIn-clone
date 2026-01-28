import multer from "multer";
import path from "path"; // for absolute path

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "public")); // absolute path
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // unique filename
  },
});

const upload = multer({ storage });
export default upload;
