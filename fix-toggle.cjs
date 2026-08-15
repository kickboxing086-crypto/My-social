const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleToggleTopicStatus = `  const handleToggleTopicStatus = async (targetGroupId: string, topicName: string) => {
    const groupObj = groups.find(g => g.id === targetGroupId);
    if (!groupObj) return;
    
    const isGrpAdmin = groupObj.owners.includes(currentUser?.username || '') || isGeneralAdmin;
    if (!isGrpAdmin) return;
    
    const closedTopics = groupObj.closedTopics || [];
    const isClosed = closedTopics.includes(topicName);
    
    const newClosedTopics = isClosed 
      ? closedTopics.filter(t => t !== topicName)
      : [...closedTopics, topicName];
      
    try {
      await updateDoc(doc(db, 'groups', targetGroupId), { closedTopics: newClosedTopics });
      setGroups(prev => prev.map(g => g.id === targetGroupId ? { ...g, closedTopics: newClosedTopics } : g));
      if (groupSettingsTarget && groupSettingsTarget.id === targetGroupId) {
        setGroupSettingsTarget({ ...groupSettingsTarget, closedTopics: newClosedTopics });
      }
    } catch (err) {
      console.error('Error toggling topic status:', err);
      showAlert('Erro ao alterar status do tópico.', 'ERRO', 'error');
    }
  };
`;

code = code.replace(
  /const handleEditTopicInGroup = async \(targetGroupId: string, oldTopicName: string, newTopicName: string\) => \{/g,
  handleToggleTopicStatus + '\n  const handleEditTopicInGroup = async (targetGroupId: string, oldTopicName: string, newTopicName: string) => {'
);

fs.writeFileSync('src/App.tsx', code);
