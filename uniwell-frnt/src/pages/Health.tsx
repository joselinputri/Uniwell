import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import MoodEmoji from "@/components/MoodEmoji";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Moon, Zap, Plus, Dumbbell, Clock, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { healthAPI } from "@/services/api";

type MoodType = "excellent" | "good" | "neutral" | "poor" | "bad";

interface ExerciseLog {
  id: string;
  type: string;
  steps: number;
  duration: number;
  time: string;
  date: string;
}

const Health = () => {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<MoodType>("neutral"); // persisted mood from server
  const [pendingMood, setPendingMood] = useState<MoodType | null>(null); // user selection not yet saved
  const [waterIntake, setWaterIntake] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [notes, setNotes] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [exerciseType, setExerciseType] = useState("");
  const [steps, setSteps] = useState(0);
  const [duration, setDuration] = useState(0);
  const [exerciseTime, setExerciseTime] = useState("");
  const [exerciseDate, setExerciseDate] = useState(new Date().toISOString().split("T")[0]);
  const [loadingSave, setLoadingSave] = useState(false);

  const moods: { type: MoodType; label: string }[] = [
    { type: "excellent", label: "Excellent" },
    { type: "good", label: "Good" },
    { type: "neutral", label: "Neutral" },
    { type: "poor", label: "Poor" },
    { type: "bad", label: "Bad" },
  ];

  const quickWaterButtons = [250, 500, 1000];

  // reusable loader to fetch today's stats and normalize
  const loadToday = async () => {
    try {
      const res = await healthAPI.getTodayStats();
      const d = res?.data?.data ?? res?.data ?? {};
      if (typeof d.waterIntake === "number") setWaterIntake(d.waterIntake);
      if (typeof d.sleepHours === "number") setSleepHours(d.sleepHours);
      if (typeof d.energyLevel === "number") setEnergyLevel(d.energyLevel);
      if (d.mood) setSelectedMood(d.mood as MoodType);
      if (Array.isArray(d.exercises)) setExerciseLogs(d.exercises);
    } catch (err) {
      console.warn("Failed to load health/today", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadToday();
    return () => { mounted = false; };
  }, []);

  const handleAddExercise = () => {
    if (!exerciseType || !exerciseTime) {
      toast({
        title: "Missing information",
        description: "Please fill in exercise type and time.",
        variant: "destructive",
      });
      return;
    }

    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      type: exerciseType,
      steps,
      duration,
      time: exerciseTime,
      date: exerciseDate,
    };

    setExerciseLogs([newLog, ...exerciseLogs]);

    // Reset form
    setExerciseType("");
    setSteps(0);
    setDuration(0);
    setExerciseTime("");
    setExerciseDate(new Date().toISOString().split("T")[0]);

    toast({
      title: "Exercise logged!",
      description: "Your workout has been recorded.",
    });
  };

  const handleDeleteExercise = (id: string) => {
    setExerciseLogs(exerciseLogs.filter((log) => log.id !== id));
    toast({
      title: "Exercise deleted",
      description: "Log has been removed.",
    });
  };

  const handleSave = async () => {
    setLoadingSave(true);
    const moodToSave = pendingMood ?? selectedMood; // use pending if present
    const payload = {
      mood: moodToSave,
      waterMl: waterIntake,
      waterIntake: waterIntake,
      sleepHours,
      energyLevel,
      energy: energyLevel, // some backends expect 'energy'
      notes,
      exercises: exerciseLogs,
    };
    try {
      await healthAPI.saveCheckin(payload);
      // refresh server state to ensure persisted values show up
      await loadToday();
      setPendingMood(null);
      toast({
        title: "Health log saved!",
        description: "Your daily check-in has been recorded.",
      });
    } catch (err) {
      toast({
        title: "Failed to save",
        description: "Could not save health log.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoadingSave(false);
    }
  };

  // Helper to determine which mood should be visually active
  const activeMood = pendingMood ?? selectedMood;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-pink/10 to-wellness-lavender/10 pb-24 md:pb-32">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-wellness-pink to-wellness-lavender bg-clip-text text-transparent">
              Health Check-in
            </span>
          </h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </motion.div>

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-wellness mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Select Your Mood</h2>
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            {moods.map((mood, idx) => (
              <motion.button
                key={mood.type}
                onClick={() => {
                  setPendingMood(mood.type);
                  toast({
                    title: "Mood selected",
                    description: "Mood will be saved when you press Save",
                  });
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all ${
                  activeMood === mood.type ? "bg-gradient-calm shadow-lg scale-105" : "bg-secondary/30 hover:bg-secondary/50"
                }`}
              >
                <MoodEmoji mood={mood.type} size="sm" animated={false} />
                <span className="text-xs font-medium">{mood.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-sm text-center text-muted-foreground mt-3">
            Current mood: <span className="font-semibold capitalize text-primary">{activeMood}</span>
          </p>
        </motion.div>

        {/* Water Intake */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-wellness mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-wellness-sky" />
            <h2 className="text-lg font-semibold">Water Intake</h2>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {quickWaterButtons.map((amount) => (
              <Button
                key={amount}
                onClick={() => setWaterIntake(waterIntake + amount)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                {amount}ml
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-wellness-sky mb-1">{waterIntake}ml</p>
              <p className="text-sm text-muted-foreground">today</p>
            </div>
          </div>
        </motion.div>

        {/* Sleep & Energy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-6"
        >
          <div className="card-wellness">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-wellness-lavender" />
              <h2 className="text-lg font-semibold">Sleep Hours</h2>
            </div>
            <Input
              type="number"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              placeholder="0"
              min="0"
              max="24"
              step="0.5"
              className="text-center text-2xl font-bold h-16 rounded-xl"
            />
            <p className="text-sm text-muted-foreground text-center mt-2">hours of sleep</p>
          </div>

          <div className="card-wellness">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-wellness-orange" />
              <h2 className="text-lg font-semibold">Energy Level</h2>
            </div>
            <div className="space-y-3">
              <Input
                type="range"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                min="0"
                max="100"
                className="w-full"
              />
              <div className="text-center">
                <span className="text-3xl font-bold text-wellness-orange">{energyLevel}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exercise Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-wellness mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-wellness-orange" />
            <h2 className="text-lg font-semibold">Exercise Log</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-2 block">Exercise Type</Label>
              <Input
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                placeholder="e.g., Running, Gym, Yoga"
                className="rounded-xl"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Steps Walked</Label>
              <Input
                type="number"
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                placeholder="0"
                className="rounded-xl"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Duration (minutes)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="0"
                className="rounded-xl"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Time</Label>
              <Input
                type="time"
                value={exerciseTime}
                onChange={(e) => setExerciseTime(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Date</Label>
              <Input
                type="date"
                value={exerciseDate}
                onChange={(e) => setExerciseDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleAddExercise}
            className="w-full mb-4 bg-gradient-to-r from-wellness-orange to-wellness-peach text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>

          {/* Exercise Logs List */}
          {exerciseLogs.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Recent Exercises</h3>
              {exerciseLogs.slice(0, 5).map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-wellness-peach/20 to-wellness-orange/20 p-4 rounded-xl"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{log.type}</h4>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>👟 {log.steps.toLocaleString()} steps</p>
                        <p>⏱ {log.duration} minutes</p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {log.time}
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(log.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExercise(log.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-wellness mb-6"
        >
          <Label className="text-lg font-semibold mb-3 block">Notes (Optional)</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any thoughts to share?"
            className="w-full p-4 rounded-xl border border-border bg-background min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Button onClick={handleSave} className="w-full btn-wellness" disabled={loadingSave}>
            {loadingSave ? "Saving..." : "Save Check-in"}
          </Button>
        </motion.div>
      </div>

      <Navigation />
    </div>
  );
};

export default Health;