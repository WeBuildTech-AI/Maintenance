import type { ViewMode } from "../purchase-orders/po.types";

export type MessagesHeaderProps = {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setIsCreatingForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface ChatWindowProps {
  messages: { id: number; sender: "me" | "them"; text: string ; avatar: string, timestamp: string}[];
}

// Dummy threads (left panel)
export const dummyMessages = [
  { id: "m1", name: "Alice Johnson", lastMessage: "Hey, how are you?" },
  { id: "m2", name: "Bob Smith", lastMessage: "Let's meet tomorrow." },
  { id: "m3", name: "Charlie Brown", lastMessage: "Can you send me the file?" },
];

export const dummyThreads = [
  { id: "t1", name: "Team Alpha", lastMessage: "Project deadline is next week." },
  { id: "t2", name: "Design Group", lastMessage: "Mockups are ready for review." },
  { id: "t3", name: "Dev Squad", lastMessage: "API integration is complete." },
];

// Dummy conversation messages
export const dummyConversation = {
  m1: [
    { id: 1, sender: "Bob Smith", text: "Hey, how are you?" ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
    { id: 2, sender: "Ashwini Chauhan", text: "I'm good, what about you?" ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
    { id: 3, sender: "Charlie Brown", text: "Doing great!"  ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
  ],
  m2: [
    { id: 1, sender: "Charlie Brown", text: "Let's meet tomorrow at 10am"  ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
    { id: 2, sender: "Ashwini Chauhan", text: "Works for me!"  ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
  ],
  t1: [
    { id: 1, sender: "Ashwini Chauhan", text: "Reminder: project deadline is next week."  ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
    { id: 2, sender: "Charlie Brown", text: "Got it, thanks for the heads up."  ,avatar: "/ashwini.png",timestamp: "26/09/2025, 13:40",},
  ],
};
