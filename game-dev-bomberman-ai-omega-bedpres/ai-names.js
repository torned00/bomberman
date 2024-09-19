import { readdir } from "fs/promises";

export const getAiNames = async () => {
  try {
    const files = await readdir("./public/ais/");
    const jsFiles = files
      .filter((file) => file.endsWith(".js"))
      .map((file) => file.slice(0, -3));
    return jsFiles;
  } catch (err) {
    console.error("An error occurred:", err);
  }
};
