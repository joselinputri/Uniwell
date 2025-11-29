import { motion } from "framer-motion";

interface MoodEmojiProps {
  mood: "excellent" | "good" | "neutral" | "poor" | "bad";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const MoodEmoji = ({ mood, size = "md", animated = true }: MoodEmojiProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  } as const;

  const moodConfigs = {
    excellent: {
      bg: "from-wellness-mint/40 to-wellness-teal/50",
      faceColor: "text-wellness-teal",
      mouthPath: "M 30 55 Q 50 70 70 55",
      eyeY: 35,
    },
    good: {
      bg: "from-wellness-sky/40 to-wellness-mint/50",
      faceColor: "text-wellness-sky",
      mouthPath: "M 35 55 Q 50 65 65 55",
      eyeY: 35,
    },
    neutral: {
      bg: "from-wellness-peach/40 to-wellness-lavender/40",
      faceColor: "text-wellness-peach",
      mouthPath: "M 35 58 L 65 58",
      eyeY: 35,
    },
    poor: {
      bg: "from-wellness-peach/50 to-wellness-pink/60",
      faceColor: "text-wellness-pink",
      mouthPath: "M 35 60 Q 50 52 65 60",
      eyeY: 36,
    },
    bad: {
      bg: "from-wellness-pink/60 to-wellness-rose/70",
      faceColor: "text-wellness-rose",
      mouthPath: "M 30 65 Q 50 50 70 65",
      eyeY: 36,
    },
  } as const;

  const config = moodConfigs[mood];

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-[1.2rem] bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-sm border border-white/60`}
      whileHover={animated ? { scale: 1.05, y: -2 } : {}}
      whileTap={animated ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <svg viewBox="0 0 100 100" className="w-[70%] h-[70%]">
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="26"
          ry="26"
          className="fill-white/80"
        />
        <circle
          cx="35"
          cy={config.eyeY}
          r="4"
          className={config.faceColor}
          fill="currentColor"
        />
        <circle
          cx="65"
          cy={config.eyeY}
          r="4"
          className={config.faceColor}
          fill="currentColor"
        />
        {mood === "bad" && (
          <>
            <line
              x1="28"
              y1="30"
              x2="38"
              y2="40"
              strokeWidth="3"
              strokeLinecap="round"
              className={config.faceColor}
              stroke="currentColor"
            />
            <line
              x1="62"
              y1="40"
              x2="72"
              y2="30"
              strokeWidth="3"
              strokeLinecap="round"
              className={config.faceColor}
              stroke="currentColor"
            />
          </>
        )}
        {mood === "excellent" && (
          <>
            <path
              d="M 30 32 Q 35 28 40 32"
              strokeWidth="3"
              strokeLinecap="round"
              className={config.faceColor}
              stroke="currentColor"
              fill="none"
            />
            <path
              d="M 60 32 Q 65 28 70 32"
              strokeWidth="3"
              strokeLinecap="round"
              className={config.faceColor}
              stroke="currentColor"
              fill="none"
            />
          </>
        )}
        {mood !== "neutral" && (
          <path
            d={config.mouthPath}
            strokeWidth={4}
            strokeLinecap="round"
            className={config.faceColor}
            stroke="currentColor"
            fill="none"
          />
        )}
        {mood === "neutral" && (
          <line
            x1="35"
            y1="58"
            x2="65"
            y2="58"
            strokeWidth={4}
            strokeLinecap="round"
            className={config.faceColor}
            stroke="currentColor"
          />
        )}
      </svg>
    </motion.div>
  );
};

export default MoodEmoji;
