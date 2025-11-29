import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, LogOut, Camera, Save, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI, usersAPI } from "@/services/api";
import { authStorage } from "@/lib/authStorage";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace("/api", "") ||
  "http://localhost:5050";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    dailyWaterGoal: 2000,
    dailySleepGoal: 8,
    avatarUrl: "",
  });

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Load user data
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await authAPI.me();
        if (!mounted || !res?.data) return;

        const user = res.data.data || res.data;

        setUserData({
          name: user.name || "",
          email: user.email || "",
          dailyWaterGoal: user.dailyWaterGoalMl ?? 2000,
          dailySleepGoal: user.dailySleepGoalHrs ?? 8,
          avatarUrl: user.avatarUrl || "",
        });

        if (user.avatarUrl) {
          setPreviewUrl(`${API_BASE}${user.avatarUrl}`);
        }

        authStorage.setUser(user);
      } catch (err) {
        toast({
          title: "Failed to load profile",
          description: "Please try again",
          variant: "destructive",
        });
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Open file selector
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Robust avatar upload using usersAPI (axios instance -> interceptor attaches token)
  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size check
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // File type check
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file",
        variant: "destructive",
      });
      return;
    }

    // Preview first
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setLoadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await usersAPI.uploadAvatar(formData);
      const data = response.data?.data || response.data || {};
      const newAvatar = data.avatarUrl ?? data.avatar ?? "";

      // Update state
      setUserData((prev) => ({
        ...prev,
        avatarUrl: newAvatar,
      }));

      // Update storage
      const currentUser = authStorage.getUser() || {};
      authStorage.setUser({
        ...currentUser,
        avatarUrl: newAvatar,
      });

      toast({
        title: "Avatar updated!",
        description: "Your profile photo has been changed",
      });
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast({
        title: "Upload failed",
        description: err.response?.data?.message || err.message || "Could not upload avatar",
        variant: "destructive",
      });

      // Reset preview if upload fails
      if (userData.avatarUrl) {
        setPreviewUrl(`${API_BASE}${userData.avatarUrl}`);
      } else {
        setPreviewUrl("");
      }
    } finally {
      setLoadingAvatar(false);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    setLoadingSave(true);

    try {
      const updateData = {
        name: userData.name,
        dailyWaterGoalMl: userData.dailyWaterGoal,
        dailySleepGoalHrs: userData.dailySleepGoal,
      };

      const response = await usersAPI.updateProfile(updateData);
      const updatedUser = response.data.data || response.data;

      const currentUser = authStorage.getUser() || {};
      authStorage.setUser({ ...currentUser, ...updatedUser });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved",
      });
    } catch (err) {
      toast({
        title: "Failed to update",
        description: "Could not save changes",
        variant: "destructive",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    authStorage.clearAll();
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
    navigate("/");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-peach/10 to-wellness-lavender/10 pb-24 md:pb-32">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-wellness bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings
          </p>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-wellness text-center mb-6"
        >
          <div className="relative inline-block">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-wellness flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
                {getInitials(userData.name || "U")}
              </div>
            )}

            <Button
              size="icon"
              onClick={handleAvatarClick}
              disabled={loadingAvatar}
              className="absolute bottom-3 right-[calc(50%-3rem)] rounded-full w-8 h-8 shadow-lg"
            >
              {loadingAvatar ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <h2 className="text-xl font-bold">{userData.name || "User"}</h2>
          <p className="text-muted-foreground">{userData.email}</p>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-wellness mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      name: e.target.value,
                    })
                  }
                  className="pl-10 rounded-xl"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={userData.email}
                  disabled
                  className="pl-10 rounded-xl bg-muted cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Daily Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-wellness mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Daily Goals</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Water Goal (ml)</Label>
              <Input
                type="number"
                value={userData.dailyWaterGoal}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    dailyWaterGoal:
                      parseInt(e.target.value) || 0,
                  })
                }
                className="rounded-xl"
                min="0"
                step="100"
              />
            </div>

            <div>
              <Label>Sleep Goal (hours)</Label>
              <Input
                type="number"
                value={userData.dailySleepGoal}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    dailySleepGoal:
                      parseFloat(e.target.value) || 0,
                  })
                }
                className="rounded-xl"
                min="0"
                max="24"
                step="0.5"
              />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={handleSave}
            className="w-full btn-wellness"
            disabled={loadingSave}
          >
            <Save className="w-5 h-5 mr-2" />
            {loadingSave ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-full border-2"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;