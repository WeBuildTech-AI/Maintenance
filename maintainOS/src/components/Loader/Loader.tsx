import React from "react";

export default function Loader() {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "3rem",
          paddingBottom: "3rem",
        }}
      >
        <div
          className="border-orange-600"
          style={{
            height: "1.5rem",
            width: "1.5rem",
            borderRadius: "9999px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
    </>
  );
}
