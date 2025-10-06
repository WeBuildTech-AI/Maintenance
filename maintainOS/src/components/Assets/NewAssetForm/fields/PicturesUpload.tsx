import { useState } from "react";
import { Upload } from "lucide-react";

export function PicturesUpload() {
    const [pictures, setPictures] = useState<File[]>([]);

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newPictures = Array.from(e.target.files) as File[]; // <-- cast
        setPictures((prev) => [...prev, ...newPictures]);
    };

    const removePicture = (i: number) => {
        setPictures((prev) => prev.filter((_, idx) => idx !== i));
    };

    return (
        <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">Pictures</h3>
            {pictures.length === 0 ? (
                <div
                    className="mb-20 border border-dashed rounded-md p-6 text-center bg-orange-50 cursor-pointer"
                    onClick={() => document.getElementById("pictureInput")?.click()}
                >
                    <Upload className="mx-auto mb-2 h-6 w-6" />
                    <p className="text-orange-600">Add or drag pictures</p>
                    <input id="pictureInput" type="file" multiple className="hidden" onChange={handleSelect} />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {/* Add more always first */}
                    <div
                        className="border border-dashed rounded-md text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                        onClick={() => document.getElementById("pictureInput")?.click()}
                    >
                        <Upload className="h-6 w-6 mb-2" />
                        <p className="text-xs">Add more</p>
                        <input id="pictureInput" type="file" multiple className="hidden" onChange={handleSelect} />
                    </div>

                    {pictures.map((file, i) => {
                        const url = URL.createObjectURL(file);
                        return (
                            <div key={i} className="relative w-32 h-32 rounded-md overflow-hidden flex items-center justify-center">
                                <img src={url} alt={file.name} className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => removePicture(i)}
                                    className="absolute top-1 right-1 bg-white text-blue-600 rounded-full p-1 shadow"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
