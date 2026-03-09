function extractResumeData(text) {
  const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);

  const phoneMatch = text.match(/\b\d{10}\b/);

  const lines = text.split("\n").filter((line) => line.trim() !== "");

  const fullName = lines[0];

  return {
    fullName: fullName || "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
  };
}

module.exports = extractResumeData;
