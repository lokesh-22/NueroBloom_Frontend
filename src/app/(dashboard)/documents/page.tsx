'use client';
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { getDocuments } from "@/services/api";

export default function Documents() {
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    getDocuments(user.id).then((res) => {
      console.log("API RESPONSE:", res);

      // ✅ ensure array
      if (Array.isArray(res)) {
        setDocs(res);
      } else if (res?.documents) {
        setDocs(res.documents);
      } else {
        setDocs([]);
      }
    });
  }, []);

  return (
    <div className="p-10">
      <h1>Your Documents</h1>

      {docs.length === 0 && <p>No documents found</p>}

    {docs.map((doc) => (
        <div
          key={doc.id}
          className="border p-3 my-2 cursor-pointer"
          onClick={() => router.push(`/documents/${doc.id}`)}
        >
          <h3>{doc.title}</h3>
          <p>Status: {doc.status}</p>
        </div>
      ))}
    </div>
  );
}