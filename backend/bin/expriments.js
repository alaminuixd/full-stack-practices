const file = {
  originalname: "hayman.jpg",
};
const path = {
  extname(str) {
    const match = str.match(/\.[^.]+$/);
    return match ? match[0] : "";
  },
};
const ext = path.extname(file.originalname);
console.log(ext);
