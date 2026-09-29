import os
import re

files_to_check = []
for root, dirs, files in os.walk('Client/src'):
    for file in files:
        if file.endswith('.jsx'):
            files_to_check.append(os.path.join(root, file))

modified_count = 0

for file_path in files_to_check:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for common pagination patterns
    # Pattern 1: {* Pagination Footer *} ... </div>
    pattern1 = re.compile(r'\{\s*/\*\s*Pagination Footer\s*\*/\s*\}.*?<div.*?Items per page:.*?</div>\s*</div>\s*</div>', re.DOTALL)
    
    # Let's write specific replacements based on the text found.
    # It's safer to extract the length variable name.
    
    match = re.search(r'Showing \{[^\}]+\} of \{([^\}]+)\}', content)
    if not match:
        match = re.search(r'filteredRecords\.length === 0\s*\?\s*"0 [^"]+"\s*:\s*`\$\{.*?\} \D+ \$\{Math\.min\([^,]+,\s*([^,]+),', content)
    
    if not match:
        match = re.search(r'disabled=\{\(page \+ 1\) \* rowsPerPage >= ([^\}]+)\}', content)
    
    if match and ('<ChevronLeftIcon' in content or "Prev" in content or "FirstPage" in content):
        total_var = match.group(1).strip()
        
        # Replace the entire footer div
        # We need to find the start of the footer
        
        # Find the footer comment
        footer_idx = content.find('{/* Pagination Footer */}')
        if footer_idx == -1:
            footer_idx = content.find('{/* Footer Pagination */}')
            
        if footer_idx != -1:
            # Find the next div
            start_idx = footer_idx
            
            # Simple assumption: the footer is the last thing before the closing </div> of the table container,
            # or it is a self-contained block.
            # It's better to just regex replace the known patterns.
            pass

print(f"Done")
