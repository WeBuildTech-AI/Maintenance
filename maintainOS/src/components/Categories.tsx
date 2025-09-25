import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Tag, Package, Wrench, AlertTriangle } from "lucide-react";

export function Categories() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Categories</h1>
          <p className="text-muted-foreground">
            Manage taxonomy for problems, failures, assets, and parts
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Tabs defaultValue="problems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="problems">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Problem Types
          </TabsTrigger>
          <TabsTrigger value="failures">
            <Wrench className="h-4 w-4 mr-2" />
            Failure Causes
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Package className="h-4 w-4 mr-2" />
            Asset Classes
          </TabsTrigger>
          <TabsTrigger value="parts">
            <Tag className="h-4 w-4 mr-2" />
            Part Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="problems">
          <Card>
            <CardHeader>
              <CardTitle>Problem Type Categories</CardTitle>
              <CardDescription>Hierarchical classification of maintenance problems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Problem type hierarchy and management interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                Failure cause categories and root cause analysis taxonomy would be shown here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                Asset classification system and hierarchy would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                Parts categorization and classification system would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}