import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { type Vendor } from "./vendors.types";

export function VendorSidebar({
  vendors,
  selectedVendorId,
  setSelectedVendorId,
  loading,
}: {
  vendors: Vendor[];
  selectedVendorId: string;
  setSelectedVendorId: (id: string) => void;
  loading: boolean;
}) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortType, setSortType] = useState("Name");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 1)
      .join("")
      .toUpperCase();

  useEffect(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
        setOpenSection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedVendors = [...vendors].sort((a, b) => {
    let valA = a.name;
    let valB = b.name;

    if (sortType === "Creation Date") {
      valA = a.createdAt || "";
      valB = b.createdAt || "";
    } else if (sortType === "Last Updated") {
      valA = a.updatedAt || "";
      valB = b.updatedAt || "";
    }

    return sortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  return (
    <aside className="flex ml-3 mr-2 w-96 flex-col border border-border bg-card relative overflow-visible">
      {/* ---------- Header ---------- */}
      <div
        ref={headerRef}
        className="flex items-center justify-between px-5 py-3 border-b bg-white ml-3 relative z-40"
      >
        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium ">
          <span>Sort By:</span>
          <button
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-1 text-sm text-blue-600 font-semibold focus:outline-none"
          >
            {sortType}:{" "}
            {sortOrder === "asc" ? "Ascending Order" : "Descending Order"}
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* ---------- Dropdown Modal ---------- */}
      {isDropdownOpen && (
        <div
          ref={modalRef}
          className="fixed z-[9999] text-sm rounded-md border border-gray-200 bg-white shadow-lg animate-fade-in p-2"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateX(-50%)",
            width: "300px",
            maxWidth: "90vw",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {[
              {
                label: "Creation Date",
                options: ["Oldest First", "Newest First"],
              },
              {
                label: "Last Updated",
                options: ["Least Recent First", "Most Recent First"],
              },
              {
                label: "Name",
                options: ["Ascending Order", "Descending Order"],
              },
            ].map((section) => (
              <div key={section.label} className="flex flex-col mt-1 mb-1">
                {/* Section Header */}
                <button
                  onClick={() =>
                    setOpenSection(
                      openSection === section.label ? null : section.label
                    )
                  }
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-md ${sortType === section.label
                    ? "text-blue-600 font-medium bg-gray-50"
                    : "text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  <span>{section.label}</span>
                  {openSection === section.label ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {/* Sub Options */}
                {openSection === section.label && (
                  <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
                    {section.options.map((opt) => {
                      const isSelected =
                        (section.label === sortType &&
                          sortOrder === "asc" &&
                          (opt.includes("Asc") ||
                            opt.includes("Oldest") ||
                            opt.includes("Least"))) ||
                        (section.label === sortType &&
                          sortOrder === "desc" &&
                          (opt.includes("Desc") ||
                            opt.includes("Newest") ||
                            opt.includes("Most")));

                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortType(section.label);
                            setSortOrder(
                              opt.includes("Asc") ||
                                opt.includes("Oldest") ||
                                opt.includes("Least")
                                ? "asc"
                                : "desc"
                            );
                          }}
                          className={`flex items-center justify-between px-6 py-2 text-left text-sm transition rounded-md ${isSelected
                            ? "text-blue-600  bg-white"
                            : "text-gray-700 hover:text-blue-300 hover:bg-white"
                            }`}
                        >
                          {opt}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Vendor List ---------- */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <Loader />
        ) : (
          sortedVendors?.map((vendor) => {
            const isActive = selectedVendorId === vendor.id;
            const picture = vendor?.pictureUrl?.[0];
            const contactCount =
              vendor.contacts && vendor.contacts.length > 0
                ? `${vendor.contacts.length} contact${vendor.contacts.length > 1 ? "s" : ""
                }`
                : "No contacts";

            return (
              <Card
                key={vendor.id}
                className={`flex w-full cursor-pointer items-center justify-between border-b border-border px-5 py-3 text-left transition ${isActive
                  ? "border-l-2 border-l-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setSelectedVendorId(vendor.id);
                  navigate(`/vendors/${vendor.id}`);
                }}

              >
                <CardContent className="p-3 w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {picture ? (
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={`data:${picture.mimetype};base64,${picture.base64}`}
                          alt={vendor.name}
                        />
                        <AvatarFallback>
                          {renderInitials(vendor.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div
                        className="flex items-center justify-center rounded-full text-white font-semibold text-sm"
                        style={{
                          width: "36px",
                          height: "36px",
                          minWidth: "36px",
                          backgroundColor: vendor.color || "#2563eb",
                        }}
                      >
                        {renderInitials(vendor.name)}
                      </div>
                    )}
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {contactCount}
                  </span>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </aside>
  );
}
