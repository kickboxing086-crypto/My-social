import sys

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Update Reports section in Admin View to add "Responder" button & show reply
old_rep_card = """                    <div key={rep.id} className="bg-zinc-900/80 border border-red-900/20 p-3 rounded-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${rep.type === 'profanity' ? 'bg-red-950/50 border border-red-800 text-red-400' : 'bg-orange-950/50 border border-orange-800 text-orange-400'}`}>
                          {rep.type === 'profanity' ? 'AUTO-BANIMENTO' : 'DENÚNCIA'}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm mb-1">
                        Alvo: <span className="text-white font-bold">{rep.reportedUser}</span>
                      </p>
                      <p className="text-zinc-500 text-xs mb-2">Reportado por: {rep.reportedBy}</p>
                      <div className="bg-black p-2 text-red-200 text-sm italic border-l-2 border-red-900/50">
                        "{rep.reason}"
                      </div>
                    </div>"""

new_rep_card = """                    <div key={rep.id} className="bg-zinc-900/80 border border-red-900/20 p-3 rounded-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${rep.type === 'profanity' ? 'bg-red-950/50 border border-red-800 text-red-400' : 'bg-orange-950/50 border border-orange-800 text-orange-400'}`}>
                            {rep.type === 'profanity' ? 'AUTO-BANIMENTO' : 'DENÚNCIA'}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm mb-1">
                          Alvo: <span className="text-white font-bold">{rep.reportedUser}</span>
                        </p>
                        <p className="text-zinc-500 text-xs mb-2">Reportado por: {rep.reportedBy}</p>
                        <div className="bg-black p-2 text-red-200 text-sm italic border-l-2 border-red-900/50 mb-2">
                          "{rep.reason}"
                        </div>
                        {rep.adminReply && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-2">
                            <span className="font-bold text-fuchsia-400">Resposta enviada pelo Admin:</span> {rep.adminReply}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setAdminReplyTarget({ id: rep.id, type: 'report', user: rep.reportedBy, text: rep.reason })}
                        className="mt-2 w-full py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        RESPONDER AUTOR DA DENÚNCIA
                      </button>
                    </div>"""

code = code.replace(old_rep_card, new_rep_card)

# 2. Update Suggestions section in Admin View to add "Responder" button & show reply
old_sug_card = """                    <div key={sug.id} className="bg-zinc-900/80 border border-blue-900/20 p-3 rounded-sm">
                      <p className="text-blue-300 text-sm mb-1 font-bold">
                        Enviado por: {sug.sender}
                      </p>
                      <div className="bg-black p-3 text-blue-100 text-sm border-l-2 border-blue-900/50 rounded-sm">
                        {sug.text}
                      </div>
                    </div>"""

new_sug_card = """                    <div key={sug.id} className="bg-zinc-900/80 border border-blue-900/20 p-3 rounded-sm flex flex-col justify-between">
                      <div>
                        <p className="text-blue-300 text-sm mb-1 font-bold">
                          Enviado por: {sug.sender}
                        </p>
                        <div className="bg-black p-3 text-blue-100 text-sm border-l-2 border-blue-900/50 rounded-sm mb-2">
                          {sug.text}
                        </div>
                        {sug.adminReply && (
                          <div className="bg-fuchsia-950/40 p-2 text-fuchsia-200 text-xs border border-fuchsia-800/60 rounded mb-2">
                            <span className="font-bold text-fuchsia-400">Resposta enviada pelo Admin:</span> {sug.adminReply}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setAdminReplyTarget({ id: sug.id, type: 'suggestion', user: sug.sender, text: sug.text })}
                        className="mt-2 w-full py-1.5 bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-800 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        RESPONDER SUGESTÃO
                      </button>
                    </div>"""

code = code.replace(old_sug_card, new_sug_card)

# 3. Add Members & Push buttons into header
old_header_btns = """            {/* Suggestion Modal Button */}
            <button 
              onClick={() => setShowSuggestionModal(true)} 
              className="p-2 sm:px-2.5 sm:py-1 text-blue-400 hover:text-blue-300 bg-blue-950/30 border border-blue-900/60 rounded-sm transition-colors flex items-center gap-1"
              title="Enviar Sugestão"
            >"""

new_header_btns = """            {/* Members Button */}
            <button
              onClick={() => setShowMembersModal(true)}
              className="p-2 sm:px-2.5 sm:py-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/80 rounded-sm transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Ver Membros do Grupo"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Membros ({allMembers.length})</span>
            </button>

            {/* Push Notification Toggle Button */}
            <button
              onClick={requestPushPermission}
              className={`p-2 sm:px-2.5 sm:py-1 rounded-sm border transition-colors flex items-center gap-1.5 text-xs font-bold ${
                pushPermission === 'granted' 
                  ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700' 
                  : 'text-amber-400 bg-amber-950/40 border-amber-800'
              }`}
              title={pushPermission === 'granted' ? 'Notificações de Push Ativadas' : 'Ativar Notificações Push'}
            >
              {pushPermission === 'granted' ? <Bell className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4 text-amber-400" />}
              <span className="hidden md:inline">{pushPermission === 'granted' ? 'Push ON' : 'Ativar Push'}</span>
            </button>

            {/* Suggestion Modal Button */}
            <button 
              onClick={() => setShowSuggestionModal(true)} 
              className="p-2 sm:px-2.5 sm:py-1 text-blue-400 hover:text-blue-300 bg-blue-950/30 border border-blue-900/60 rounded-sm transition-colors flex items-center gap-1"
              title="Enviar Sugestão"
            >"""

code = code.replace(old_header_btns, new_header_btns)

# 4. Insert all modals in chat return JSX
old_modals_render = """      {showPolicy && renderPrivacyPolicy()}
      {renderReportModal()}
      {renderSuggestionModal()}
      {renderDeleteModal()}
      {renderAlertModal()}"""

new_modals_render = """      {showPolicy && renderPrivacyPolicy()}
      {renderReportModal()}
      {renderSuggestionModal()}
      {renderDeleteModal()}
      {renderAlertModal()}
      {renderMembersModal()}
      {renderAdminReplyModal()}
      {renderDeleteUserConfirmModal()}
      {renderMicPermissionModal()}
      {renderPushToast()}"""

code = code.replace(old_modals_render, new_modals_render)

# 5. Add Microphone permission trigger button in bottom input bar
old_mic_btn = """              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-sm border transition-all ${
                  isRecording 
                    ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' 
                    : 'bg-zinc-900 text-emerald-600 border-emerald-900/50 hover:text-emerald-400 hover:bg-emerald-950/30'
                }`}
                title={isRecording ? 'Finalizar áudio' : 'Gravar áudio'}
              >
                <Mic className="w-4 h-4" />
              </button>"""

new_mic_btn = """              <button
                type="button"
                onClick={toggleRecording}
                onContextMenu={(e) => {
                  e.preventDefault();
                  requestMicPermissionWithAnimation();
                }}
                className={`p-2.5 rounded-sm border transition-all ${
                  isRecording 
                    ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' 
                    : 'bg-zinc-900 text-emerald-600 border-emerald-900/50 hover:text-emerald-400 hover:bg-emerald-950/30'
                }`}
                title={isRecording ? 'Finalizar áudio' : 'Gravar áudio (Clique longo para testar microfone)'}
              >
                <Mic className="w-4 h-4" />
              </button>"""

code = code.replace(old_mic_btn, new_mic_btn)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("Step 6 applied successfully!")
