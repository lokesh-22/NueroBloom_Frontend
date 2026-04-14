'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDocumentById } from "@/services/api";

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    getDocumentById(id as string)
      .then(setDoc)
      .catch(console.error);
  }, [id]);

  if (!doc) return <div>Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">{doc.title}</h1>

      <p className="mt-2">Status: {doc.status}</p>

      <h2 className="mt-5 font-semibold">Summary</h2>
      <p className="mt-2">{doc.summary || "Not processed yet"}</p>

      <h2 className="mt-5 font-semibold">Extracted Text</h2>
      <div className="mt-2 max-h-[300px] overflow-auto border p-3">
        {doc.extracted_text?.slice(0, 2000)}
      </div>

      <button
  onClick={() => window.location.href = `/quiz/${doc.id}`}
>
  Take Quiz
</button>
    </div>
  );
}