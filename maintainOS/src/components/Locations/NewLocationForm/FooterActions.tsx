"use client";

import { useNavigate } from "react-router-dom";
import Loader from "../../Loader/Loader";
import { Button } from "../../ui/button";

type FooterActionsProps = {
  onCancel: () => void;
  onCreate: () => void;
  submitLocationFormLoader: boolean; // boolean flag
  isEdit?: boolean; // ✅ new optional prop
  buttonText: () => void;
};

export function FooterActions({
  onCancel,
  onCreate,
  submitLocationFormLoader,
  isEdit = false, // ✅ default false
  buttonText,
}: FooterActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex border-t p-4 flex-none">
      <div className="ml-auto flex gap-2">
        <Button
          className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50"
          onClick={() => {
            onCancel();
            navigate("/locations");
          }}
        >
          Cancel
        </Button>

        <Button
          className="gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700"
          onClick={onCreate}
          disabled={submitLocationFormLoader} // disable while submitting
        >
          {submitLocationFormLoader ? <Loader /> : buttonText}
        </Button>
      </div>
    </div>
  );
}
