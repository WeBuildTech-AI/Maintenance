import React from "react";

const Comment = () => {
  return (
    <>
      <div>
        <h3 className="font-medium mb-3">Comments &amp; History</h3>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">
            Write a comment…
          </div>
          <div className="border rounded-md h-24 bg-muted/30" />
        </div>
      </div>
    </>
  );
};

export default Comment;
