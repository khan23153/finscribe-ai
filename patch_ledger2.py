import re

with open('src/app/dashboard/ledger/page.tsx', 'r') as f:
    content = f.read()

# Replace mapping with condition
old_str = """      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map(entity => ("""

new_str = """      {activeTab === 'entities' && (
        entities.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
            <p>No contacts yet. Add someone above.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map(entity => ("""

content = content.replace(old_str, new_str)

# Need to close the ) : ( at the end of entities
# The entities mapping block ends before SECTION D
old_str2 = """        </div>
      )}

      {/* SECTION D - Transaction History */}"""

new_str2 = """        </div>
        )
      )}

      {/* SECTION D - Transaction History */}"""

content = content.replace(old_str2, new_str2)

with open('src/app/dashboard/ledger/page.tsx', 'w') as f:
    f.write(content)
