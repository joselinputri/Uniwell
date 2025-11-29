import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Calendar, Wallet, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const features = [
    {
      icon: Heart,
      title: "Health Tracking",
      description: "Monitor your daily wellness with mood, sleep, and water intake tracking",
      color: "from-wellness-coral to-wellness-peach",
    },
    {
      icon: Calendar,
      title: "Smart Schedule",
      description: "Manage academic tasks with intelligent stress detection and reminders",
      color: "from-wellness-sky to-wellness-mint",
    },
    {
      icon: Wallet,
      title: "Smart Finance",
      description: "Track expenses effortlessly by uploading receipt photos with OCR",
      color: "from-wellness-lavender to-wellness-sky",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Visualize your wellness journey with beautiful charts and insights",
      color: "from-wellness-mint to-wellness-peach",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-pink/5 via-wellness-lavender/10 to-wellness-mint/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-wellness-pink to-wellness-lavender text-white px-6 py-2 rounded-full mb-8 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Student Wellness Platform</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="block">Your <span className="bg-gradient-to-r from-wellness-pink to-wellness-lavender bg-clip-text text-transparent">Wellness</span> &</span>
            <span className="block bg-gradient-to-r from-wellness-mint to-wellness-teal bg-clip-text text-transparent">Finance</span> in One Place
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Your all-in-one platform for health tracking, academic planning, and smart finance management.
            Stay balanced, stay focused, stay healthy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="btn-wellness text-lg px-8 py-6 group">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="text-lg px-8 py-6 rounded-full border-2">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground">Powerful features to help you thrive</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="card-wellness group cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-wellness rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Your Wellness Journey?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of students taking control of their health and finances</p>
          <Link to="/register">
            <Button className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full font-semibold">
              Create Free Account
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
