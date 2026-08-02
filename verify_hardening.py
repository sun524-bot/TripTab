from pathlib import Path
files=['dashboard.html','trip.html','js/utils.js']
for rel in files:
    text=Path(rel).read_text(encoding='utf-8')
    print('--- '+rel+' ---')
    lines=[f'{i}: {line}' for i,line in enumerate(text.splitlines(),1) if 'innerHTML' in line or 'escapeHtml' in line]
    print('\n'.join(lines[:20]) if lines else 'No matches')
