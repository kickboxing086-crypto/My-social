const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const snapshot = await getDocs\(qMsgs\);\n\s*snapshot\.forEach\(async \(msgDoc\) => \{\n\s*try \{\n\s*await updateDoc\(doc\(db, 'messages', msgDoc\.id\), \{ topic: cleanTopic \}\);\n\s*\} catch \(msgErr\) \{\n\s*console\.error\("Error updating message topic:", msgErr\);\n\s*\}\n\s*\}\);/g,
  `const snapshot = await getDocs(qMsgs);
      const updatePromises = snapshot.docs.map(msgDoc => 
        updateDoc(doc(db, 'messages', msgDoc.id), { topic: cleanTopic })
      );
      await Promise.all(updatePromises);`
);

fs.writeFileSync('src/App.tsx', code);
