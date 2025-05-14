import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";

interface WarningDialogProps {
  open: boolean;
  setIsOpen: (value: boolean) => void;
  fontFamily: string;
  toLang: string;
}

export default function WarningDialog({
  open,
  setIsOpen,
  fontFamily,
  toLang,
}: WarningDialogProps) {
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
      <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg bg-slate-900 p-8 rounded-lg">
            <div className="flex flex-col">
              <DialogTitle className="font-bold text-2xl mb-1 text-amber-400">
                Incompatible Warning
              </DialogTitle>
              <div>
                The {fontFamily} font and {toLang} are not compatible, which
                will cause broken results, the fallback NotoSans font will be
                used
              </div>
            </div>

            <div className="mt-4 flex">
              <button
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded-md text-slate-300 font-semibold mr-3`}
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
