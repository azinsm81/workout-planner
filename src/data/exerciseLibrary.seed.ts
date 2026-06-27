import type { Exercise, Region } from "../types";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mk(name: string, region: Region, muscleGroup: string): Exercise {
  return {
    id: `${muscleGroup}-${slugify(name)}`,
    name,
    region,
    muscleGroup,
    isCustom: false,
  };
}

export const exerciseLibrary: Exercise[] = [
  ...["Barbell Bench Press", "Incline Dumbbell Press", "Push-Up", "Cable Chest Fly", "Dips", "Machine Chest Press"]
    .map(name => mk(name, "upper", "chest")),
  ...["Pull-Up", "Lat Pulldown", "Bent-Over Barbell Row", "Seated Cable Row", "Single-Arm Dumbbell Row", "T-Bar Row"]
    .map(name => mk(name, "upper", "back")),
  ...["Shoulder Press", "Front Raise", "Push-Up", "Arnold Press", "Landmine Press"]
    .map(name => mk(name, "upper", "frontDelts")),
  ...["Lateral Raise", "Cable Lateral Raise", "Upright Row", "Y-Raise"]
    .map(name => mk(name, "upper", "sideDelts")),
  ...["Face Pull", "Reverse Pec-Deck Fly", "Bent-Over Rear Delt Raise", "Band Pull-Apart"]
    .map(name => mk(name, "upper", "rearDelts")),
  ...["Barbell Shrug", "Dumbbell Shrug", "Face Pull", "Farmer's Carry"]
    .map(name => mk(name, "upper", "traps")),
  ...["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Chin-Up", "Cable Curl"]
    .map(name => mk(name, "upper", "biceps")),
  ...["Tricep Pushdown", "Skull Crusher", "Close-Grip Bench Press", "Dips", "Overhead Tricep Extension"]
    .map(name => mk(name, "upper", "triceps")),
  ...["Wrist Curl", "Reverse Curl", "Farmer's Carry", "Dead Hang"]
    .map(name => mk(name, "upper", "forearms")),
  ...["Back Squat", "Front Squat", "Leg Press", "Walking Lunge", "Leg Extension", "Goblet Squat"]
    .map(name => mk(name, "lower", "quads")),
  ...["Romanian Deadlift", "Lying Leg Curl", "Seated Leg Curl", "Good Morning", "Nordic Curl"]
    .map(name => mk(name, "lower", "hamstrings")),
  ...["Hip Thrust", "Glute Bridge", "Bulgarian Split Squat", "Cable Glute Kickback", "Sumo Deadlift"]
    .map(name => mk(name, "lower", "glutes")),
  ...["Standing Calf Raise", "Seated Calf Raise", "Single-Leg Calf Raise"]
    .map(name => mk(name, "lower", "calves")),
  ...["Plank", "Hanging Leg Raise", "Cable Crunch", "Russian Twist", "Ab Wheel Rollout"]
    .map(name => mk(name, "lower", "core")),
];

export const UPPER_BODY_ORDER = ["chest", "back", "frontDelts", "sideDelts", "rearDelts", "traps", "biceps", "triceps", "forearms"];
export const LOWER_BODY_ORDER = ["quads", "hamstrings", "glutes", "calves", "core"];

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  frontDelts: "Front Delts",
  sideDelts: "Side Delts",
  rearDelts: "Rear Delts",
  traps: "Traps",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
};
