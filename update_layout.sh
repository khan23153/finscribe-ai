sed -i 's/<div className="flex justify-between items-center px-1">/<div className="px-1">\n            <ThemeToggle \/>/g' src/app/dashboard/layout.tsx
sed -i 's/<span className="text-sm text-muted font-medium">Theme<\/span>//g' src/app/dashboard/layout.tsx
sed -i 's/<ThemeToggle \/>//g' src/app/dashboard/layout.tsx
