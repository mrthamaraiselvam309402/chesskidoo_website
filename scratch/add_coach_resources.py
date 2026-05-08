import re

def update_db_js():
    with open('d:/MY/chessk/assets/js/db.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Add mock resources if not exists
    mock_resources = """
  resources: [
    { id: 'R1', name: 'Mating_Puzzles.pdf', batch: 1, type: 'Homework', notes: 'Review before Friday' },
    { id: 'R2', name: 'Endgame_Basics.pdf', batch: 2, type: 'Homework', notes: 'Read chapter 1' },
    { id: 'R3', name: 'Opening_Principles.pdf', batch: 1, type: 'Class Notes', notes: 'Memorize lines' },
    { id: 'R4', name: 'Tactics_Test.pdf', batch: 3, type: 'Homework', notes: 'Complete by Sunday' }
  ],
"""
    if 'resources:' not in js:
        # Just inject it somewhere safe, e.g., after `attendance: [` or something
        if 'classes: [' in js:
            js = js.replace('classes: [', mock_resources + '  classes: [')
        elif 'attendance: [' in js:
            js = js.replace('attendance: [', mock_resources + '  attendance: [')
        else:
            # If db.js is very empty, we just append it
            js += "\n// Injected Mock Resources\nCK.db.resources = " + mock_resources.replace("resources: [", "[").replace("],", "];")
    
    with open('d:/MY/chessk/assets/js/db.js', 'w', encoding='utf-8') as f:
        f.write(js)

def update_coach_js():
    with open('d:/MY/chessk/assets/js/coach.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Add 'resources' to nav titles
    if 'resources: \'Homework & Notes\'' not in js:
        js = js.replace(
            "puzzles: 'Assign Puzzles'",
            "puzzles: 'Assign Puzzles',\n      resources: 'Homework & Notes'"
        )

    # Call renderResources when navigating
    if "if(panelId === 'resources') this.renderResources();" not in js:
        js = js.replace(
            "document.getElementById('coachTopBtn').style.display = (panelId === 'notes') ? 'block' : 'none';",
            "document.getElementById('coachTopBtn').style.display = (panelId === 'notes') ? 'block' : 'none';\n    if(panelId === 'resources') this.renderResources();"
        )

    # Add renderResources method
    render_resources_method = """
  renderResources() {
    const container = document.getElementById('coachResourcesContainer');
    if (!container) return;

    const resources = CK.db.resources || [];
    
    if (resources.length === 0) {
      container.innerHTML = '<div style="opacity:0.6; padding:20px; text-align:center;">No resources uploaded yet.</div>';
      return;
    }

    // Group by Batch
    const grouped = resources.reduce((acc, res) => {
      const b = res.batch || 'Unassigned';
      if (!acc[b]) acc[b] = [];
      acc[b].push(res);
      return acc;
    }, {});

    let html = '';
    
    for (const [batchStr, files] of Object.entries(grouped)) {
      html += `
        <div style="margin-bottom: 24px;">
          <h4 style="font-family: var(--font-display); font-size: 1.2rem; color: var(--p-gold); margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            Batch ${batchStr}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
      `;
      
      files.forEach(f => {
        const typeBadge = f.type === 'Homework' ? 'p-badge-rose' : 'p-badge-blue';
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:var(--p-surface3); border-radius:8px;">
              <div>
                <div style="font-weight:600; color:var(--p-text); display:flex; align-items:center; gap:8px;">
                  📄 ${f.name} <span class="p-badge ${typeBadge}" style="font-size:0.7rem; padding: 2px 6px;">${f.type || 'Material'}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--p-text-muted); margin-top:4px;">📝 Note: ${f.notes}</div>
              </div>
              <button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.showToast('Downloading ${f.name}...', 'success')">Download</button>
            </div>
        `;
      });
      
      html += `</div></div>`;
    }

    container.innerHTML = html;
  },
"""
    if 'renderResources()' not in js:
        js = js.replace(
            "async renderDashboard() {",
            render_resources_method + "\n  async renderDashboard() {"
        )

    with open('d:/MY/chessk/assets/js/coach.js', 'w', encoding='utf-8') as f:
        f.write(js)

def update_admin_js():
    with open('d:/MY/chessk/assets/js/admin.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Enhance handleResourceUpload to push to mock DB and re-render
    upload_logic = """
      // Push to our local mock DB for grouping display
      if (!CK.db.resources) CK.db.resources = [];
      CK.db.resources.push({
        id: 'R' + Date.now(),
        name: file.name,
        batch: parseInt(form.batch.value) || 'Unassigned',
        type: form.type ? form.type.value : 'Material',
        notes: form.notes ? form.notes.value : ''
      });
      
      CK.showToast("File Uploaded Successfully!", "success");
      CK.closeModal('uploadModal');
      
      // If coach is doing this, refresh their view
      if (window.location.hash === '#coach' && CK.coach && CK.coach.renderResources) {
        CK.coach.renderResources();
      }
"""
    if 'CK.db.resources.push(' not in js:
        js = js.replace(
            "if (upErr) throw upErr;",
            "if (upErr) throw upErr;\n" + upload_logic
        )
        
        # Add fallback for offline mode
        fallback_logic = """
      } else {
        // Fallback for offline mode
        if (!CK.db.resources) CK.db.resources = [];
        CK.db.resources.push({
          id: 'R' + Date.now(),
          name: file ? file.name : customName,
          batch: parseInt(form.batch.value) || 'Unassigned',
          type: form.type ? form.type.value : 'Material',
          notes: form.notes ? form.notes.value : ''
        });
        CK.showToast("File saved locally (offline mode).", "info");
        CK.closeModal('uploadModal');
        if (window.location.hash === '#coach' && CK.coach && CK.coach.renderResources) {
          CK.coach.renderResources();
        }
      }
"""
        js = js.replace(
            "} else {\n        throw new Error('Supabase not available or offline.');\n      }",
            fallback_logic
        )

    with open('d:/MY/chessk/assets/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(js)

update_db_js()
update_coach_js()
update_admin_js()
print("Updated coach resources logic successfully.")
