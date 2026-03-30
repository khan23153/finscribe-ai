import re

with open('src/app/onboarding/quiz/page.tsx', 'r') as f:
    content = f.read()

old_onComplete = """  const onComplete = async (data: OnboardingData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Failed to save onboarding data');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setIsSubmitting(false);
    }
  };"""

new_onComplete = """  const onComplete = async (data: OnboardingData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        console.error('Failed to save onboarding data');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setIsSubmitting(false);
    } finally {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  };"""

content = content.replace(old_onComplete, new_onComplete)

with open('src/app/onboarding/quiz/page.tsx', 'w') as f:
    f.write(content)
