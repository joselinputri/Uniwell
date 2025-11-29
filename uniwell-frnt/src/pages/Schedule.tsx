import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronLeft, ChevronRight, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tasksAPI } from "@/services/api";

interface Task {
  id: number | string;
  title: string;
  date: string;
  time: string;
  priority: "high" | "medium" | "low";
  category: string;
  completed: boolean;
}

const Schedule = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00", // ✅ FIXED: Default time instead of empty
    priority: "medium" as Task["priority"],
    category: "Academic",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January","February","March","April","May","June","July","August","September","October","November","December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  // ✅ FIXED: Better task normalization with proper time handling
  const normalizeTask = (t: any): Task => {
    let taskDate = new Date().toISOString().split("T")[0];
    let taskTime = "00:00";

    // Priority: explicit date/time > dueAt
    if (t.date) {
      taskDate = String(t.date).split("T")[0];
    } else if (t.dueAt) {
      const dueAtDate = new Date(t.dueAt);
      if (!isNaN(dueAtDate.getTime())) {
        taskDate = dueAtDate.toISOString().split("T")[0];
        taskTime = dueAtDate.toTimeString().slice(0, 5);
      }
    }

    if (t.time) {
      taskTime = t.time;
    }

    console.log("📋 Normalized task:", { id: t.id, date: taskDate, time: taskTime });

    return {
      id: t.id ?? t._id ?? `${Date.now()}-${Math.random()}`,
      title: t.title ?? "",
      date: taskDate,
      time: taskTime,
      priority: (String(t.priority || "medium") as Task["priority"]),
      category: t.category ?? "Academic",
      completed: !!t.completed,
    };
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await tasksAPI.getAll();
        if (mounted && Array.isArray(res.data)) {
          const normalized = res.data.map((t: any) => normalizeTask(t));
          console.log("✅ Loaded tasks:", normalized);
          setTasks(normalized);
        }
      } catch (err) {
        console.warn("Failed to load tasks", err);
      }
    };
    load();
    
    // ✅ FIXED: Proper event listener
    const handleUpdate = () => {
      console.log("🔄 Tasks updated, reloading...");
      load();
    };
    
    window.addEventListener("tasksUpdated", handleUpdate);
    
    return () => {
      mounted = false;
      window.removeEventListener("tasksUpdated", handleUpdate);
    };
  }, []);

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const getTasksForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((task) => (task.date ?? "").startsWith(dateStr));
  };

  const calculateStressLevel = () => {
    if (tasks.length === 0) return 0;
    const totalWeight = tasks.reduce((s, t) => {
      const p = String(t.priority ?? "medium").toLowerCase();
      return s + (p === "high" ? 3 : p === "medium" ? 2 : 1);
    }, 0);
    const maxCapacity = 5 * 3;
    return Math.min(100, Math.round((totalWeight / maxCapacity) * 100));
  };

  const stressLevel = calculateStressLevel();

  // ✅ FIXED: Proper task creation with time
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title || !newTask.time) {
      toast({ 
        title: "Incomplete task", 
        description: "Please fill task title and time.", 
        variant: "destructive" 
      });
      return;
    }

    console.log("📝 Creating task with:", newTask);

    const payload = {
      title: newTask.title,
      date: newTask.date,
      time: newTask.time, // ✅ Send time to backend
      priority: newTask.priority,
      category: newTask.category,
      completed: false,
    };

    try {
      const res = await tasksAPI.create(payload);
      const createdRaw = res?.data ?? res?.data?.data ?? payload;
      const created = normalizeTask(createdRaw);
      
      console.log("✅ Task created:", created);
      
      setTasks((prev) => [...prev, created]);

      // ✅ FIXED: Dispatch event to update dashboard
      window.dispatchEvent(new Event("tasksUpdated"));
      
      setNewTask({ 
        title: "", 
        date: new Date().toISOString().split("T")[0], 
        time: "09:00", 
        priority: "medium", 
        category: "Academic" 
      });
      setShowAddForm(false);
      
      toast({ title: "Task added", description: "Your task has been created." });
    } catch (err) {
      console.error("Failed to add task:", err);
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (id: string | number) => {
    try {
      await tasksAPI.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      
      // ✅ FIXED: Dispatch event to update dashboard
      window.dispatchEvent(new Event("tasksUpdated"));
      
      toast({ title: "Task deleted" });
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new Event("tasksUpdated"));
      toast({ title: "Task deleted" });
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-32 bg-gradient-to-br from-background via-wellness-teal/10 to-wellness-lavender/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-wellness-teal to-wellness-lavender bg-clip-text text-transparent">My Schedule</span>
          </h1>
          <p className="text-muted-foreground">Manage your tasks & deadlines</p>
        </motion.div>

        {/* Stress Level Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card-wellness mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wellness-orange to-wellness-pink flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">Stress Level</p>
              <p className="text-sm text-muted-foreground">Based on your workload</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stressLevel}%</p>
            </div>
          </div>

          <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${stressLevel}%` }} 
              transition={{ duration: 1, delay: 0.5 }} 
              className={`h-full rounded-full ${
                stressLevel > 70 
                  ? "bg-gradient-to-r from-wellness-pink to-wellness-rose" 
                  : stressLevel > 40 
                  ? "bg-gradient-to-r from-wellness-peach to-wellness-orange" 
                  : "bg-gradient-to-r from-wellness-mint to-wellness-teal"
              }`} 
            />
          </div>

          {stressLevel > 70 && (
            <p className="text-sm text-wellness-pink mt-2">
              ⚠️ High stress detected - remember to take breaks!
            </p>
          )}
        </motion.div>

        {/* Calendar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="card-wellness mb-6 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} 
              className="rounded-full hover:bg-secondary h-7 w-7"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-sm font-semibold md:text-base">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} 
              className="rounded-full hover:bg-secondary h-7 w-7"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1 text-[0.68rem] md:text-xs">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center font-semibold text-muted-foreground py-0.5">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} className="h-7" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const tasksForDay = getTasksForDate(day);
              const isToday = 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear();
              
              return (
                <motion.div 
                  key={day} 
                  whileHover={{ scale: 1.03 }} 
                  className={`h-7 rounded-md px-1 flex flex-col items-center justify-center relative cursor-pointer transition-all text-[0.7rem] md:text-xs ${
                    isToday 
                      ? "bg-gradient-wellness text-white font-bold shadow-md" 
                      : tasksForDay.length > 0 
                      ? "bg-secondary/40 hover:bg-secondary/70" 
                      : "hover:bg-secondary/30"
                  }`}
                >
                  <span>{day}</span>
                  {tasksForDay.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {tasksForDay.slice(0, 2).map(t => (
                        <div 
                          key={t.id} 
                          className={`w-1 h-1 rounded-full ${
                            t.priority === "high" 
                              ? "bg-wellness-pink" 
                              : t.priority === "medium" 
                              ? "bg-wellness-orange" 
                              : "bg-wellness-mint"
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Task Form & List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="card-wellness"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Upcoming Tasks</h2>
            <Button 
              className="rounded-full bg-gradient-to-r from-wellness-teal to-wellness-mint text-white" 
              size="sm" 
              onClick={() => setShowAddForm(p => !p)}
            >
              <Plus className="w-4 h-4 mr-1" />
              {showAddForm ? "Close" : "Add Task"}
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTask} className="mb-4 space-y-3">
              <Input 
                placeholder="Task title" 
                className="rounded-xl" 
                value={newTask.title} 
                onChange={(e) => setNewTask(t => ({...t, title: e.target.value}))} 
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  type="date" 
                  className="rounded-xl" 
                  value={newTask.date} 
                  onChange={(e) => setNewTask(t => ({...t, date: e.target.value}))} 
                />
                {/* ✅ FIXED: Time input with proper value */}
                <Input 
                  type="time" 
                  className="rounded-xl" 
                  value={newTask.time} 
                  onChange={(e) => setNewTask(t => ({...t, time: e.target.value}))} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Category" 
                  className="rounded-xl" 
                  value={newTask.category} 
                  onChange={(e) => setNewTask(t => ({...t, category: e.target.value}))} 
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(t => ({...t, priority: e.target.value as Task["priority"]}))}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Button 
                type="submit" 
                className="w-full rounded-xl bg-gradient-to-r from-wellness-teal to-wellness-mint text-white"
              >
                Save Task
              </Button>
            </form>
          )}

          <div className="space-y-3">
            {tasks
              .slice()
              .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`).getTime();
                const dateB = new Date(`${b.date}T${b.time}`).getTime();
                return dateA - dateB;
              })
              .map((task, i) => (
                <motion.div 
                  key={task.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.4 + i * 0.08 }} 
                  className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/40 hover:from-secondary/30 hover:to-secondary/50 transition-all flex items-start justify-between"
                >
                  <div className="flex items-start gap-3 mb-2 flex-1">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => setTasks(prev => prev.map(t => 
                        t.id === task.id ? {...t, completed: !t.completed} : t
                      ))} 
                      className="mt-1 w-5 h-5 rounded border-2 border-wellness-pink text-wellness-pink" 
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h3>
                        <span 
                          className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                            task.priority === "high" 
                              ? "bg-wellness-pink/20 text-wellness-pink" 
                              : task.priority === "medium" 
                              ? "bg-wellness-orange/20 text-wellness-orange" 
                              : "bg-wellness-mint/20 text-wellness-mint"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className={`text-sm text-muted-foreground mb-2 ${task.completed ? "line-through" : ""}`}>
                        {/* ✅ FIXED: Show time properly */}
                        {new Date(task.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {task.time}
                      </p>
                      <span className="inline-block px-2 py-1 rounded-lg text-xs bg-primary/10 text-primary">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>

      <Navigation />
    </div>
  );
};

export default Schedule;
