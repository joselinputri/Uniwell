import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Heart, Calendar, Wallet, Droplets, Moon, Zap } from "lucide-react";
import MoodEmoji from "@/components/MoodEmoji";
import { healthAPI, tasksAPI, authAPI, expensesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/utils/helpers";
import type { MoodType } from "@/lib/constants";

interface TodayStats {
  mood?: MoodType;
  waterIntake?: number;
  waterGoal?: number;
  sleepHours?: number;
  sleepGoal?: number;
  energyLevel?: number;
}

interface Task {
  id: number | string;
  title: string;
  dueDate?: string;
  priority?: "high" | "medium" | "low" | string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userName, setUserName] = useState("User");
  const [todayStats, setTodayStats] = useState<TodayStats>({
    mood: "neutral",
    waterIntake: 0,
    waterGoal: 2000,
    sleepHours: 0,
    sleepGoal: 8,
    energyLevel: 50,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesTotal, setExpensesTotal] = useState(0);

  // ✅ FIXED: Proper fetch function
  const fetchAllData = useCallback(async () => {
    let mounted = true;
    setLoading(true);
    
    try {
      // Check authentication
      const token = localStorage.getItem("token");
      if (!token) {
        if (mounted) navigate("/login");
        return;
      }

      // Fetch user profile
      try {
        const meRes = await authAPI.me();
        if (mounted && meRes?.data) {
          const user = meRes.data.data || meRes.data;
          setUserName(user.name || "User");
        }
      } catch (err) {
        console.warn("Failed to load user:", err);
        if (mounted) {
          toast({
            title: "Session expired",
            description: "Please login again",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
      }

      // Fetch today's health stats
      try {
        const statsRes = await healthAPI.getTodayStats();
        if (mounted && statsRes?.data) {
          const data = statsRes.data.data || statsRes.data;
          setTodayStats(prev => ({
            ...prev,
            mood: data.mood || prev.mood,
            waterIntake: data.waterIntake ?? prev.waterIntake,
            waterGoal: data.waterGoal ?? prev.waterGoal,
            sleepHours: data.sleepHours ?? prev.sleepHours,
            sleepGoal: data.sleepGoal ?? prev.sleepGoal,
            energyLevel: data.energyLevel ?? prev.energyLevel,
          }));
        }
      } catch (err) {
        console.warn("Failed to load health stats:", err);
      }

      // Fetch upcoming tasks
      try {
        const tasksRes = await tasksAPI.getUpcoming();
        console.log("📥 Raw tasks API response:", tasksRes?.data);
        
        if (mounted && tasksRes?.data) {
          const taskData = tasksRes.data.data || tasksRes.data;
          const tasks = Array.isArray(taskData) ? taskData : [];
          console.log("✅ Dashboard loaded tasks:", tasks.length, "tasks", tasks);
          setUpcomingTasks(tasks);
        } else {
          console.warn("⚠️ No tasks data received");
          if (mounted) setUpcomingTasks([]);
        }
      } catch (err) {
        console.error("❌ Failed to load tasks:", err);
        // Set empty array on error to show "no tasks" message
        if (mounted) setUpcomingTasks([]);
      }

      // Fetch expenses for dashboard summary
      try {
        const expRes = await expensesAPI.getAll();
        const list = (expRes?.data?.data ?? expRes?.data ?? []);
        const total = Array.isArray(list) ? list.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0) : 0;
        setExpensesTotal(total);
      } catch (err) {
        console.warn("Failed to load expenses:", err);
      }
    } finally {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  // ✅ FIXED: Load data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ✅ FIXED: Listen to global updates with proper cleanup
  useEffect(() => {
    const handleTasksUpdate = () => {
      console.log("🔄 Tasks updated event received");
      fetchAllData();
    };
    
    const handleExpensesUpdate = () => {
      console.log("🔄 Expenses updated event received");
      fetchAllData();
    };

    window.addEventListener("tasksUpdated", handleTasksUpdate);
    window.addEventListener("expensesUpdated", handleExpensesUpdate);

    return () => {
      window.removeEventListener("tasksUpdated", handleTasksUpdate);
      window.removeEventListener("expensesUpdated", handleExpensesUpdate);
    };
  }, [fetchAllData]);

  // ✅ FIXED: Quick stats with proper gradient backgrounds
  const quickStats = [
    {
      icon: Heart,
      label: "Health",
      value: loading ? "Loading..." : todayStats.mood ? "Logged" : "No data",
      color: "from-wellness-pink to-wellness-rose",
      path: "/health",
    },
    {
      icon: Calendar,
      label: "Tasks",
      value: loading ? "Loading..." : `${upcomingTasks.length} Pending`,
      color: "from-wellness-sky to-wellness-mint",
      path: "/schedule",
    },
    {
      icon: Wallet,
      label: "Expenses",
      value: loading ? "Loading..." : formatRupiah(expensesTotal),
      color: "from-wellness-orange to-wellness-rose",
      path: "/finance",
    },
  ];

  const waterPercentage = todayStats.waterGoal 
    ? Math.round((todayStats.waterIntake! / todayStats.waterGoal) * 100)
    : 0;

  const sleepPercentage = todayStats.sleepGoal
    ? Math.round((todayStats.sleepHours! / todayStats.sleepGoal) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-peach/10 to-wellness-mint/10 pb-24 md:pb-32">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hello, <span className="bg-gradient-wellness bg-clip-text text-transparent">{userName}</span>!
          </h1>
          <p className="text-muted-foreground">Here's your wellness overview for today</p>
        </motion.div>

        {/* Today's Mood */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }} 
          className="card-wellness mb-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">Today's Mood</p>
          <div className="flex justify-center mb-3">
            <MoodEmoji mood={(todayStats.mood as MoodType) || "neutral"} size="lg" />
          </div>
          <p className="text-lg font-semibold capitalize">{todayStats.mood || "neutral"}</p>
          <Link to="/health" className="text-sm text-primary hover:underline mt-2 inline-block">
            Update mood →
          </Link>
        </motion.div>

        {/* Today's Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="card-wellness text-center p-4">
            <Droplets className="w-6 h-6 text-wellness-sky mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Water</p>
            <p className="text-lg font-bold">{todayStats.waterIntake ?? 0}ml</p>
            <p className="text-xs text-muted-foreground">of {todayStats.waterGoal ?? 2000}ml</p>
            <div className="w-full bg-secondary/30 rounded-full h-1.5 mt-2">
              <div 
                className="bg-wellness-sky h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(waterPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="card-wellness text-center p-4">
            <Moon className="w-6 h-6 text-wellness-lavender mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Sleep</p>
            <p className="text-lg font-bold">{todayStats.sleepHours ?? 0}h</p>
            <p className="text-xs text-muted-foreground">of {todayStats.sleepGoal ?? 8}h</p>
            <div className="w-full bg-secondary/30 rounded-full h-1.5 mt-2">
              <div 
                className="bg-wellness-lavender h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(sleepPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="card-wellness text-center p-4">
            <Zap className="w-6 h-6 text-wellness-orange mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Energy</p>
            <p className="text-lg font-bold">{todayStats.energyLevel ?? 0}%</p>
            <p className="text-xs text-muted-foreground">level</p>
            <div className="w-full bg-secondary/30 rounded-full h-1.5 mt-2">
              <div 
                className="bg-wellness-orange h-1.5 rounded-full transition-all"
                style={{ width: `${todayStats.energyLevel ?? 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Access Cards - FIXED GRADIENT BACKGROUNDS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="grid md:grid-cols-3 gap-4 mb-6"
        >
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.path}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }} 
                  className="card-wellness cursor-pointer"
                >
                  {/* ✅ FIXED: Proper gradient with inline style backup */}
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg`}
                    style={{
                      background: stat.label === "Health" 
                        ? "linear-gradient(135deg, hsl(340, 75%, 70%) 0%, hsl(350, 70%, 75%) 100%)"
                        : stat.label === "Tasks"
                        ? "linear-gradient(135deg, hsl(200, 70%, 80%) 0%, hsl(175, 60%, 75%) 100%)"
                        : "linear-gradient(135deg, hsl(30, 90%, 70%) 0%, hsl(350, 70%, 75%) 100%)"
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="card-wellness"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Tasks
            </h2>
            <Link to="/schedule" className="text-sm text-primary font-medium hover:underline">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-secondary/30 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-3">No upcoming tasks</p>
                <Link to="/schedule">
                  <button className="text-sm text-primary hover:underline">
                    Create your first task →
                  </button>
                </Link>
              </div>
            ) : (
              upcomingTasks.slice(0, 3).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium mb-1">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.dueDate || "No date"}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {task.priority || "medium"}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <Navigation />
    </div>
  );
};

export default Dashboard;
