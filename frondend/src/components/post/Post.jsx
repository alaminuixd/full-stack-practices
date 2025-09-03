import styles from "./Post.module.css";
export default function Post() {
  return (
    <div className={styles["post-wrapper"]}>
      <h1 className="text-center mb-5">Add a new XXX</h1>
      <form>
        <div>
          <div>
            <img src={""} alt="" />
          </div>
          <input type="file" id="avatar" accept="image/*" />
          <label htmlFor="avatar">Change Avatar</label>
        </div>
        <div>
          <label htmlFor="name">Name: </label>
          <input type="text" name="name" id="name" placeholder="Singer Name" />
        </div>
        <div>
          <label htmlFor="spouse">Spouse: </label>
          <input
            type="text"
            name="spouse"
            id="spouse"
            placeholder="Singer spouse name"
          />
        </div>
        <button type="submit">Button Name</button>
      </form>
    </div>
  );
}
