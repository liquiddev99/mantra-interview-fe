"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ImageViewerDialog from "./dialogs/ImageViewer";
import axios from "axios";
import SelectOptions from "./SelectOptions";
import JSZip from "jszip";
import {
  allowedImageFormat,
  fontFamilyOptions,
  notosansSupportedLangs,
  toLangOptions,
  wildwordsSupportedLangs,
} from "./const";
import WarningDialog from "./WarningDialog";

export interface PreviewUrl {
  url: string;
  status: string;
  fileName: string;
}

export default function Uploader() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [open, setOpen] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [doneTranslate, setDoneTranslate] = useState(false);
  const [currIndex, setCurrIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<PreviewUrl[]>([]);
  const [err, setErr] = useState("");
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toLang, setToLang] = useState(toLangOptions[31]);
  const [fontFamily, setFontFamily] = useState(fontFamilyOptions[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      (fontFamily == "Wild Words" &&
        !wildwordsSupportedLangs.includes(toLang)) ||
      (fontFamily == "Noto Sans" && !notosansSupportedLangs.includes(toLang))
    )
      setOpenWarning(true);
  }, [toLang, fontFamily]);

  function getSupportedFont(fontFamily: string, toLang: string) {
    if (fontFamily === "Wild Words" && wildwordsSupportedLangs.includes(toLang))
      return "WildWords";
    if (toLang === "Korean") return "GothicA1";
    if (toLang === "Chinese") return "FangSong";

    return "NotoSans";
  }

  function clearFiles() {
    setFiles(null);
    previewUrls.map((item) => URL.revokeObjectURL(item.url));
    setPreviewUrls([]);
    setDoneTranslate(false);
    setErr("");
    setCurrIndex(0);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleClick() {
    if (isLoading) return;
    if (!inputRef.current) return;
    inputRef.current.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    let err = "";
    files.map((file) => {
      if (!allowedImageFormat.some((format) => file.type.includes(format))) {
        err =
          "Unsupported file type, please choose image in png, jpg, webp format only";
      }
    });
    if (err) {
      setErr(err);
      return;
    }
    const previewUrls = files.map((file) => ({
      url: URL.createObjectURL(file),
      status: "active",
      fileName: file.name,
    }));

    setPreviewUrls(previewUrls);
    setErr("");
    setFiles(files);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);

    if (!e.dataTransfer.files) return;
    const files = Array.from(e.dataTransfer.files);
    let err = "";
    files.map((file) => {
      if (!allowedImageFormat.some((format) => file.type.includes(format))) {
        err =
          "Unsupported file type, please choose image in png, jpg, jpeg format only";
      }
    });
    if (err) {
      setErr(err);
      return;
    }
    const previewUrls = files.map((file) => ({
      url: URL.createObjectURL(file),
      status: "active",
      fileName: file.name,
    }));
    setPreviewUrls(previewUrls);
    setErr("");
    setFiles(files);
  }

  async function handleUpload() {
    try {
      if (!files?.length) return;
      setErr("");
      setIsLoading(true);
      const processingUrls = previewUrls.map((item) => ({
        ...item,
        status: "processing",
      }));
      setPreviewUrls(processingUrls);
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(
          `https://mantra-interview.online/server/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              toLang,
              fontFamily: getSupportedFont(fontFamily, toLang),
            },
            responseType: "blob",
          },
        );

        const blob = res.data;
        const translatedURL = URL.createObjectURL(blob);

        const index = processingUrls.findIndex(
          (item) => item.fileName === file.name,
        );
        processingUrls[index] = {
          ...processingUrls[index],
          status: "active",
          url: translatedURL,
        };
        setPreviewUrls([...processingUrls]);
      }

      setDoneTranslate(true);
      setFiles(null);
      setIsLoading(false);
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      let msg = "An error occured, please try again";
      const data = await err.response?.data?.text();
      if (data) {
        msg = JSON.parse(data).message;
      }
      setErr(msg);
      setIsLoading(false);
      setFiles(null);
      setDoneTranslate(true);
      setPreviewUrls((prevUrls) => {
        return prevUrls.map((url) => ({ ...url, status: "active" }));
      });
    }
  }

  async function handleDownload() {
    const zip = new JSZip();
    setDownloading(true);
    const fetchImages = previewUrls.map(async (item, index) => {
      const response = await fetch(item.url);
      const blob = await response.blob();
      zip.file(`${index + 1}.jpg`, blob);
    });

    await Promise.all(fetchImages);

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = "translated_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Free memory
    URL.revokeObjectURL(zipUrl);
    setDownloading(false);
  }
  return (
    <div className="max-w-6xl w-80 sm:w-[500px] md:w-[780px] lg:w-[900px] xl:w-[1024px] px-8 mt-20">
      <h1 className="text-4xl font-bold">
        Demo translate comic for mantra interview
      </h1>
      <p className="mt-4 text-lg">
        Dear Mantra, I just made this demo page to show my project with the
        company, it can translate comics from Japanese, Korean, Chinese and
        English into many languages, the models is self-trained so I have
        experienced on training machine learning models and improving accuracy,
        you can test this out, thank you so much.
      </p>
      <div className="flex flex-col md:flex-row gap-4 mt-8 lg:mt-10 lg:items-end">
        <SelectOptions
          name="Translate to"
          options={toLangOptions}
          selected={toLang}
          setSelected={setToLang}
        />

        <SelectOptions
          name="Font Family"
          options={fontFamilyOptions}
          selected={fontFamily}
          setSelected={setFontFamily}
        />
      </div>
      <div className="w-full h-full flex flex-col mt-6 flex-grow mb-5 lg:mb-20">
        {previewUrls.length ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 border border-dashed p-7 border-slate-500 rounded-md max-h-[610px] overflow-y-auto">
              {previewUrls.map((item, index) => (
                <div className={`relative`} key={item.url}>
                  <Image
                    src={item.url}
                    width={500}
                    height={900}
                    alt={`Preview image`}
                    onClick={() => {
                      setCurrIndex(index);
                      setOpen(true);
                    }}
                    className="cursor-pointer object-cover"
                  />
                  {item.status === "processing" && (
                    <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center">
                      <AiOutlineLoading3Quarters className="h-4 w-4 mr-2.5 animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <ImageViewerDialog
              open={open}
              setOpen={setOpen}
              previewUrls={previewUrls}
              currIndex={currIndex}
              setCurrIndex={setCurrIndex}
            />
          </>
        ) : (
          <div
            className={`w-full py-28 lg:py-36 h-full border border-slate-500 border-dashed rounded-lg cursor-pointer transition flex items-center justify-center${
              isDragOver ? " scale-110" : " scale-100"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={handleChange}
              multiple
              accept="image/*"
            />
            <div className="text-center flex flex-col items-center">
              {!files && (
                <div>
                  <p>Drop images or click to browse</p>
                  <p className="text-slate-400 mt-0.5">
                    support png, jpg, webp
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-4 max-w-full flex flex-col items-center">
          <div className="mt-6 flex gap-5">
            {files && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className={`px-6 py-1.5 rounded-md bg-teal-600 text-slate-100 text-lg ml-3.5 flex items-center transition hover:bg-teal-700${
                  isLoading ? " opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading && (
                  <AiOutlineLoading3Quarters className="h-4 w-4 mr-2.5 animate-spin" />
                )}
                {isLoading ? "Translating..." : "Start translate"}
              </button>
            )}

            {doneTranslate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className={`px-6 py-1.5 rounded-md bg-teal-600 text-slate-100 text-lg ml-3.5 flex items-center transition hover:bg-teal-700${
                  downloading ? " opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={downloading}
              >
                {downloading && (
                  <AiOutlineLoading3Quarters className="h-4 w-4 mr-2.5 animate-spin" />
                )}
                {downloading ? "Downloading..." : "Download all"}
              </button>
            )}

            {previewUrls.length ? (
              <button
                className="px-4 py-1.5 h-[40px] border rounded-md border-rose-700 hover:bg-white/10 text-rose-500 transition-all outline-none"
                onClick={() => clearFiles()}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
        {err && (
          <div className="flex items-center flex-col">
            <div className="text-slate-200 mt-4 bg-rose-500 rounded px-4 py-1.5 max-w-fit">
              {err}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <WarningDialog
        open={openWarning}
        setIsOpen={setOpenWarning}
        fontFamily={fontFamily}
        toLang={toLang}
      />
    </div>
  );
}
