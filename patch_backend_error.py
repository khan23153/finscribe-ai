import re

with open("src/app/api/onboarding/route.ts", "r") as f:
    content = f.read()

old_code = """  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }"""

new_code = """  } catch (error) {
    console.error("[ONBOARDING_API_ERROR]:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }"""

if old_code in content:
    content = content.replace(old_code, new_code)

    with open("src/app/api/onboarding/route.ts", "w") as f:
        f.write(content)
    print("Patch applied successfully")
else:
    print("Could not find code block to replace")
