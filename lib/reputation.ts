export function getReputationLevel(points: number) {
  if (points <= 50) {
    return { 
      name: "Beginner", 
      nextPoints: 51, 
      percent: Math.min(100, Math.max(0, (points / 50) * 100)) 
    };
  } else if (points <= 200) {
    const rangePoints = points - 50;
    return { 
      name: "Contributor", 
      nextPoints: 201, 
      percent: Math.min(100, Math.max(0, (rangePoints / 150) * 100)) 
    };
  } else if (points <= 500) {
    const rangePoints = points - 200;
    return { 
      name: "Mentor", 
      nextPoints: 501, 
      percent: Math.min(100, Math.max(0, (rangePoints / 300) * 100)) 
    };
  } else {
    return { 
      name: "Expert", 
      nextPoints: null, 
      percent: 100 
    };
  }
}
