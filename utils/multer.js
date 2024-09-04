import multer from "multer";
// เพิ่มการตรวจสอบประเภทไฟล์
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, WebP, SVG, MP4, MPEG, OGG, and WEBM are allowed."
      ),
      false
    );
  }
};

export const multiUpload = multer({ storage, fileFilter }).array("files", 10);
