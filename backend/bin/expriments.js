const file = {
  originalname: "hayman.jpg",
  mimetype: "image/jpg",
};

const path = {
  extname(str) {
    const match = str.match(/\.[^.]+$/);
    return match ? match[0] : "";
  },
};

const fileTypes = ["jpg", "jpeg", "png", "gif", "webp"];
const ext = path.extname(file.originalname).toLowerCase().substring(1);
const mimeType = file.mimetype.split("/")[1];

if (fileTypes.includes(ext) && fileTypes.includes(mimeType)) {
  console.log("success");
}

console.log(ext);
