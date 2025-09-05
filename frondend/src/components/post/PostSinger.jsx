import { useEffect, useState } from "react";
import styles from "./Post.module.css";
export default function PostSinger() {
  const [placeholder, setPlaceholder] = useState("./images/avatar.svg");
  const [avatar, setAvatar] = useState(null);
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    if (placeholder && placeholder.startsWith("blob:")) {
      URL.revokeObjectURL(placeholder);
    }
    setPlaceholder(URL.createObjectURL(file));
  };

  const handleInputSubmit = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append("avatar", avatar);
      const res = await fetch("http://localhost:3005/api/singers", {
        method: "post",
        body: formData,
      });
      const resData = await res.json();
      if (!res.ok) {
        console.log(resData.message);
      }
      console.log(resData.message);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    console.log(avatar);
    return () => {
      if (placeholder && placeholder.startsWith("blob:")) {
        URL.revokeObjectURL(placeholder);
      }
    };
  }, [placeholder, avatar]);
  return (
    <div className={styles["post-wrapper"]}>
      <h1 className="text-center mb-5">Add a new singer</h1>
      <form onSubmit={handleInputSubmit}>
        <div>
          <div>
            <img src={placeholder} alt="" />
          </div>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar">Change Avatar</label>
        </div>
        <button type="submit">Button Name</button>
      </form>
    </div>
  );
}
