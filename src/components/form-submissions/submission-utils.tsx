
import React from "react";
import { Clock, AlertCircle, CheckCircle, Archive } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "reviewed":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "processed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "archived":
      return <Archive className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
