import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('{/* Member Actions */}')
end_pos = text.find('</div>\n                        </div>\n                      );\n                    })', pos)

if pos == -1:
    pos = text.find('/* Member Actions */')
    end_pos = text.find('</div>', text.find('Remover do grupo', pos))

print("pos:", pos, "end_pos:", end_pos)

# Let's check text around pos
print(text[pos:pos+1500])

