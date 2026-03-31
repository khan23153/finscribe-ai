import re

with open("src/app/api/onboarding/route.ts", "r") as f:
    content = f.read()

old_code = """    const data = await req.json();
    const { startingBalance, topCategories, savingsGoal } = data;

    if (startingBalance === undefined || !topCategories || savingsGoal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }"""

new_code = """    const data = await req.json();
    let { startingBalance, topCategories, savingsGoal } = data;

    if (startingBalance === undefined || !topCategories || savingsGoal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    startingBalance = Number(String(startingBalance).replace(/[^0-9.]/g, ''));
    savingsGoal = Number(String(savingsGoal).replace(/[^0-9.]/g, ''));

    if (isNaN(startingBalance) || startingBalance < 0 || isNaN(savingsGoal) || savingsGoal < 0) {
      return NextResponse.json({ error: "Invalid numeric value provided" }, { status: 400 });
    }"""

if old_code in content:
    content = content.replace(old_code, new_code)

    with open("src/app/api/onboarding/route.ts", "w") as f:
        f.write(content)
    print("Patch applied successfully")
else:
    print("Could not find code block to replace")
