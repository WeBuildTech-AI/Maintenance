import { Routes, Route } from "react-router-dom";
import { Library } from "./Library";
import GenerateProcedure from "./GenerateProcedure/GenerateProcedure";

export default function LibraryRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="generate" element={<GenerateProcedure />} />
    </Routes>
  );
}
