function scoreCredibility({ description = '', evidenceCount = 0, hasWitness = false }) {
  let score = 40;

  if (description.length >= 200) score += 20;
  if (description.length >= 500) score += 10;
  if (evidenceCount > 0) score += Math.min(20, evidenceCount * 5);
  if (hasWitness) score += 10;

  const bounded = Math.max(0, Math.min(100, score));

  return {
    score: bounded,
    tier: bounded >= 75 ? 'high' : bounded >= 50 ? 'medium' : 'low',
  };
}

function calculateCredibilityDelta({ nextStatus, rejectionType = null, strongEvidence = false }) {
  if (nextStatus === 'resolved') {
    return strongEvidence ? 20 : 15;
  }

  if (nextStatus === 'rejected') {
    if (rejectionType === 'insufficient') return -5;
    if (rejectionType === 'false') return -15;
    if (rejectionType === 'malicious') return -40;
  }

  return 0;
}

module.exports = {
  scoreCredibility,
  calculateCredibilityDelta,
};
