import FileUpload from "@/components/FileUpload";

export default function UploadPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
      <p className="text-gray-500 mb-8">
        Add documents to your knowledge base. They&apos;ll be chunked, embedded, and ready for chat.
      </p>
      <FileUpload />
    </div>
  );
}
