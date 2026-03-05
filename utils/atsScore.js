const atsScore = (jobSkills, userSkills) => {
  let score = 0;

  jobSkills.forEach((skill) => {
    if (userSkills.includes(skill)) {
      score += 20;
    }
  });

  return score;
};

module.exports = atsScore;
