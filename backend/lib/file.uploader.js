import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default function uploader({
  upload,
  maxFileSize = 5,
  allowedFileTypes = ["jpg", "jpeg", "png", "gif", "webp"],
} = {}) {
  // validation
  if (!upload) {
    throw new Error("Please provide an upload directory");
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, upload);
    },
    filename: (req, file, cb) => {
      const personName = (req.body.name || "Unknown")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-+|-+$)/g, "")
        .replace(/[^a-zA-Z0-9\-]/g, "");
      const dateName = new Date().toISOString().split("T")[0];
      const fieldName = file.fieldname;
      const idName = uuidv4().split("-").pop();
      const extName = path.extname(file.originalname).toLowerCase();
      const fullName = `${personName}-${dateName}-${fieldName}-${idName}${extName}`;
      cb(null, fullName);
    },
  });
  const fileTypeRegx = new RegExp(`\\.${allowedFileTypes.join("|")}$`, "i");
  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (
        !fileTypeRegx.test(path.extname(file.originalname).toLowerCase()) ||
        !allowedFileTypes.includes(file.mimetype.split("/")[1].toLowerCase())
      ) {
        const fileTypeError =
          allowedFileTypes.length < 2
            ? `Only ${allowedFileTypes[0]} is allowed`
            : `Only ${allowedFileTypes
                .slice(0, -1)
                .join(", ")} and ${allowedFileTypes
                .slice(-1)
                .join("")} are allowed`;
        return cb(new Error(fileTypeError));
      }
      cb(null, true);
    },
  });
}
