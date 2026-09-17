import re

with open('Sidebar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the import for HousekeepingIcon
content = re.sub(r'\s*CleaningServices as HousekeepingIcon,\n', '\n', content)

# Remove state definitions
content = re.sub(r'\s*const \[isHousekeepingOpen, setIsHousekeepingOpen\] = useState\(isHousekeepingPath\);\n', '\n', content)
content = re.sub(r'\s*const isHousekeepingActive = isHousekeepingPath;\n', '\n', content)

# Remove handleToggleHousekeeping
content = re.sub(r'\s*const handleToggleHousekeeping = \(\) => \{[\s\S]*?\};\n', '\n', content)

# Remove the Housekeeping UI block
content = re.sub(r'\s*\{\/\* Housekeeping Dropdown Menu Item \*\/\}[\s\S]*?\{\/\* Rooms Module \*\/\}', '\n\n          {/* Rooms Module */}', content)

with open('Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
