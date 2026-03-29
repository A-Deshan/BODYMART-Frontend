import { useMemo, useState } from 'react';
import { initialWorkoutPlanForm, workoutPlanSteps } from '../data/workoutPlanFlow.js';
import { submitWorkoutPlanRequest } from '../services/storeApi.js';

const workflowNotes = [
  'Answer each step in a few quick choices or short fields.',
  'The admin team reviews the request and shapes the plan around your answers.',
  'Your completed workout plan is sent directly to your email.'
];

const stepSupportCopy = {
  goals: 'This step defines what success looks like so the final plan pushes toward the right physique and outcome.',
  background: 'Your history tells us what has and has not worked before, which helps avoid repeating the wrong approach.',
  training: 'Training environment, confidence, and current capacity decide how technical and demanding the plan should be.',
  nutrition: 'The best training plan still depends on food habits, so we collect just enough nutrition context to keep it realistic.',
  lifestyle: 'Recovery, schedule, and daily energy affect volume, intensity, and how hard the plan can push week to week.',
  stats: 'Measurements and timing help shape a realistic pace, target, and progression.',
  contact: 'A little motivation context plus contact details gives the admin everything needed to build and send the plan.'
};

function isFilled(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return String(value ?? '').trim() !== '';
}

function formatSnapshotValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value ?? '').trim();
}

function shouldRenderField(field, form) {
  if (field.id === 'eventDate') {
    return isFilled(form.importantEvent) && form.importantEvent !== 'No event any time soon';
  }

  return true;
}

function validateField(field, value, form) {
  if (!shouldRenderField(field, form)) {
    return '';
  }

  if (field.required && !isFilled(value)) {
    return `${field.label} is required.`;
  }

  if ((field.type === 'email' || field.id === 'email') && isFilled(value)) {
    const email = String(value).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }
  }

  if (field.type === 'number' && isFilled(value)) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return `${field.label} must be a valid number.`;
    }

    if (field.min !== undefined && parsed < field.min) {
      return `${field.label} must be at least ${field.min}.`;
    }

    if (field.max !== undefined && parsed > field.max) {
      return `${field.label} must be ${field.max} or less.`;
    }
  }

  if (field.id === 'eventDate' && shouldRenderField(field, form) && !isFilled(value)) {
    return 'Please select your event date.';
  }

  return '';
}

function calculateProgress(stepIndex) {
  return ((stepIndex + 1) / workoutPlanSteps.length) * 100;
}

function getFieldHelperText(field) {
  if (field.type === 'multi') {
    return 'Choose all that apply.';
  }

  if (field.type === 'choice') {
    return 'Choose the option that fits best right now.';
  }

  if (field.type === 'date') {
    return 'Add this only if you are aiming for a specific event or deadline.';
  }

  return 'Use your current best estimate.';
}

export default function WorkoutPlanPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(initialWorkoutPlanForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentStep = workoutPlanSteps[stepIndex];
  const progress = calculateProgress(stepIndex);
  const nextStep = workoutPlanSteps[stepIndex + 1] || null;

  const planSnapshot = useMemo(() => {
    let weightDelta = '';

    if (form.currentWeightKg && form.goalWeightKg) {
      const delta = Number(form.goalWeightKg) - Number(form.currentWeightKg);
      if (delta > 0) {
        weightDelta = `Gain ${delta} kg`;
      } else if (delta < 0) {
        weightDelta = `Lose ${Math.abs(delta)} kg`;
      } else {
        weightDelta = 'Maintain current weight';
      }
    }

    return [
      { label: 'Goal', value: form.mainGoal },
      { label: 'Body Goal', value: form.bodyGoal },
      { label: 'Location', value: form.workoutLocation },
      { label: 'Schedule', value: form.trainingFrequencyPreference },
      { label: 'Duration', value: form.workoutDuration },
      { label: 'Target', value: weightDelta }
    ].filter((item) => isFilled(item.value));
  }, [
    form.bodyGoal,
    form.currentWeightKg,
    form.goalWeightKg,
    form.mainGoal,
    form.trainingFrequencyPreference,
    form.workoutDuration,
    form.workoutLocation
  ]);

  function updateField(fieldId, value) {
    setForm((prev) => ({ ...prev, [fieldId]: value }));
    setError('');
  }

  function toggleMultiValue(fieldId, value) {
    setForm((prev) => {
      const currentValues = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];

      if (value === 'None of the above') {
        return { ...prev, [fieldId]: currentValues.includes(value) ? [] : [value] };
      }

      const filteredValues = currentValues.filter((item) => item !== 'None of the above');
      const nextValues = filteredValues.includes(value)
        ? filteredValues.filter((item) => item !== value)
        : [...filteredValues, value];

      return { ...prev, [fieldId]: nextValues };
    });
    setError('');
  }

  function validateStep(index) {
    const fields = workoutPlanSteps[index].fields.filter((field) => shouldRenderField(field, form));

    for (const field of fields) {
      const fieldError = validateField(field, form[field.id], form);
      if (fieldError) {
        return fieldError;
      }
    }

    return '';
  }

  function validateStepsThrough(lastIndex) {
    for (let index = 0; index <= lastIndex; index += 1) {
      const fieldError = validateStep(index);
      if (fieldError) {
        return { index, message: fieldError };
      }
    }

    return null;
  }

  function goToStep(nextIndex) {
    if (nextIndex > stepIndex) {
      const validationResult = validateStepsThrough(nextIndex - 1);
      if (validationResult) {
        setError(validationResult.message);
        setStepIndex(validationResult.index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setStepIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNext() {
    const fieldError = validateStep(stepIndex);
    if (fieldError) {
      setError(fieldError);
      return;
    }

    goToStep(Math.min(stepIndex + 1, workoutPlanSteps.length - 1));
  }

  function handlePrevious() {
    goToStep(Math.max(stepIndex - 1, 0));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationResult = validateStepsThrough(workoutPlanSteps.length - 1);

    if (validationResult) {
      setError(validationResult.message);
      setStepIndex(validationResult.index);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitWorkoutPlanRequest({
        ...form,
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        currentWeightKg: Number(form.currentWeightKg),
        goalWeightKg: Number(form.goalWeightKg)
      });
      setMessage(`Thanks, ${form.fullName}. Your workout plan request is on its way to the admin team.`);
      setForm(initialWorkoutPlanForm);
      setStepIndex(0);
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'We could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="simple-page-hero simple-page-hero-home">
        <div className="inner simple-page-hero-grid">
          <div className="simple-page-copy">
            <p className="eyebrow">Workout Plan</p>
            <h2>Request a workout plan built around your goal and schedule.</h2>
            <p className="simple-page-text">
              Answer a few guided questions and the admin team will turn them into a practical plan you can follow with
              confidence.
            </p>
            <div className="simple-tag-row">
              <span className="simple-tag">About 3 minutes</span>
              <span className="simple-tag">Step by step</span>
              <span className="simple-tag">Delivered by email</span>
            </div>
          </div>

          <aside className="simple-page-panel">
            <p className="eyebrow">How It Works</p>
            <h3>A short intake with clear steps from start to finish.</h3>
            <ul className="simple-note-list workout-simple-notes">
              {workflowNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <main className="main simple-page-main">
        {message && (
          <section className="inner workout-success">
            <strong>{message}</strong>
            <p>Keep an eye on your inbox. The admin can reply directly with your personalized training plan.</p>
          </section>
        )}

        <section className="inner workout-plan-layout workout-plan-layout-simple">
          <aside className="workout-progress-card workout-progress-card-simple">
            <div className="workout-progress-top">
              <div>
                <p className="eyebrow">Progress</p>
                <strong>{currentStep.title}</strong>
              </div>
              <span className="workout-step-count">Step {stepIndex + 1} of {workoutPlanSteps.length}</span>
            </div>
            <div className="workout-progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="workout-progress-meta">
              <div>
                <span>Questions in this step</span>
                <strong>{currentStep.fields.filter((field) => shouldRenderField(field, form)).length}</strong>
              </div>
              <div>
                <span>Next up</span>
                <strong>{nextStep ? nextStep.title : 'Send request'}</strong>
              </div>
            </div>
            <div className="workout-step-note">
              <strong>Why this step matters</strong>
              <p>{stepSupportCopy[currentStep.id] || currentStep.description}</p>
            </div>
            <div className="workout-step-list">
              {workoutPlanSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`workout-step-pill${index === stepIndex ? ' active' : ''}`}
                  onClick={() => goToStep(index)}
                >
                  <span>{index + 1}</span>
                  {step.title}
                </button>
              ))}
            </div>

            <div className="workout-snapshot">
              <h4>Current Summary</h4>
              {planSnapshot.length > 0 ? (
                planSnapshot.map((item) => (
                  <div key={item.label} className="snapshot-row">
                    <span>{item.label}</span>
                    <strong>{formatSnapshotValue(item.value)}</strong>
                  </div>
                ))
              ) : (
                <p>Your selections will start appearing here as you move through the intake.</p>
              )}
            </div>
          </aside>

          <form className="workout-form-card workout-form-card-simple" onSubmit={handleSubmit}>
            <div className="workout-step-head">
              <p className="eyebrow">Current Step</p>
              <h4>{currentStep.title}</h4>
              <p>{currentStep.description}</p>
            </div>

            <div className="workout-form-tip">
              <strong>Keep it simple</strong>
              <p>Choose the closest fit for where you are right now. Clear answers are more helpful than perfect ones.</p>
            </div>

            <div className="workout-field-stack">
              {currentStep.fields.filter((field) => shouldRenderField(field, form)).map((field) => (
                <div key={field.id} className="workout-field">
                  <div className="workout-field-head">
                    <label>{field.label}</label>
                    <p>{getFieldHelperText(field)}</p>
                  </div>

                  {(field.type === 'choice' || field.type === 'multi') && (
                    <div className={`workout-choice-grid${field.type === 'multi' ? ' compact' : ''}`}>
                      {field.options.map((option) => {
                        const active =
                          field.type === 'choice'
                            ? form[field.id] === option
                            : Array.isArray(form[field.id]) && form[field.id].includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            className={`workout-choice-card${active ? ' active' : ''}`}
                            onClick={() => {
                              if (field.type === 'choice') {
                                updateField(field.id, option);
                              } else {
                                toggleMultiValue(field.id, option);
                              }
                            }}
                          >
                            <span>{option}</span>
                            {active && <small>Selected</small>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {['text', 'email', 'number', 'date'].includes(field.type) && (
                    <input
                      type={field.type}
                      value={form[field.id]}
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      onChange={(event) => updateField(field.id, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && <p className="plan-error">{error}</p>}

            <div className="workout-form-actions">
              <button type="button" className="ghost-btn" onClick={handlePrevious} disabled={stepIndex === 0 || submitting}>
                Previous
              </button>

              {stepIndex === workoutPlanSteps.length - 1 ? (
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send My Request'}
                </button>
              ) : (
                <button type="button" className="primary" onClick={handleNext}>
                  Continue to {nextStep?.title || 'Next step'}
                </button>
              )}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
