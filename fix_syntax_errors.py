with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix 1: Remove duplicate )} around line 2361
text = text.replace(
    """                             </div>
                           )}
                           )}
                         </div>""",
    """                             </div>
                           )}
                         </div>"""
)

# Fix 2: Remove dangling )} around line 4267
text = text.replace(
    """                    <span className="text-emerald-400 text-xs font-bold">
                      {msg.sender}
                    </span>
                    )}
                  </div>""",
    """                    <span className="text-emerald-400 text-xs font-bold">
                      {msg.sender}
                    </span>
                  </div>"""
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Syntax errors fixed!")
