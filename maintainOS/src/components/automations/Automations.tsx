"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Pause, Plus } from "lucide-react";
import { NewAutomationForm } from "./NewAutomationForm";

export function Automations() {
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  if (isCreatingRule) {
    return <NewAutomationForm onBack={() => setIsCreatingRule(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Automations</h1>
          <p className="text-muted-foreground">
            No-code rule builder for automated maintenance workflows
          </p>
        </div>
        <Button onClick={() => setIsCreatingRule(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Active Rules</CardTitle>
            <CardDescription>Currently running automation rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Critical Asset Failure Alert</p>
                  <p className="text-sm text-muted-foreground">
                    When asset status = "Critical Failure", create urgent WO
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">SLA Breach Notification</p>
                  <p className="text-sm text-muted-foreground">
                    When WO SLA &lt; 2 hours, notify manager
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule Builder Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Builder</CardTitle>
            <CardDescription>
              Create automated workflows with triggers and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Visual rule builder interface with "When-Then" logic would be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
