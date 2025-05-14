import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { Dispatch, SetStateAction, useEffect } from "react";
import Image from "next/image";
import { PreviewUrl } from "../Uploader";

interface ImageViewerDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  setCurrIndex: Dispatch<SetStateAction<number>>;
  previewUrls: PreviewUrl[];
  currIndex: number;
}

export default function ImageViewerDialog({
  open,
  setOpen,
  previewUrls,
  currIndex,
  setCurrIndex,
}: ImageViewerDialogProps) {
  const onKeydown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowLeft" && currIndex > 0)
      setCurrIndex((prev) => prev - 1);

    if (e.key === "ArrowRight" && currIndex < previewUrls.length - 1)
      setCurrIndex((prev) => prev + 1);
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);

  return (
    <Transition
      show={open}
      enter="duration-200 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="duration-300 ease-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel>
            <div
              className="fixed top-8 right-8 p-2.5 hover:bg-slate-700/80 rounded-full cursor-pointer"
              onClick={() => {
                setOpen(false);
              }}
            >
              <FaXmark className="h-6 w-6" />
            </div>
            {currIndex > 0 && (
              <div
                className="fixed left-10 top-1/2 text-slate-300 p-2.5 cursor-pointer hover:bg-slate-800 rounded-full"
                onClick={() => {
                  setCurrIndex(currIndex - 1);
                }}
              >
                <FaArrowLeft className="h-8 w-8" />
              </div>
            )}

            <Image
              src={previewUrls[currIndex].url}
              alt="Preview image"
              width="0"
              height="0"
              className="w-auto h-[95vh]"
            />
            {currIndex < previewUrls.length - 1 && (
              <div
                className="fixed right-10 top-1/2 text-slate-300 p-2.5 cursor-pointer hover:bg-slate-800 rounded-full"
                onClick={() => {
                  setCurrIndex(currIndex + 1);
                }}
              >
                <FaArrowRight className="h-8 w-8" />
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
