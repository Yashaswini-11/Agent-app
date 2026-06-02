"use client";

import React, { useState, useRef, useEffect } from "react";
import AgentForm from "./components/agentForm";
import { toast } from "sonner";
import AgentTable from "./components/agentTable";
import { Button } from "@/components/ui/button";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";
import { useAuth } from "@/context/AuthContext";

const Page = () => {
  const [showForm, setShowForm] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAgentSubmit = async (agent: any) => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(agent),
    });

    const data = await res.json();
    console.log("Response:", data);
    if (res.ok) {
      setShowForm(false);
      toast.success("Agent added successfully");
    } else {
      toast.error(data.message || "Failed to add agent");
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only CSV, XLSX, and XLS files are allowed.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(extension || "")) {
      toast.error("Invalid file extension.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/docs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("File uploaded successfully!");
        console.log("Uploaded file response:", data);
      } else {
        toast.error(data.message || "File upload failed");
      }
    } catch (error) {
      toast.error("File upload failed. Please try again.");
      console.error(error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-center items-center mb-4 space-x-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Agents List
        </h2>
      </div>

      <div className="space-x-2">
        <div className="flex justify-end space-x-2 mb-6">
          {isClient && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              onChange={handleUploadFile}
            />
          )}
          <Button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Upload File
          </Button>

          <Button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Agent
          </Button>
        </div>
      </div>

      {showForm && (
        <AgentForm
          onSubmit={handleAgentSubmit}
          onClose={() => setShowForm(false)}
          open={false}
        />
      )}
      <AgentTable />
      <AgentForm
        onSubmit={handleAgentSubmit}
        onClose={() => setShowForm(false)}
        open={showForm}
      />
    </div>
  );
};

export default Page;