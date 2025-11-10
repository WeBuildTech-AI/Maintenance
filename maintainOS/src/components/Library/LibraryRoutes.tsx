import { Route, Routes } from "react-router-dom";
import GenerateProcedure from "./GenerateProcedure/GenerateProcedure";
import { Library } from "./Library";

export default function LibraryRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="generate" element={<GenerateProcedure />} />
    </Routes>
  );
}
