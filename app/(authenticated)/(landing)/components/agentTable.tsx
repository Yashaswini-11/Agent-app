"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import TaskTable from "@/components/taskTable";

interface Agent {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

const AgentTable = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/agents", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [token]);

  if (loading) {
    return <p className="text-center py-4">Loading agents...</p>;
  }

  const fetchTasks = async (id: string) => {
    try {
      console.log("Fetching tasks for agent ID:", id);
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTasks(data.tasks || []);
      setOpen(true); 
      console.log("Fetched tasks:", data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  return (
    <div className="p-2">
      <Table className="border rounded-lg shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.length > 0 ? (
            agents.map((agent) => (
              <TableRow
                key={agent._id}
                onClick={() => fetchTasks(agent._id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{agent.mobile}</TableCell>
                <TableCell>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                No agents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {open && tasks.length > 0 && (
        <div className="mt-4">
          <TaskTable tasks={tasks} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default AgentTable;
