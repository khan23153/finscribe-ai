sed -i "s/signOut(() => window.location.href = '\/')/signOut({ redirectUrl: '\/' })/g" src/app/dashboard/settings/page.tsx
