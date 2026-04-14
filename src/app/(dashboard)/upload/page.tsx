'use client';

import { useState } from "react";
import { uploadDocument } from "@/services/api";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!file) return;

    await uploadDocument(file, user.id);
    alert("Uploaded!");
  };

  return (
    <div className="p-10">
      <h1>Upload Document</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}