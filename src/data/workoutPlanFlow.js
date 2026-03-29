export const initialWorkoutPlanForm = {
  mainGoal: '',
  additionalGoals: [],
  bodyGoal: '',
  targetZones: [],
  physicalBuild: '',
  weightChangePattern: '',
  bestShapeTiming: '',
  triedMethods: [],
  pastExperience: '',
  workoutLocation: '',
  gymConfidence: '',
  walkingDaily: '',
  recentWorkoutFrequency: '',
  typicalWorkoutIntensity: '',
  pushUps: '',
  squats: '',
  crunches: '',
  sensitivities: [],
  workoutDuration: '',
  trainingFrequencyPreference: '',
  eatingHabits: '',
  eatingChallenges: [],
  tracksFood: '',
  dietPreference: '',
  proteinPriority: '',
  proteinSupplements: '',
  workSchedule: '',
  typicalDay: '',
  energyLevels: '',
  sleepHours: '',
  waterIntake: '',
  smoking: '',
  alcohol: '',
  age: '',
  heightCm: '',
  currentWeightKg: '',
  goalWeightKg: '',
  importantEvent: '',
  eventDate: '',
  goalConfidence: '',
  motivations: [],
  fullName: '',
  email: ''
};

export const workoutPlanSteps = [
  {
    id: 'goals',
    title: 'Goals',
    description: 'Start with the outcome the user cares about most so we can tailor the rest of the flow.',
    fields: [
      {
        id: 'mainGoal',
        label: "What's your main goal?",
        type: 'choice',
        required: true,
        options: ['Gain muscle', 'Lose weight', 'Lose fat and gain muscle', 'Improve overall fitness']
      },
      {
        id: 'additionalGoals',
        label: 'What else do you hope to achieve with this plan?',
        type: 'multi',
        options: [
          'Get a sculpted and toned body',
          'Increase stamina and endurance',
          'Improve posture and flexibility',
          'Boost sexual drive',
          'None of the above'
        ]
      },
      {
        id: 'bodyGoal',
        label: "What's your body goal?",
        type: 'choice',
        required: true,
        options: ['Lean', 'Athletic', 'Ripped', 'Swole']
      },
      {
        id: 'targetZones',
        label: 'Which target zones matter most?',
        type: 'multi',
        options: ['Belly', 'Pecs', 'Arms', 'Legs', 'Back', 'Full body']
      }
    ]
  },
  {
    id: 'background',
    title: 'Background',
    description: 'A few history questions help shape the right progression, pace, and expectations.',
    fields: [
      {
        id: 'physicalBuild',
        label: 'How would you describe your physical build?',
        type: 'choice',
        required: true,
        options: ['Slender', 'Medium build', 'Stocky', 'Significantly overweight']
      },
      {
        id: 'weightChangePattern',
        label: 'How does your weight typically change?',
        type: 'choice',
        required: true,
        options: [
          'I gain weight fast but lose it slowly',
          'I gain and lose weight easily',
          'I struggle to gain weight or muscle'
        ]
      },
      {
        id: 'bestShapeTiming',
        label: 'How long ago were you in the best shape of your life?',
        type: 'choice',
        options: ['Less than a year ago', '1 to 2 years ago', 'More than 3 years ago', 'Never']
      },
      {
        id: 'triedMethods',
        label: 'Which methods have you already tried?',
        type: 'multi',
        options: [
          'Powerlifting or bodybuilding',
          'Cardio',
          'Bodyweight exercises',
          'Group sports',
          'Diets or meal plans',
          'Personal coaching',
          'Fitness supplements',
          'None of these'
        ]
      },
      {
        id: 'pastExperience',
        label: 'How would you describe your experience with those methods?',
        type: 'choice',
        options: [
          'I lost my shape quickly',
          'It was too difficult for me to stick to those methods',
          "I didn't get fit enough",
          'I was satisfied with the results',
          'My experience was different'
        ]
      }
    ]
  },
  {
    id: 'training',
    title: 'Training Setup',
    description: 'Capture where they train, how active they are, and what capacity they already have.',
    fields: [
      {
        id: 'workoutLocation',
        label: 'Where are you planning to exercise?',
        type: 'choice',
        required: true,
        options: ['Commercial gym', 'Home gym', 'Both']
      },
      {
        id: 'gymConfidence',
        label: 'How confident are you in the gym?',
        type: 'choice',
        required: true,
        options: [
          "I've never been to a gym",
          'I feel lost and unsure of what to do',
          "I know the basics but I'm not sure if I'm doing it right",
          "I'm comfortable but want more guidance",
          'I feel confident and just need a structured plan'
        ]
      },
      {
        id: 'walkingDaily',
        label: 'How much do you walk daily?',
        type: 'choice',
        options: ['Less than 30 minutes', '30 to 60 minutes', 'More than 60 minutes']
      },
      {
        id: 'recentWorkoutFrequency',
        label: 'How many times have you worked out in the last 3 months?',
        type: 'choice',
        options: ['Almost every day', 'Several times a week', 'Several times a month', "I don't work out"]
      },
      {
        id: 'typicalWorkoutIntensity',
        label: 'What best describes your typical workout?',
        type: 'choice',
        options: [
          'Light and gentle',
          'Moderate',
          'Intense'
        ]
      },
      {
        id: 'pushUps',
        label: 'How many push-ups can you do in a row?',
        type: 'choice',
        options: ["I can't do push-ups", '1 to 10 push-ups', '11 to 20 push-ups', '20+ push-ups']
      },
      {
        id: 'squats',
        label: 'How many squats can you do in a row?',
        type: 'choice',
        options: ["I can't do squats", '11 to 20 squats', '21 to 40 squats', '40+ squats']
      },
      {
        id: 'crunches',
        label: 'How many crunches can you do in a row?',
        type: 'choice',
        options: ["I can't do crunches", '11 to 20 crunches', '21 to 40 crunches', '40+ crunches']
      },
      {
        id: 'sensitivities',
        label: 'Do you struggle with any of the following?',
        type: 'multi',
        options: ['Sensitive back', 'Sensitive knees', 'None of the above']
      },
      {
        id: 'workoutDuration',
        label: 'How long do you want your workouts to be?',
        type: 'choice',
        required: true,
        options: ['15 to 30 min', '30 to 45 min', '45 to 60 min', '60+ min', "I don't know"]
      },
      {
        id: 'trainingFrequencyPreference',
        label: 'How many times per week would you like to train?',
        type: 'choice',
        required: true,
        options: ['1 to 2 times', '3 to 4 times', '5+ times']
      }
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'A plan lands much better when food habits and preferences are built in from the start.',
    fields: [
      {
        id: 'eatingHabits',
        label: 'How would you describe your habits?',
        type: 'choice',
        required: true,
        options: [
          'My diet is always on point',
          'I try to eat healthy but old habits get in the way',
          'I simply eat whatever I want'
        ]
      },
      {
        id: 'eatingChallenges',
        label: 'Do any of these eating habits apply?',
        type: 'multi',
        options: [
          'Emotional or boredom eating',
          'Overeating',
          'Late night snacking',
          'Skipping meals too often',
          'None of the above'
        ]
      },
      {
        id: 'tracksFood',
        label: 'Do you usually track your food?',
        type: 'choice',
        options: ['Yes, I track every meal', 'Sometimes, when I remember', 'No, I never do it']
      },
      {
        id: 'dietPreference',
        label: 'What type of diet do you prefer?',
        type: 'choice',
        required: true,
        options: [
          'I enjoy everything',
          'Traditional',
          'With meat',
          'Vegetarian',
          'Vegan',
          'Mediterranean',
          'Pescatarian',
          'Paleo',
          'Keto',
          'Keto Vegan',
          'Lactose free',
          'Gluten free'
        ]
      },
      {
        id: 'proteinPriority',
        label: 'How important is protein in your current routine?',
        type: 'choice',
        options: [
          "It's one of my top priorities",
          "I try to eat enough, but I don't track it",
          "It's not a big focus"
        ]
      },
      {
        id: 'proteinSupplements',
        label: 'Do you take protein supplements?',
        type: 'choice',
        options: ['Yes', 'No']
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    description: 'Daily schedule, recovery, and energy levels change what a realistic plan should look like.',
    fields: [
      {
        id: 'workSchedule',
        label: "What's your work schedule like?",
        type: 'choice',
        options: ['9 to 5', 'Night shifts', 'My hours are flexible', "I'm retired or not working right now"]
      },
      {
        id: 'typicalDay',
        label: 'How would you describe your typical day?',
        type: 'choice',
        options: ['Mostly sitting', 'Constantly on my feet', 'Balanced mix of sitting and moving', 'It changes daily']
      },
      {
        id: 'energyLevels',
        label: 'How are your energy levels during the day?',
        type: 'choice',
        options: ['Low and inconsistent', 'Steady', 'They fluctuate', 'High all day']
      },
      {
        id: 'sleepHours',
        label: 'How much sleep do you usually get?',
        type: 'choice',
        options: ['Less than 5 hours', '5 to 6 hours', '7 to 8 hours', 'More than 8 hours']
      },
      {
        id: 'waterIntake',
        label: "What's your daily water intake?",
        type: 'choice',
        options: ['Mostly coffee or tea', 'About 2 glasses', '2 to 6 glasses', 'More than 6 glasses']
      },
      {
        id: 'smoking',
        label: 'Do you smoke?',
        type: 'choice',
        options: ['Yes, regularly', 'Only occasionally', 'Only when I drink', "No, I've quit", "No, I've never smoked"]
      },
      {
        id: 'alcohol',
        label: 'How often do you drink alcohol?',
        type: 'choice',
        options: ['Several times a week', 'Several times a month', 'On rare special occasions', 'Never']
      }
    ]
  },
  {
    id: 'stats',
    title: 'Stats & Timeline',
    description: 'The measurements and timeline help the coach build a realistic progression and target date.',
    fields: [
      {
        id: 'age',
        label: 'What is your age?',
        type: 'number',
        required: true,
        min: 13,
        max: 120,
        placeholder: '22'
      },
      {
        id: 'heightCm',
        label: 'What is your height in centimeters?',
        type: 'number',
        required: true,
        min: 50,
        max: 300,
        placeholder: '176'
      },
      {
        id: 'currentWeightKg',
        label: 'What is your current weight in kilograms?',
        type: 'number',
        required: true,
        min: 20,
        max: 500,
        placeholder: '72'
      },
      {
        id: 'goalWeightKg',
        label: 'What is your goal weight in kilograms?',
        type: 'number',
        required: true,
        min: 20,
        max: 500,
        placeholder: '90'
      },
      {
        id: 'importantEvent',
        label: 'Do you have an important event coming up?',
        type: 'choice',
        options: [
          'Vacation',
          'Competition',
          'Important date',
          'Outdoor adventure',
          'Birthday',
          'Holiday',
          'Reunion',
          'Family occasion',
          'Wedding',
          'Other',
          'No event any time soon'
        ]
      },
      {
        id: 'eventDate',
        label: 'When is your event?',
        type: 'date'
      },
      {
        id: 'goalConfidence',
        label: 'How confident are you about reaching your goal?',
        type: 'choice',
        options: ["I believe I can do it", "I'm uncertain, but willing to try", "I'm still unsure"]
      }
    ]
  },
  {
    id: 'contact',
    title: 'Motivation & Contact',
    description: 'Finish with motivation and contact details so the coach can build and send the right program.',
    fields: [
      {
        id: 'motivations',
        label: "What's your motivation to get in shape?",
        type: 'multi',
        required: true,
        options: [
          'Look better and more attractive',
          'Feel more confident in my body',
          'Support a healthy immune system',
          'Have more strength for daily tasks',
          'Feel healthier and more energetic',
          'Other'
        ]
      },
      {
        id: 'fullName',
        label: "What's your name?",
        type: 'text',
        required: true,
        placeholder: 'Avi'
      },
      {
        id: 'email',
        label: 'Where should we send your plan?',
        type: 'email',
        required: true,
        placeholder: 'you@example.com'
      }
    ]
  }
];
