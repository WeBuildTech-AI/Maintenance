"use client";
import { BlobUpload, type BUD } from "../../utils/BlobUpload";

interface PartFilesSectionProps {
  partImages: BUD[];
  partDocs: BUD[];
  onBlobChange: (data: { formId: string; buds: BUD[] }) => void;
}

export function PartFilesSection({
  partImages,
  partDocs,
  onBlobChange,
}: PartFilesSectionProps) {
  return (
    <section className="space-y-6 mt-6">
      {/* Part Images Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Part Images
        </h3>
        <BlobUpload
          formId="part_images"
          type="images"
          initialBuds={partImages}
          onChange={onBlobChange}
        />
      </div>

      {/* Part Documents Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Part Documents
        </h3>
        <BlobUpload
          formId="part_docs"
          type="files"
          initialBuds={partDocs}
          onChange={onBlobChange}
        />
      </div>
    </section>
  );
}
