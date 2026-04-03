import re
import os

def minify_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL) # Remove comments
    css = re.sub(r'\s+', ' ', css) # Extra whitespace to single space
    css = re.sub(r'\s*([{:;,])\s*', r'\1', css) # Remove spaces around delimiters
    return css.strip()

def minify_js(js):
    # Remove multiline comments safely
    js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
    
    # Simple line-by-line minification
    minified_lines = []
    for line in js.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith('//'):
            minified_lines.append(stripped)
            
    return '\n'.join(minified_lines)


css_files = ['style.css', 'css/dashboard.css', 'css/auth.css', 'css/components.css']
js_files = ['js/main.js', 'js/auth.js', 'js/quiz.js', 'js/leaderboard.js']

with open('css/bundle.min.css', 'w', encoding='utf-8') as f:
    for file in css_files:
        if os.path.exists(file):
            with open(file, 'r', encoding='utf-8') as src:
                f.write(minify_css(src.read()))

with open('js/bundle.min.js', 'w', encoding='utf-8') as f:
    for file in js_files:
        if os.path.exists(file):
            with open(file, 'r', encoding='utf-8') as src:
                f.write(minify_js(src.read()))

print("Minification complete!")
