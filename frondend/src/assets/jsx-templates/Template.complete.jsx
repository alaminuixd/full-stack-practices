import { useEffect, useRef, useState } from "react";
import style from "./Kids.module.css";

export default function Kids() {
  const [avatar, setAvatar] = useState(null);
  const [kidData, setKidData] = useState({ name: "" });
  const [result, setResult] = useState({ success: "", error: "" });
  const [placeholder, setPlaceholder] = useState("./images/avatar.svg");
  // handler functions
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    const maxFileSize = 5 * 1024 * 1024;
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = (e) => {
      console.log("image width: " + img.width);
      console.log("image height: " + img.height);
    };

    if (file.size > maxFileSize) {
      setResult({ success: "", error: "Invalid file size" });
      return;
    }
    setAvatar(file);
    setResult({ success: "", error: "" });
    if (placeholder && placeholder.startsWith("blob:")) {
      URL.revokeObjectURL(placeholder);
    }
    setPlaceholder(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    if (placeholder && placeholder.startsWith("blog:")) {
      URL.revokeObjectURL(placeholder);
    }
    setPlaceholder(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setKidData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!avatar || !kidData.name) {
        setResult((prev) => ({ ...prev, error: "All fields are required" }));
        return;
      }
      const formData = new FormData();
      formData.append("name", kidData.name);
      formData.append("avatar", avatar);
      const res = await fetch("http://localhost:3003/api/kids", {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();
      if (!res.ok) {
        setResult((prev) => ({ ...prev, error: resData.message }));
        return;
      }
      setKidData({ name: "" });
      setPlaceholder("./images/avatar.svg");
      setResult((prev) => ({ ...prev, success: resData.message }));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (avatar) {
      console.log(avatar);
      console.log(avatar.name);
      console.log(avatar.size);
    }
  }, [avatar]);

  // remove last blob temporary image url from the memory
  useEffect(() => {
    return () => {
      if (placeholder && placeholder.startsWith("blob:")) {
        URL.revokeObjectURL(placeholder);
      }
    };
  }, [placeholder]);
  return (
    <div className={style["kids-wrapper"]}>
      <form onSubmit={handleInputSubmit}>
        <div>
          <img src={placeholder} alt="" />
        </div>
        <div>
          <input
            type="file"
            // onChange={handleAvatarChange}
            onChange={handleFileChange}
            id="avatar"
            accept="image/*"
          />
          <label htmlFor="avatar">Change Avatar</label>
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={kidData.name}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Add Kid</button>
        {result && result.success && (
          <p className="text-center text-green-600">{result.success}</p>
        )}
        {result && result.error && (
          <p className="text-center text-red-600">{result.error}</p>
        )}
      </form>
    </div>
  );
}
