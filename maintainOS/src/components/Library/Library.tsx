import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, BookOpen, FileText, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { LibraryHeaderComponent } from "./LibraryHeader";
import { useState } from "react";
import type { ViewMode } from "../purchase-orders/po.types";

export function Library() {

  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);


  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {LibraryHeaderComponent(viewMode, setViewMode, searchQuery, setSearchQuery, setShowForm, setShowSettings)}

    </div>
  );
}