import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Item {
  name?: string;
  quantity?: number;
  [key: string]: any;
}

interface Task {
  _id: string;
  agentId: string;
  createdAt: string;
  items: Item[];
}

interface TaskTableProps {
  tasks: Task[];
  onClose: () => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <Table>
          <TableCaption>A list of tasks with their items.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    {task.items && task.items.length > 0 ? (
                      <Table className="border mt-2">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {task.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.FirstName ?? "-"}</TableCell>
                              <TableCell>{item.Phone ?? "-"}</TableCell>
                              <TableCell>{item.Notes ?? "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <span className="text-gray-500">No items</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No tasks available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaskTable;
