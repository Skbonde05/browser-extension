import React, { useState } from 'react';

const steps = [
  {
    title: '👀 What is BrowsePing?',
    text: 'BrowsePing shows who else is browsing the same page in real time.',
  },
  {
    title: '📡 Presence Tracking',
    text: 'Your presence is page-based. No browsing history is shared.',
  },
  {
    title: '🔒 Privacy Controls',
    text: 'You control your visibility and can turn it off anytime.',
  },
];

const Onboarding = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step === steps.length - 1) {
      onFinish();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>{steps[step].title}</h2>
      <p>{steps[step].text}</p>

      <div style={{ marginTop: 16 }}>
        <button onClick={onFinish}>Skip</button>
        <button onClick={next} style={{ marginLeft: 8 }}>
          {step === steps.length - 1 ? 'Start' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
