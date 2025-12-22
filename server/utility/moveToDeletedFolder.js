import fs from "fs";
import path from "path";
import { logInfo, logError } from "./logger.js";

export const moveToDeletedFolder = (relativeFilePath, logLabel = "file") => {
  if (!relativeFilePath || typeof relativeFilePath !== "string") return;

  const originalPath = path.join(process.cwd(), relativeFilePath);

  if (fs.existsSync(originalPath)) {
    const deletedFolder = path.join(process.cwd(), "uploads/deleted-files");

    if (!fs.existsSync(deletedFolder)) {
      fs.mkdirSync(deletedFolder, { recursive: true });
    }

    const fileName = path.basename(relativeFilePath);
    const newPath = path.join(deletedFolder, fileName);

    try {
      fs.renameSync(originalPath, newPath);
      logInfo(`Moved ${logLabel} to trash → ${newPath}`);
    } catch (err) {
      logError(`Error moving ${logLabel} to trash`, err);
    }
  }
};
