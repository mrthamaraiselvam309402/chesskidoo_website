/* assets/js/certs.js
   ChessKidoo — Certificate Generator
   Uses jsPDF (loaded from CDN) to create downloadable PDF certificates
   for each level completed. Works fully client-side, no server needed. */

window.CK = window.CK || {};

CK.certs = (() => {
  const CERTS_KEY = 'ck_earned_certs';
  const get  = () => JSON.parse(localStorage.getItem(CERTS_KEY) || '[]');
  const save = d  => localStorage.setItem(CERTS_KEY, JSON.stringify(d));
  const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);

  const LEVELS = {
    Beginner:     { color: '#22c55e', badge: '🥉', desc: 'Foundation of Chess Excellence',     requirements: 'Completed 10 puzzles, attended 10 classes, and passed the beginner assessment.' },
    Intermediate: { color: '#3b82f6', badge: '🥈', desc: 'Tactical Mastery Achievement',      requirements: 'Solved 30 puzzles, maintained 80% attendance, and demonstrated tactical proficiency.' },
    Advanced:     { color: '#e8b84b', badge: '🥇', desc: 'Strategic Grandmaster Certificate', requirements: 'Completed the advanced curriculum, won a rated tournament game, and scored 40+ rating points.' }
  };

  /* ─── Check if student has earned a certificate ─── */
  function checkEligibility(profile, attendancePct, puzzlesSolved) {
    const level = profile.level || 'Beginner';
    const earned = get();
    if (earned.find(c => c.studentId === profile.id && c.level === level)) {
      return { eligible: true, alreadyEarned: true };
    }
    const thresholds = { Beginner: { att: 60, puzzles: 5 }, Intermediate: { att: 70, puzzles: 20 }, Advanced: { att: 80, puzzles: 40 } };
    const t = thresholds[level] || thresholds.Beginner;
    return {
      eligible: attendancePct >= t.att && puzzlesSolved >= t.puzzles,
      alreadyEarned: false,
      attendancePct, puzzlesSolved, required: t
    };
  }

  /* ─── Award a certificate ─── */
  function awardCertificate(studentProfile, coachName) {
    const level = studentProfile.level || 'Beginner';
    const existing = get().find(c => c.studentId === studentProfile.id && c.level === level);
    if (existing) return existing;
    const cert = {
      id: uid(),
      studentId: studentProfile.id,
      studentName: studentProfile.full_name || 'Student',
      level,
      coachName: coachName || studentProfile.coach || 'ChessKidoo Academy',
      issuedAt: new Date().toISOString(),
      certNumber: 'CK-' + Date.now().toString(36).toUpperCase()
    };
    const all = get();
    all.push(cert);
    save(all);
    return cert;
  }

  /* ─── Generate PDF certificate using jsPDF ─── */
  function generatePDF(cert) {
    if (!window.jspdf && !window.jsPDF) {
      CK.showToast('Certificate generator loading… please try again in a moment.', 'info');
      _loadJsPDF(() => generatePDF(cert));
      return;
    }
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;
    const lvl = LEVELS[cert.level] || LEVELS.Beginner;

    // Background
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, W, H, 'F');

    // Gold border — outer
    doc.setDrawColor(232, 184, 75);
    doc.setLineWidth(3);
    doc.rect(8, 8, W - 16, H - 16);

    // Inner border
    doc.setDrawColor(232, 184, 75, 0.4);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, W - 24, H - 24);

    // Chess pattern corners (decorative)
    const corners = [[15,15],[W-35,15],[15,H-35],[W-35,H-35]];
    corners.forEach(([x,y]) => {
      doc.setFillColor(232, 184, 75, 0.15);
      doc.rect(x, y, 20, 20, 'F');
      doc.setFontSize(14);
      doc.setTextColor(232, 184, 75);
      doc.text('♚', x + 5, y + 14);
    });

    // Academy name
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text('CHESSKIDOO ACADEMY', W/2, 28, { align: 'center' });
    doc.setFontSize(8);
    doc.text('India\'s Premier Chess Education Platform', W/2, 34, { align: 'center' });

    // Certificate of Completion
    doc.setFontSize(9);
    doc.setTextColor(232, 184, 75);
    doc.text('CERTIFICATE OF COMPLETION', W/2, 46, { align: 'center' });

    // Divider
    doc.setDrawColor(232, 184, 75);
    doc.setLineWidth(0.8);
    doc.line(60, 49, W - 60, 49);

    // "This is to certify that"
    doc.setFontSize(11);
    doc.setTextColor(180, 190, 210);
    doc.text('This is to certify that', W/2, 62, { align: 'center' });

    // Student Name
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(cert.studentName.toUpperCase(), W/2, 80, { align: 'center' });
    doc.setFont(undefined, 'normal');

    // Name underline
    const nameWidth = doc.getTextWidth(cert.studentName.toUpperCase());
    doc.setDrawColor(232, 184, 75);
    doc.setLineWidth(0.5);
    doc.line(W/2 - nameWidth/2, 83, W/2 + nameWidth/2, 83);

    // "has successfully completed"
    doc.setFontSize(11);
    doc.setTextColor(180, 190, 210);
    doc.text('has successfully completed the', W/2, 93, { align: 'center' });

    // Level name
    doc.setFontSize(20);
    doc.setTextColor(232, 184, 75);
    doc.setFont(undefined, 'bold');
    doc.text(`${cert.level.toUpperCase()} LEVEL PROGRAM`, W/2, 106, { align: 'center' });
    doc.setFont(undefined, 'normal');

    // Description
    doc.setFontSize(9);
    doc.setTextColor(150, 160, 185);
    doc.text(lvl.desc, W/2, 114, { align: 'center' });
    doc.text(lvl.requirements, W/2, 120, { align: 'center', maxWidth: 200 });

    // Signature section
    const sigY = 155;
    doc.setDrawColor(120, 130, 150);
    doc.setLineWidth(0.4);
    // Left signature - Coach
    doc.line(50, sigY, 110, sigY);
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(cert.coachName, 80, sigY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(130, 140, 160);
    doc.text('Chess Coach', 80, sigY + 10, { align: 'center' });

    // Center - Academy seal
    doc.setFontSize(30);
    doc.setTextColor(232, 184, 75, 0.3);
    doc.text('♛', W/2 - 5, sigY + 8);
    doc.setFontSize(7);
    doc.setTextColor(130, 140, 160);
    doc.text('ChessKidoo Academy', W/2, sigY + 14, { align: 'center' });
    doc.text('Official Seal', W/2, sigY + 18, { align: 'center' });

    // Right signature - Director
    doc.setDrawColor(120, 130, 150);
    doc.line(W - 110, sigY, W - 50, sigY);
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text('RANJITH A S', W - 80, sigY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(130, 140, 160);
    doc.text('Academy Director', W - 80, sigY + 10, { align: 'center' });

    // Date and cert number
    const dateStr = new Date(cert.issuedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 130);
    doc.text(`Issued: ${dateStr}`, 20, H - 18);
    doc.text(`Certificate No: ${cert.certNumber}`, W - 20, H - 18, { align: 'right' });
    doc.text('ChessKidoo Academy · Chennai, Tamil Nadu · chesskidoo37@gmail.com', W/2, H - 18, { align: 'center' });

    doc.save(`ChessKidoo_Certificate_${cert.studentName.replace(/\s+/g,'_')}_${cert.level}.pdf`);
    CK.showToast('🎓 Certificate downloaded!', 'success');
  }

  /* ─── Lazy-load jsPDF from CDN ─── */
  function _loadJsPDF(callback) {
    if (document.getElementById('jspdf-cdn')) { callback && callback(); return; }
    const s = document.createElement('script');
    s.id = 'jspdf-cdn';
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => callback && callback();
    document.head.appendChild(s);
  }

  /* ─── Render earned certificates for student portal ─── */
  function renderStudentCerts(containerId, studentProfile, attendancePct, puzzlesSolved) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const earned = get().filter(c => c.studentId === studentProfile.id);
    const eligibility = checkEligibility(studentProfile, attendancePct, puzzlesSolved);
    const level = studentProfile.level || 'Beginner';
    const lvlData = LEVELS[level];

    el.innerHTML = `
      <div class="cert-section">
        <div class="cert-section-title">🎓 My Certificates</div>
        ${earned.length ? earned.map(cert => `
          <div class="cert-card">
            <div class="cert-badge">${LEVELS[cert.level]?.badge || '🏆'}</div>
            <div class="cert-info">
              <div class="cert-level">${cert.level} Level Certificate</div>
              <div class="cert-name">${cert.studentName}</div>
              <div class="cert-date">Issued ${new Date(cert.issuedAt).toLocaleDateString('en-IN',{month:'long',day:'numeric',year:'numeric'})}</div>
              <div class="cert-num"># ${cert.certNumber}</div>
            </div>
            <button class="p-btn p-btn-gold p-btn-sm" onclick="CK.certs.downloadCert('${cert.id}')">⬇ Download PDF</button>
          </div>`) .join('') : `<div class="cls-empty">No certificates earned yet — keep studying!</div>`}

        <div class="cert-next-target">
          <div class="cert-next-title">📋 Next Certificate: ${level} Level</div>
          <div class="cert-progress-grid">
            <div class="cert-req ${attendancePct >= (level==='Beginner'?60:level==='Intermediate'?70:80) ? 'cert-req-done' : ''}">
              <span class="cert-req-icon">${attendancePct >= (level==='Beginner'?60:level==='Intermediate'?70:80) ? '✅' : '⭕'}</span>
              <span>Attendance: ${Math.round(attendancePct)}% / ${level==='Beginner'?60:level==='Intermediate'?70:80}% required</span>
            </div>
            <div class="cert-req ${puzzlesSolved >= (level==='Beginner'?5:level==='Intermediate'?20:40) ? 'cert-req-done' : ''}">
              <span class="cert-req-icon">${puzzlesSolved >= (level==='Beginner'?5:level==='Intermediate'?20:40) ? '✅' : '⭕'}</span>
              <span>Puzzles Solved: ${puzzlesSolved} / ${level==='Beginner'?5:level==='Intermediate'?20:40} required</span>
            </div>
          </div>
          ${eligibility.eligible && !eligibility.alreadyEarned
            ? `<button class="p-btn p-btn-gold" onclick="CK.certs.claimCert()">🎓 Claim Your ${level} Certificate!</button>`
            : eligibility.alreadyEarned
            ? `<div class="p-badge p-badge-green">✅ Already earned — download above!</div>`
            : `<div style="color:var(--p-text-muted);font-size:0.85rem">Complete requirements to unlock your certificate.</div>`}
        </div>
      </div>`;
  }

  function downloadCert(certId) {
    const cert = get().find(c => c.id === certId);
    if (!cert) { CK.showToast('Certificate not found', 'error'); return; }
    _loadJsPDF(() => generatePDF(cert));
  }

  let _pendingClaim = null;
  function claimCert() {
    const user = CK.currentUser || JSON.parse(localStorage.getItem('ck_user') || '{}');
    if (!user || !user.id) { CK.showToast('Please log in first', 'error'); return; }
    const cert = awardCertificate(user, user.coach);
    _loadJsPDF(() => generatePDF(cert));
    CK.showToast('🎓 Certificate generated!', 'success');
    if (CK.student) CK.student.renderAchievementsTab();
  }

  return {
    LEVELS, checkEligibility, awardCertificate, generatePDF,
    renderStudentCerts, downloadCert, claimCert, getEarned: get
  };
})();
