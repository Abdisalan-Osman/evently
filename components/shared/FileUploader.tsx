"use client";
import { useCallback, Dispatch, SetStateAction } from "react";
import type { FileWithPath } from "@uploadthing/react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { Button } from "@/components/ui/button";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  image: string;
  setFiles: Dispatch<SetStateAction<File[]>>;
};

export function FileUploader({
  image,
  onFieldChange,
  setFiles,
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
    onFieldChange(convertFileToUrl(acceptedFiles[0]));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*" ? generateClientDropzoneAccept(["image/*"]) : undefined,
  });

  return (
    <div
      {...getRootProps()}
      className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {image ? (
        <div className="flex h-full w-full flex-1 justify-center ">
          <img
            src={image}
            alt="image"
            width={250}
            height={250}
            className="w-full object-cover object-center"
          />
        </div>
      ) : (
        <div className="flex-center flex-col py-5 text-grey-500">
          <img
            src="/assets/icons/upload.svg"
            width={77}
            height={77}
            alt="file upload"
          />
          <h3 className="mb-2 mt-2">Drag photo here</h3>
          <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
          <Button type="button" className="rounded-full">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
// import { Dispatch, SetStateAction, useCallback, useState } from "react";

// type FileUploaderProps = {
//   onFiledChange: (value: string) => void;
//   setFiles: Dispatch<SetStateAction<File[]>>;
//   image: string | null;
//   files: File[];
// };

// // Note: `useUploadThing` is IMPORTED FROM YOUR CODEBASE using the `generateReactHelpers` function
// import { useDropzone } from "@uploadthing/react";
// import { generateClientDropzoneAccept } from "uploadthing/client";

// export function FileUploader({
//   onFiledChange,
//   setFiles,
//   image,
//   files,
// }: FileUploaderProps) {
//   //   const [files, setFiles] = useState<File[]>([]);
//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     setFiles(acceptedFiles);
//   }, []);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: "image/*" ? generateClientDropzoneAccept(["image/*"]) : undefined,
//   });

//   return (
//     <div {...getRootProps()}>
//       <input {...getInputProps()} />
//       <div>
//         {files.length > 0 && (
//           <button onClick={() => setFiles(files)}>
//             Upload {files.length} files
//           </button>
//         )}
//       </div>
//       Drop files here!
//     </div>
//   );
// }

// export default FileUploader;
