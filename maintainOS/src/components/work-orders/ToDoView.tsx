"use client";

import { useMemo, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Factory,
  Edit,
  Edit2,
  Link,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Repeat,
  Activity, 
  PauseCircle,
  Loader2, 
  CheckCircle2, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Paperclip,
  X,
} from "lucide-react";

import { type ToDoViewProps } from "./types";
import { NewWorkOrderForm } from "./NewWorkOrderForm/NewWorkOrderFrom";

import CopyPageUrlIcon from "../ui/copy-page-url-icon";
import { ScrollArea } from "../ui/scroll-area";
import { formatBytes } from "../../utils/formatBytes";

export type StatusKey = "open" | "on_hold" | "in_progress" | "done";

const messages = [
    { id: 1, sender: "Bob Smith", text: "Hey, how are you?" ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
    { id: 2, sender: "Ashwini Chauhan", text: "I'm good, what about you?" ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
    { id: 3, sender: "Charlie Brown", text: "Doing great!"  ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
  ]

const STATUSES: Array<{
key: StatusKey;
label: string;
Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
{ key: "open", label: "Open", Icon: Activity },
{ key: "on_hold", label: "On hold", Icon: PauseCircle },
{ key: "in_progress", label: "In Progress", Icon: Loader2 },
{ key: "done", label: "Done", Icon: CheckCircle2 },
];

export function ToDoView({
  todoWorkOrders,
  doneWorkOrders,
  selectedWorkOrder,
  onSelectWorkOrder,
  creatingWorkOrder,
  onCancelCreate,
}: ToDoViewProps & {
  creatingWorkOrder?: boolean;
  onCancelCreate?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");
  const [activeStatus, setActiveStatus] = useState<StatusKey>("open");

  
  const [comment, setComment] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = ref.current!;
    setComment(e.target.value);
  };

 const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openPicker = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachment(file);
    // let user re-select same file later
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearAttachment = () => setAttachment(null);

  const lists = useMemo(
    () => ({
      todo: todoWorkOrders,
      done: doneWorkOrders,
    }),
    [todoWorkOrders, doneWorkOrders]
  );

  const activeList = lists[activeTab];

  const priorityStyles: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-orange-100 text-orange-700 border-orange-200",
    Daily: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed" || normalized === "done") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          ✓ Done
        </Badge>
      );
    }
    if (normalized === "in progress") {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          In Progress
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="flex h-full">
      {/* LEFT SIDE LIST */}
      <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
        <div className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex rounded-full bg-muted/60 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("todo")}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === "todo"
                    ? "bg-background shadow"
                    : "text-muted-foreground"
                }`}
              >
                To Do ({todoWorkOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("done")}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === "done"
                    ? "bg-background shadow"
                    : "text-muted-foreground"
                }`}
              >
                Done ({doneWorkOrders.length})
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary p-2">
                  Sort: Last Updated
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  Last Updated: Most Recent First
                </DropdownMenuItem>
                <DropdownMenuItem>Priority: Highest First</DropdownMenuItem>
                <DropdownMenuItem>Due Date: Soonest First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeList.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full border border-dashed border-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No work orders</p>
                <p className="text-xs text-muted-foreground">
                  Switch tabs or create a new work order to get started.
                </p>
              </div>
              <Button
                // variant="outline"
                size="sm"
                className="gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700"
                onClick={() => console.log("Create Work Order clicked")}
              >
                Create Work Order
              </Button>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {activeList.map((workOrder) => {
                const isSelected = selectedWorkOrder.id === workOrder.id;
                return (
                  <Card
                    key={workOrder.id}
                    className={`cursor-pointer border shadow-sm transition hover:shadow ${
                      isSelected ? "border-primary" : ""
                    }`}
                    onClick={() => onSelectWorkOrder(workOrder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-12 w-12 flex items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-muted bg-muted/40"
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={workOrder.assignedTo.avatar} />
                            <AvatarFallback>
                              {workOrder.assignedTo.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {workOrder.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activeTab === "done"
                                  ? "Completed by"
                                  : "Assigned to"}{" "}
                                {workOrder.assignedTo.name}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              {workOrder.id}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {renderStatusBadge(workOrder.status)}
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${
                                priorityStyles[workOrder.priority] ?? ""
                              }`}
                            >
                              ● {workOrder.priority}
                            </Badge>
                            <span className="text-muted-foreground">
                              Due {workOrder.dueDate}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Asset: {workOrder.asset} · Location:{" "}
                            {workOrder.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col border-border">
        {creatingWorkOrder ? (
          <NewWorkOrderForm
            onCreate={() => {
              console.log("Work order created!");
              onCancelCreate?.();
            }}
            // onCancel={onCancelCreate}
          />
        ) : (
          <>

            {/* Left Side Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium">
                    {selectedWorkOrder.title}
                  </h2>
                  <CopyPageUrlIcon/>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 "> 
                  <Repeat className="h-3 w-3"/> 
                  {selectedWorkOrder.priority} - 
                </span>
                <span className="flex items-center gap-1 "> 
                  <CalendarDays className="h-3 w-3"/> 
                   Due by {selectedWorkOrder.dueDate}
                </span>
              </div>
            </div>

            {selectedWorkOrder.wasDeleted && (
              <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Work Order was deleted.
                    </p>
                    {selectedWorkOrder.deletedDate && (
                      <p className="text-sm text-destructive/80">
                        Deleted on {selectedWorkOrder.deletedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <ScrollArea>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex-row items-center justify-between">
                
                <h3 className="text-sm font-medium mb-2">Status</h3>
                {/* We will have the status buttons here  */}
                <div
                    className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col"
                    role="group"
                    aria-label="Status and share panel"
                    >
                    {/* Left: 4 square buttons */}
                      <div className="flex gap-4 ">
                          {STATUSES.map(({ key, label, Icon }) => {
                              const active = activeStatus === key;
                              return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveStatus(key)}
                                    aria-pressed={active}
                                    aria-label={`Set status to ${label}`}
                                    className={[
                                    "h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2",
                                    "transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring",
                                    active
                                    ? "bg-orange-600 text-black border-orange-600"
                                    : "bg-orange-50 text-sidebar-foreground border-gray-200 hover:bg-orange-100",
                                    ].join(" ")}
                                    >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    <span className="text-xs font-medium leading-none text-center px-2 truncate">
                                      {label}
                                    </span>
                                  </button>
                                );
                            })}
                      </div>
                    </div>
                                

              </div>

              {/* Due Date, Priority and Work Order Id */}
              <div className="flex p-6 justify-between gap-6 border-b">
                <div>
                  <h3 className="text-sm font-medium mb-2">Due Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkOrder.dueDate}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Priority</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkOrder.id}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Work Order ID</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkOrder.id}
                  </p>
                </div>
              </div>

              <div className="border-b p-6">
                <h3 className="text-sm font-medium mb-2">Assigned To</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedWorkOrder.assignedTo.avatar} />
                    <AvatarFallback>
                      {selectedWorkOrder.assignedTo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {selectedWorkOrder.assignedTo.name}
                  </span>
                </div>
              </div>

              <div className="border-b p-6">
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {selectedWorkOrder.description || "No description provided."}
                  </span>
                </div>
              </div>

              <div className="p-6 border-b grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Asset</h3>
                  <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkOrder.asset}</span>
                    <Select >
                      <SelectTrigger className="w-[80px] h-6 text-xs">
                        <SelectValue placeholder="Online" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Location</h3>
                  <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedWorkOrder.location}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Estimated Time</h3>
                  <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedWorkOrder.estimated_time || "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Work Type</h3>
                  <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedWorkOrder.work_type || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b p-6">
                <h3 className="text-sm font-medium mb-2">Schedule conditions</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">
                    This Work Order will repeat based on time.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Repeats every week on Monday after completion of this Work Order.
                  </span>
                </div>

              </div>     

              <div className="border-b p-6">
                <h3 className="text-2xl font-medium mb-2">Time & Cost Tracking</h3>
                <div className="flex justify-between items-center p-3 mb-2 border-b">
                  <span className="text-sm font-medium ">
                      Parts
                    </span>
                    <button className="flex text-sm text-muted-foreground items-center gap-1">
                      Add
                      <ChevronRight className="h-4 w-4 font-muted-foreground"/>
                    </button>
                </div>
                <div className="flex justify-between items-center p-3 mb-2 border-b">
                  <span className="text-sm font-medium ">
                      Time
                    </span>
                    <button className="flex text-sm text-muted-foreground items-center gap-1">
                      Add
                      <ChevronRight className="h-4 w-4 font-muted-foreground"/>
                    </button>
                </div>
                <div className="flex justify-between items-center p-3 mb-2">
                  <span className="text-sm font-medium ">
                      Other Costs
                    </span>
                    <button className="flex text-sm text-muted-foreground items-center gap-1">
                      Add
                      <ChevronRight className="h-4 w-4 font-muted-foreground"/>
                    </button>
                </div>
              </div> 

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b p-6">
                {/* Left: Created By */}
                <div className="flex items-center text-xs">
                  <span>Created By</span>
                  <Avatar className="ml-2 mr-2 h-6 w-6 inline-flex">
                    <AvatarImage src={selectedWorkOrder.assignedTo.avatar} />
                    <AvatarFallback>
                      {selectedWorkOrder.assignedTo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedWorkOrder.createdBy}</span>
                  <span className="mx-2">on</span>
                  <span>{selectedWorkOrder.createdAt}</span>
                </div>

                {/* Right: Updated On */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Updated On</span>
                  <span className="text-xs">{selectedWorkOrder.updatedAt}</span>
                </div>
              </div>      


              {/* POSTING COMMENTS */}
              <div className="flex-1 p-6">
                <h3 className="text-2xl font-medium mb-2">Comments</h3>

                <textarea
                  ref={ref}
                  value={comment}
                  onChange={onInput}
                  placeholder="Write a comment…"
                  rows={3}
                  className="w-full text-sm text-muted-foreground rounded-lg bg-white px-3 py-2 leading-6 outline-none resize-none overflow-y-auto shadow-inner focus-visible:ring-2 focus-visible:ring-orange-300 border"
                  aria-label="Comment"
                  // optional max height before scrolling
                  style={{ maxHeight: 240 }}
                />

                <div className="p-1 flex items-end justify-end w-full ">
                  <div className="flex items-start gap-3">
                    {/* Only render UI when a file is selected */}
                    {attachment && (
                      <div className="group flex items-center gap-3 rounded-md border border-border bg-white px-2 py-1">
                        {/* image thumb if applicable */}
                        {attachment.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(attachment)}
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : null}

                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate max-w-[200px]">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {attachment.type || "file"} • {formatBytes(attachment.size)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={clearAttachment}
                          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                          aria-label="Remove attachment"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                     
                     {/* Hidden input — never shown */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={onFileChange}
                      className="hidden" // <- Tailwind 'display:none'
                    />

                     <Paperclip
                        onClick={() => fileRef.current?.click()}
                        className="mt-1 h-4 w-4 text-muted-foreground cursor-pointer"
                      />
                    
                    <Button
                      className="gap-2 cursor-pointer bg-orange-600 hover:outline-none">
                      Send
                    </Button>
                  </div>

                </div>


                
              </div>  

              {/* Comments Reading Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-card">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3">
                            {/* Avatar */}
                            <Avatar className="w-9 h-9">
                            <AvatarImage src={msg.avatar} />
                            <AvatarFallback>
                                {msg.sender.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                            </Avatar>

                            {/* Message block */}
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-sm font-medium">{msg.sender}</p>
                                    <span className="text-xs text-muted-foreground">
                                    {msg.timestamp}
                                    </span>
                                </div>
                                <div className="mt-1 space-y-1">
                                        {msg.text.split("\n").map((line, i) => (
                                            <p key={i} className="text-sm">
                                                {line}
                                            </p>
                                            ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>



            </div>
            </ScrollArea>  
          </>
        )}
      </div>
    </div>
  );
}
