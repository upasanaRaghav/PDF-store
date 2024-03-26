const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files"));
const fs = require("fs");

// connecting to mongodb
const mongoUrl =
process.env.MONGODB_URI;
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// multer
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;

  try {
    await PdfSchema.create({ pdf: fileName, title: title });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

app.delete("/delete-file/:pdfName", async (req, res) => {
  const pdfName = req.params.pdfName;

  try {
    // Find PDF entry in the database
    const pdf = await PdfSchema.findOne({ pdf: pdfName });

    if (!pdf) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF not found" });
    }

    // Delete file from file system
    fs.unlinkSync(`./files/${pdf.pdf}`);

    // Remove PDF entry from database
    await PdfSchema.findByIdAndDelete(pdf._id);

    res.json({ status: "ok", message: "PDF deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// API
app.get("/", async (req, res) => {
  res.send("success!!!");
});

app.listen(5000, () => {
  console.log("Server Started");
});
