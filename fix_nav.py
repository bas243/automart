import re

with open('assets/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Check current header height variable usage
hh = '--header-height' in css
print('header-height var found:', hh)

# Add a padding-top rule for the navList so items clear the header area
# We'll add it right after the #navList.open rule
extra = """
  /* Push nav items below the visible header strip */
  #navList > li:first-child { margin-top: 64px; }
  /* The top close-strip is the first child spacer */
  #navList > .nav-mobile-spacer { position:fixed!important; top:0; left:0; right:0; background:rgba(16,16,36,1); z-index:1; display:flex!important; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.12); margin-top:0!important; }
"""

# Only append if not already added
if 'nav-mobile-spacer' not in css:
    with open('assets/css/style.css', 'a', encoding='utf-8') as f:
        f.write("\n/* === MOBILE NAV SPACER === */\n@media (max-width: 768px) {" + extra + "\n}\n")
    print('Spacer CSS added')
else:
    print('Already present')
