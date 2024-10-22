import path from "path";
import multer from "multer";
import { v4 } from "uuid"; // creates random string

// ** MULTER IMAGE UPLOADER **/
function getTargetImageStorage(address: any) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${address}`);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext;
      const random_name = v4() + extension;
      cb(null, random_name);
    },
  });
}

const makeUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  return multer({ storage: storage });
};

export default makeUploader;

/*
const product_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/products");
  },
  filename: function (req, file, cb) {
    console.log(file);
    const extension = path.parse(file.originalname).ext; // 1. original name/format from file 2. ext => it gives ext of file (eg: jpg)
    const random_name = v4() + extension; // create random name
    cb(null, random_name); // uploads created file file
  },
});
*/
