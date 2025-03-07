
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
}

const SearchAndFilterBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}: SearchAndFilterBarProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search submissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="reviewed">Reviewed</SelectItem>
          <SelectItem value="processed">Processed</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={typeFilter}
        onValueChange={setTypeFilter}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="update">Updates</SelectItem>
          <SelectItem value="new-info">New Information</SelectItem>
          <SelectItem value="event-rsvp">Event RSVPs</SelectItem>
          <SelectItem value="volunteer">Volunteer</SelectItem>
          <SelectItem value="form_response">Form Responses</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchAndFilterBar;
