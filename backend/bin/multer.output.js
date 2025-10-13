import { express } from "express";
import multer from "multer";
const upload = multer({ dest: "public/upload" });
const app = express();
app.post(
  "/api/singers",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  (req, res) => {
    console.log(req.files);
  }
);

{
  avatar: [
    {
      fieldname: "avatar",
      originalname: "IMG20220817102240.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      destination:
        "D:\\practices\\MERN_STACK\\data-generator\\generator-4\\backend\\public\\upload\\images",
      filename: "Unknown-2025-10-10-a2a7fe85f709.jpg",
      path: "D:\\practices\\MERN_STACK\\data-generator\\generator-4\\backend\\public\\upload\\images\\Unknown-2025-10-10-a2a7fe85f709.jpg",
      size: 2956863,
    },
  ];
}
