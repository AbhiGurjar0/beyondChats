import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import All from "./pages/All.jsx";
import ArticleViewPage from "./pages/Article.jsx";
import Enhance from "./pages/Enhance.jsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/enhance/:id" element={<Enhance />} />
          <Route path="/article/:id" element={<ArticleViewPage />} />
          <Route path="/" element={<All />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
