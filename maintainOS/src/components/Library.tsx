import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, BookOpen, FileText, Copy } from "lucide-react";

export function Library() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Library</h1>
          <p className="text-muted-foreground">
            Manage procedures, templates, and documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Procedure
          </Button>
        </div>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Standard Operating Procedures</CardTitle>
              <CardDescription>Versioned procedures with steps, tools, and safety requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Procedure library with versioning, approval workflow, and step-by-step instructions would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                Work order templates with pre-filled tasks, parts lists, and time estimates would be shown here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}