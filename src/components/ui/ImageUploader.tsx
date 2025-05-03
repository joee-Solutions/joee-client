import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function ProfileImageUploader() {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file) => {
    // Check file type
    if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
      setError("Only JPEG and PNG files are accepted");
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      setUploading(true);

      // Simulate upload process
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const removeImage = () => {
    setImage(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full ">
      <label className="block text-lg font-medium text-gray-700 mb-2">
        Profile Image
      </label>
      <div className="flex gap-10 w-full">
        <div
          className={`flex-1 relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 transition-colors w-full
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }
          ${error ? "border-red-500 bg-red-50" : ""}
          ${uploading ? "opacity-70" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!image ? openFileDialog : undefined}
          aria-label="Upload profile image"
          role="button"
          tabIndex={0}
        >
          {image ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={image}
                alt="Profile preview"
                className="max-w-full max-h-full object-contain rounded"
              />
              <button
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-blue-200 mb-3"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-blue-500">
                {isDragging ? (
                  <ImageIcon size={48} className="animate-pulse" />
                ) : (
                  <Upload size={48} />
                )}
              </div>
              <p className="mb-2 text-lg font-medium text-gray-700">
                {isDragging ? "Drop your image here" : "Drag your image here"}
              </p>
              <p className="mb-4 text-sm text-gray-500">
                (only *.jpeg and *.png will be accepted)
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            aria-label="Upload profile image"
          />
        </div>
        <div className="w-[178px] h-[158px] bg-[#D9EDFF] flex items-center justify-center font-medium text-[#999999]">
          {" "}
          <span>300x300</span>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-2 text-xs text-gray-500">
        Maximum file size: 5MB. For best results, use an image at least 300x300
        pixels.
      </p>
    </div>
  );
}
