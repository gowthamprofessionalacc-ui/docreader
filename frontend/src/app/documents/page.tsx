import DocumentList from "@/components/DocumentList";

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
      <p className="text-gray-500 mb-8">Browse and manage your uploaded documents.</p>
      <DocumentList />
    </div>
  );
}
