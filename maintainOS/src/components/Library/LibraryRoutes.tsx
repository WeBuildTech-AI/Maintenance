import { Route, Routes } from "react-router-dom";
import { Library } from "./Library";

export default function LibraryRoutes() {
  return (
    <Routes>
      {/* ✅ CRITICAL FIX: 
        Using '*' allows the Library component to stay mounted 
        while handling sub-paths like /create, /:id, etc. internally.
      */}
      <Route path="*" element={<Library />} />
    </Routes>
  );
}