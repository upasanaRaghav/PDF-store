import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { pdfjs } from "react-pdf";
import PdfComp from "./PdfComp";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [allImage, setAllImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async () => {
    const result = await axios.get("http://localhost:5000/get-files");
    console.log(result.data.data);
    setAllImage(result.data.data);
  };

  const submitImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    console.log(title, file);
    const result = await axios.post(
      "http://localhost:5000/upload-files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(result);
    if (result.data.status === "ok") {
      alert("Pdf uploaded successfully");
      getPdf();
    }
  };

  const showPdf = (pdf) => {
    // window.open(`http://localhost:5000/files/${pdf}`, "_blank", "noreferrer");
    setPdfFile(`http://localhost:5000/files/${pdf}`);
  };

  const handleDeletePdf = async (pdf) => {
    try {
      await axios.delete(`http://localhost:5000/delete-file/${pdf}`);
      getPdf();
    } catch (error) {
      console.error("Error deleting PDF file:", error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={submitImage} className="formStyle">
        <h4>Upload Pdf in React</h4>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Titile"
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          type="file"
          className="form-control"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
      <div className="uploaded">
        <h4>Uploaded PDF:</h4>
        <div className="output-div">
          <div className="inner-left">
            {allImage == null
              ? ""
              : allImage.map((data) => {
                  return (
                    <div className="inner-div">
                      <h6>Title: {data.title}</h6>
                      <div className="buttons">
                        <button
                          className="btn btn-primary m-1"
                          onClick={() => {
                            showPdf(data.pdf);
                          }}
                        >
                          Show Pdf
                        </button>
                        <button
                          className="btn btn-primary m-1"
                          onClick={() => handleDeletePdf(data.pdf)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
          <div className="inner-right">
            <PdfComp pdfFile={pdfFile} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
