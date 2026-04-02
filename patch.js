const fs = require('fs');
const path = './src/app/onboarding/quiz/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const [isSubmitting, setIsSubmitting] = useState(false);',
  'const [isSubmitting, setIsSubmitting] = useState(false);\n  const [error, setError] = useState<string | null>(null);'
);

code = code.replace(
  /const submitQuiz = async \(\) => {[\s\S]*?};\n/,
  `const submitQuiz = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        // Force a hard redirect to break the Next.js cache/middleware loop
        window.location.href = '/dashboard';
        return;
      }

      throw new Error("Failed to save onboarding data");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setError("Failed to save preferences. Please try again.");
    }
  };\n`
);

code = code.replace(
  '{/* Actions */}\n        <div className="flex justify-end">\n          <button',
  `{/* Actions */}\n        <div className="flex flex-col items-end gap-4">\n          {error && (\n            <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg font-medium">\n              {error}\n            </div>\n          )}\n          <button`
);

fs.writeFileSync(path, code);
