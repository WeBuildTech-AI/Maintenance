import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Paperclip,
  Send,
  Info,
  StepBack,
  ChevronDown,
  X,
  Camera,
  FileText,
} from "lucide-react";
import type {
  ChatWindowProps,
  ConversationType,
} from "../../store/messages/messages.types";
import { UserSelect } from "./UserSelect";
import { CreateConversationModal } from "./GroupInfoForm";
import { MessageAttachments } from "./MessageAttachments";
import { SharedFiles } from "./SharedFiles";
import { ChatsInCommon } from "./ChatsInCommon";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import type { User } from "../../store/messages";
import type { AppDispatch } from "../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import { createConversation } from "../../store/messages/messages.thunks";
import { userService } from "../../store/users/users.service";
import { uploadMultipleFilesThunk } from "../../store/storage/storage.thunks";
import type { BUD } from "../utils/BlobUpload";
import toast from "react-hot-toast";

export function ChatWindow({
  messages,
  isCreatingMessage,
  conversationId,
  currentChatUser,
  onConversationCreated,
  onExitCreateMode,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showSharedFiles, setShowSharedFiles] = useState(false);
  const [showChatsInCommon, setShowChatsInCommon] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [messageImages, setMessageImages] = useState<BUD[]>([]);
  const [messageDocs, setMessageDocs] = useState<BUD[]>([]);

  // Anchor and portal dropdown positioning
  const fileButtonRef = useRef<HTMLDivElement | null>(null);
  const fileDropdownRef = useRef<HTMLDivElement | null>(null);
  const [fileDropdownPos, setFileDropdownPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const dispatch = useDispatch<AppDispatch>();

  // Get real-time state from Redux store
  const isConnected = useSelector(
    (state: RootState) => state.messaging.isConnected
  );
  const lastMessage = useSelector(
    (state: RootState) => state.messaging.activeConversation.messages[0]
  );
  const dms = useSelector((state: RootState) => state.messaging.dms);

  // Find the current conversation from DMs
  const currentConversation = dms.find((dm) => dm.id === conversationId);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle user selection from UserSelect component
  const handleUsersSelect = useCallback((selectedUsers: User[]) => {
    setSelectedRecipients(selectedUsers);
  }, []);

  const handleCreateGroup = useCallback(
    (_groupName: string) => {
      setShowGroupModal(false);
    },
    [selectedRecipients]
  );

  // Handle file input change for images
  const handleImageFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      const result = await dispatch(
        uploadMultipleFilesThunk({
          formId: "message_images",
          files,
        })
      ).unwrap();

      const newImages = result.results.map((res: any, index: number) => ({
        key: res.key,
        fileName: files[index].name,
      }));

      setMessageImages((prev) => [...prev, ...newImages]);
      event.target.value = "";
    } catch (error) {
      console.error("Failed to upload images:", error);
    }
  };

  // Handle file input change for documents
  const handleDocFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      const result = await dispatch(
        uploadMultipleFilesThunk({
          formId: "message_docs",
          files,
        })
      ).unwrap();

      const newDocs = result.results.map((res: any, index: number) => ({
        key: res.key,
        fileName: files[index].name,
      }));

      setMessageDocs((prev) => [...prev, ...newDocs]);
      event.target.value = "";
    } catch (error) {
      console.error("Failed to upload documents:", error);
    }
  };

  // Handle file attachment button click - show file type menu
  const handleFileAttachment = () => {
    setShowFileOptions(!showFileOptions);
  };

  const handleImageSelect = () => {
    const imageInput = document.getElementById(
      "image-file-input"
    ) as HTMLInputElement;
    imageInput?.click();
    setShowFileOptions(false);
  };

  const handleDocumentSelect = () => {
    const docInput = document.getElementById(
      "doc-file-input"
    ) as HTMLInputElement;
    docInput?.click();
    setShowFileOptions(false);
  };

  // Clear all attachments
  const clearAttachments = () => {
    setMessageImages([]);
    setMessageDocs([]);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Position and close the file options (portal-based)
  useEffect(() => {
    if (!showFileOptions) return;

    const positionDropdown = () => {
      const anchor = fileButtonRef.current;
      const dropdown = fileDropdownRef.current;
      if (!anchor || !dropdown) return;
      const rect = anchor.getBoundingClientRect();
      const dropdownWidth = dropdown.offsetWidth;
      const dropdownHeight = dropdown.offsetHeight;

      const margin = 8;
      let left =
        rect.left + rect.width / 2 - dropdownWidth / 2 + window.scrollX;
      // try above with 12px gap; if not enough space, place below
      let top = rect.top - dropdownHeight - 12 + window.scrollY;
      if (top < window.scrollY + margin) {
        top = rect.bottom + 12 + window.scrollY;
      }
      // clamp within viewport horizontally
      left = Math.min(
        Math.max(window.scrollX + margin, left),
        window.scrollX + window.innerWidth - dropdownWidth - margin
      );
      setFileDropdownPos({ top, left });
    };

    // initial position after the dropdown renders
    const raf = requestAnimationFrame(positionDropdown);

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        fileDropdownRef.current?.contains(target) ||
        fileButtonRef.current?.contains(target)
      ) {
        return;
      }
      setShowFileOptions(false);
    };

    window.addEventListener("mousedown", handleOutsideClick, true);
    window.addEventListener("scroll", positionDropdown, true);
    window.addEventListener("resize", positionDropdown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousedown", handleOutsideClick, true);
      window.removeEventListener("scroll", positionDropdown, true);
      window.removeEventListener("resize", positionDropdown);
    };
  }, [showFileOptions]);

  useEffect(() => {
    if (lastMessage) {
      console.log("New message received:", lastMessage);
    }
  }, [lastMessage]);

  // Join conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      dispatch({
        type: "socket/joinConversation",
        payload: { conversationId },
      });
    }
  }, [conversationId, dispatch]);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      // Try to get user info from conversation participants first
      if (
        currentConversation?.participants &&
        currentConversation.participants.length > 0
      ) {
        const participant = currentConversation.participants[0];

        if (participant.id) {
          try {
            const details = await userService.fetchUserById(participant.id);
            setUserDetails(details);
            return;
          } catch (error) {
            setUserDetails({
              fullName: participant.name,
              email: "Not available",
              phoneNumber: "Not available",
            });
            return;
          }
        }
      }
    };
    fetchUserDetails();
  }, [currentChatUser, currentConversation]);

  const handleSendMessage = async () => {
    if (isCreatingMessage) {
      if (
        (!newMessage.trim() &&
          messageImages.length === 0 &&
          messageDocs.length === 0) ||
        selectedRecipients.length === 0
      )
        return;

      try {
        const participantIds = selectedRecipients.map((u) => u.id);

        const conversationType: ConversationType =
          participantIds.length === 1 ? "dm" : "group";

        const payload = {
          participantIds,
          type: conversationType,
        };

        const createAction = await dispatch(createConversation(payload));
        const newConversation = unwrapResult(createAction);

        // Send the first message to the new conversation
        dispatch({
          type: "socket/sendMessage",
          payload: {
            conversationId: newConversation.id,
            body: newMessage,
            type: "text",
            messageImages: messageImages.length > 0 ? messageImages : undefined,
            messageDocs: messageDocs.length > 0 ? messageDocs : undefined,
          },
        });

        // Show success toast
        toast.success("Conversation created successfully!");

        // Clear input and reset recipients
        setNewMessage("");
        setMessageImages([]);
        setMessageDocs([]);
        setSelectedRecipients([]);

        // Notify parent component to update UI
        if (onConversationCreated) {
          onConversationCreated(newConversation.id);
        }

        // Exit create mode
        if (onExitCreateMode) {
          onExitCreateMode();
        }
      } catch (error) {
        console.error("Failed to start new conversation:", error);
        toast.error("Failed to create conversation");
      }
    } else {
      if (
        (!newMessage.trim() &&
          messageImages.length === 0 &&
          messageDocs.length === 0) ||
        !conversationId
      )
        return;

      dispatch({
        type: "socket/sendMessage",
        payload: {
          conversationId,
          type: "text",
          body: newMessage,
          messageImages: messageImages.length > 0 ? messageImages : undefined,
          messageDocs: messageDocs.length > 0 ? messageDocs : undefined,
        },
      });

      setNewMessage("");
      setMessageImages([]);
      setMessageDocs([]);
    }
  };

  return (
    <div className="relative flex flex-col h-full overflow-y-auto">
      {!showInfo ? (
        <>
          {/* Header */}
          {isCreatingMessage ? (
            <div className="flex items-center justify-between border-b border-border p-4 bg-white w-full">
              <p className="text-sm text-muted-foreground">To:</p>
              {/* Functionality to select the user for the new message */}
              {/* TODO - This component needs to change, we can add multiple people from here */}
              <div className="p-2 flex-1">
                <UserSelect onUsersSelect={handleUsersSelect} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-border p-4 bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="size-15">
                  <AvatarImage
                    src={currentChatUser?.avatarUrl || "/avatar.png"}
                  />
                  <AvatarFallback>
                    {currentChatUser?.name
                      ? currentChatUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "AB"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {currentChatUser?.name || "Chat Window"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChatUser?.isGroup ? "Group Chat" : "Conversation"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setShowInfo(true)}>
                <Info size={18} />
                View Info
              </Button>
            </div>
          )}

          {/* Messages list */}
          {isCreatingMessage ? (
            <div className="flex-1 p-4 flex items-center justify-center items-end text-sm text-muted-foreground">
              {selectedRecipients.length > 1 ? (
                <div className="text-center">
                  <p className="mb-4">
                    You've selected {selectedRecipients.length} people for this
                    conversation.
                  </p>
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="px-6 py-2 bg-orange-600 text-black rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Give a name or image to this group
                  </button>
                </div>
              ) : selectedRecipients.length === 1 ? (
                <div className="text-center">
                  <p className="mb-2 text-sm">
                    Starting a conversation with {selectedRecipients[0].name}
                  </p>
                  <p>Go ahead and write the first message!</p>
                </div>
              ) : (
                "Go ahead and write the first message!"
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-center gap-3 mb-3 ${
                    msg.isSelf ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar (Receiver side) */}
                  {!msg.isSelf && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {" "}
                      <AvatarImage src={msg.avatar} />{" "}
                      <AvatarFallback className="text-1">
                        {" "}
                        {msg.sender
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}{" "}
                      </AvatarFallback>{" "}
                    </Avatar>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`relative rounded-2xl shadow-sm ${
                      msg.isSelf
                        ? "bg-gray-100 text-gray-800 rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                    style={{
                      maxWidth: "300px",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {/* Text */}
                    {msg.text &&
                      msg.text.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed ${
                            msg.isSelf
                              ? "text-gray-800 text-left"
                              : "text-gray-800 text-left"
                          }`}
                        >
                          {line}
                        </p>
                      ))}

                    {/* Attachments */}
                    {(msg.messageDocs?.length > 0 ||
                      msg.messageImages?.length > 0) && (
                      <div className="mt-2">
                        <MessageAttachments
                          messageImages={msg.messageImages}
                          messageDocs={msg.messageDocs}
                        />
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-1 mt-1 ${
                        msg.isSelf
                          ? "text-orange-100 text-right"
                          : "text-gray-500 text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Avatar (Sender side) */}
                  {msg.isSelf && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {" "}
                      <AvatarImage src={msg.avatar} />{" "}
                      <AvatarFallback className="text-1 capitalize">
                        {" "}
                        {msg.sender
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}{" "}
                      </AvatarFallback>{" "}
                    </Avatar>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Compact File Attachment Preview */}
          {(messageImages.length > 0 || messageDocs.length > 0) && (
            <div className="border-t border-border p-2 bg-gray-50">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-600 font-medium">
                  Attachments:
                </span>

                {/* Image Previews */}
                {messageImages.map((img, idx) => (
                  <div
                    key={`img-${idx}`}
                    className="relative group flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs">📷</span>
                    </div>
                    <span
                      className="text-xs text-blue-800 truncate max-w-[120px]"
                      title={img.fileName}
                    >
                      {img.fileName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newImages = messageImages.filter(
                          (_, i) => i !== idx
                        );
                        setMessageImages(newImages);
                      }}
                      className="w-4 h-4 p-0 text-blue-600 hover:text-red-600 opacity-70 hover:opacity-100"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}

                {/* Document Previews */}
                {messageDocs.map((doc, idx) => (
                  <div
                    key={`doc-${idx}`}
                    className="relative group flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2 hover:bg-green-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">📄</span>
                    </div>
                    <span
                      className="text-xs text-green-800 truncate max-w-[120px]"
                      title={doc.fileName}
                    >
                      {doc.fileName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newDocs = messageDocs.filter((_, i) => i !== idx);
                        setMessageDocs(newDocs);
                      }}
                      className="w-4 h-4 p-0 text-green-600 hover:text-red-600 opacity-70 hover:opacity-100"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}

                {/* Clear All Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAttachments}
                  className="text-xs text-red-600 hover:text-red-700 px-2 py-1 h-auto"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border p-3 flex items-center gap-2 bg-white">
            {/* Hidden file inputs */}
            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileSelect}
              style={{ display: "none" }}
            />
            <input
              id="doc-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
              multiple
              onChange={handleDocFileSelect}
              style={{ display: "none" }}
            />

            {/* File attachment button with portal dropdown */}
            <div className="relative" ref={fileButtonRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileAttachment}
              >
                <Paperclip size={18} />
              </Button>
            </div>
            {showFileOptions &&
              createPortal(
                <div
                  ref={fileDropdownRef}
                  className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-1 min-w-[160px]"
                  style={{
                    top: fileDropdownPos.top,
                    left: fileDropdownPos.left,
                  }}
                >
                  <button
                    onClick={handleImageSelect}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Camera size={16} />
                    Images
                  </button>
                  <button
                    onClick={handleDocumentSelect}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <FileText size={16} />
                    Documents
                  </button>
                </div>,
                document.body
              )}

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send size={18} />
            </Button>
          </div>
        </>
      ) : (
        /* Conversation Info panel */
        <div className="absolute inset-0 h-full w-full bg-white border-l border-border shadow-lg p-4 flex flex-col ">
          <Button
            variant="ghost"
            className="flex-shrink-0 self-start"
            onClick={() => setShowInfo(false)}
          >
            <StepBack />
            Back to Conversation
          </Button>

          <div className="flex mt-4 items-center justify-center">
            <div className="flex-col">
              <Avatar className="size-40 p-4 bg-gray-100 rounded-full">
                <AvatarImage
                  src={currentChatUser?.avatarUrl || "/avatar.png"}
                />
                <AvatarFallback>
                  {currentChatUser?.name
                    ? currentChatUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "RM"}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center font-medium">
                {currentChatUser?.name || "Unknown User"}
              </div>
              <div className="mt-1 text-center text-sm text-muted-foreground">
                {currentChatUser?.isGroup ? "Group Chat" : "Private Chat"}
              </div>
            </div>
          </div>

          <div className="mt-4 border-b flex w-full justify-between pb-3">
            <p className="text-sm">Email</p>
            <p className="text-sm text-muted-foreground">
              {userDetails?.email || "Not available"}
            </p>
          </div>

          <div className="mt-4 flex w-full justify-between pb-3">
            <p className="text-sm">Mobile Phone Number</p>
            <p className="text-sm text-muted-foreground">
              {userDetails?.phoneNumber || "Not available"}
            </p>
          </div>

          <div className="mt-6 mb-2">
            <Button
              variant="ghost"
              className="flex-shrink-0 self-start text-sm"
              onClick={() => setShowSharedFiles((prev) => !prev)}
            >
              Shared Files
              <ChevronDown />
            </Button>
          </div>

          {showSharedFiles && (
            <div className="py-2 m">
              <SharedFiles messages={messages} />
            </div>
          )}

          <div className="mt-6">
            <Button
              variant="ghost"
              className="flex-shrink-0 self-start text-sm"
              onClick={() => setShowChatsInCommon((prev) => !prev)}
            >
              Chats In Common
              <ChevronDown />
            </Button>
          </div>

          {showChatsInCommon && (
            <div className="max-h-64 overflow-y-auto">
              <ChatsInCommon
                currentConversationId={conversationId}
                otherUserId={
                  currentConversation?.participants &&
                  currentConversation.participants.length > 0
                    ? currentConversation.participants[0].id
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Group Info Modal */}
      <CreateConversationModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
