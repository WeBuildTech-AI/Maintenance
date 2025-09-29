import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Plus, BookOpen, FileText, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { LibraryHeaderComponent } from "./LibraryHeader";
import { useState } from "react";
import type { ViewMode } from "../purchase-orders/po.types";
import { ChecklistBuilder } from "../CheckListBuilder/CheckListBuilder";

export function Library() {
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {LibraryHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setShowForm,
        setShowSettings
      )}

      <div className="ml-3 space-y-6">
        <Tabs defaultValue="procedures" className="space-y-4">
          <TabsList>
            <TabsTrigger value="procedures">
              <BookOpen className="h-4 w-4 mr-2" />
              Procedures
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              WO Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="procedures">
            <ChecklistBuilder />
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Work order templates with pre-filled tasks, parts lists, and
                  time estimates would be shown here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
