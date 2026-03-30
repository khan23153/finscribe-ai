import re

with open('src/app/dashboard/goals/page.tsx', 'r') as f:
    content = f.read()

# Replace initialGoals with empty array
content = re.sub(r'const initialGoals: Goal\[\] = \[[^\]]+\]', 'const initialGoals: Goal[] = []', content)

# Check rendering of goals and add empty state: "No goals set yet. Create your first goal!"
old_str = """      {/* SECTION B - Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {"""

new_str = """      {/* SECTION B - Goal Cards */}
      {goals.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          <p>No goals set yet. Create your first goal!</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {"""

content = content.replace(old_str, new_str)

# Need to close the ) : ( at the end of goals
old_str2 = """        })}
      </div>
    </div>
  )
}"""

new_str2 = """        })}
      </div>
      )}
    </div>
  )
}"""

content = content.replace(old_str2, new_str2)

with open('src/app/dashboard/goals/page.tsx', 'w') as f:
    f.write(content)
