import { useState } from "react";
import "./KanbanDemo.css";

const MEMBERS = [
  { initials: "SM", name: "Sophie Martin", role: "Chef de projet", bg: "#E6F1FB", color: "#0C447C" },
  { initials: "LB", name: "Lucas Bernard", role: "Designer",        bg: "#EEEDFE", color: "#3C3489" },
  { initials: "MR", name: "Marie Renaud",  role: "Redactrice",      bg: "#EAF3DE", color: "#27500A" },
  { initials: "JM", name: "Jean Moreau",   role: "Developpeur",     bg: "#FAECE7", color: "#712B13" },
];

const PRIO_COLOR = { high: "#E24B4A", med: "#EF9F27", low: "#639922" };

const TASKS = [
  { id: 1,  col: "backlog",    title: "Audit UX de l'interface actuelle",       tag: "Design",  tagBg: "#EEEDFE", tagColor: "#3C3489", prio: "low",  initials: "LB", avBg: "#EEEDFE", avColor: "#3C3489" },
  { id: 2,  col: "backlog",    title: "Rediger les specs techniques du CMS",     tag: "Contenu", tagBg: "#EAF3DE", tagColor: "#27500A", prio: "med",  initials: "MR", avBg: "#EAF3DE", avColor: "#27500A" },
  { id: 3,  col: "backlog",    title: "Identifier les KPIs de performance",      tag: "Test",    tagBg: "#FAEEDA", tagColor: "#633806", prio: "low",  initials: "JM", avBg: "#FAECE7", avColor: "#712B13" },
  { id: 4,  col: "todo",       title: "Maquettes Figma — page d'accueil",        tag: "Design",  tagBg: "#EEEDFE", tagColor: "#3C3489", prio: "high", initials: "LB", avBg: "#EEEDFE", avColor: "#3C3489" },
  { id: 5,  col: "todo",       title: "Mise en place du repo Git et CI/CD",      tag: "Dev",     tagBg: "#E6F1FB", tagColor: "#0C447C", prio: "high", initials: "SM", avBg: "#E6F1FB", avColor: "#0C447C" },
  { id: 6,  col: "todo",       title: "Redaction des user stories sprint 1",     tag: "Contenu", tagBg: "#EAF3DE", tagColor: "#27500A", prio: "med",  initials: "MR", avBg: "#EAF3DE", avColor: "#27500A" },
  { id: 7,  col: "inprogress", title: "Integration HTML/CSS — header & nav",     tag: "Dev",     tagBg: "#E6F1FB", tagColor: "#0C447C", prio: "high", initials: "SM", avBg: "#E6F1FB", avColor: "#0C447C" },
  { id: 8,  col: "inprogress", title: "Correction bug menu mobile Safari",       tag: "Bug",     tagBg: "#FCEBEB", tagColor: "#791F1F", prio: "high", initials: "JM", avBg: "#FAECE7", avColor: "#712B13" },
  { id: 9,  col: "inprogress", title: "Optimisation images — compression WebP",  tag: "Dev",     tagBg: "#E6F1FB", tagColor: "#0C447C", prio: "med",  initials: "SM", avBg: "#E6F1FB", avColor: "#0C447C" },
  { id: 10, col: "done",       title: "Cadrage projet et validation client",     tag: "Contenu", tagBg: "#EAF3DE", tagColor: "#27500A", prio: "low",  initials: "MR", avBg: "#EAF3DE", avColor: "#27500A" },
  { id: 11, col: "done",       title: "Choix stack technique validee",           tag: "Dev",     tagBg: "#E6F1FB", tagColor: "#0C447C", prio: "med",  initials: "SM", avBg: "#E6F1FB", avColor: "#0C447C" },
  { id: 12, col: "done",       title: "Brief design approuve",                  tag: "Design",  tagBg: "#EEEDFE", tagColor: "#3C3489", prio: "low",  initials: "LB", avBg: "#EEEDFE", avColor: "#3C3489" },
];

const COLS = [
  { id: "backlog",    label: "Backlog"   },
  { id: "todo",       label: "A faire"   },
  { id: "inprogress", label: "En cours"  },
  { id: "done",       label: "Termine"   },
];

function KanbanDemo() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState(null);

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) {
      setInviteMsg({ ok: false, text: "Email invalide." });
      return;
    }
    setInviteMsg({ ok: true, text: `Invitation envoyee a ${inviteEmail}` });
    setInviteEmail("");
    setTimeout(() => setInviteMsg(null), 3000);
  };

  return (
    <div className="kb-wrap">

      <div className="kb-banner">
        Mode demo — consultation uniquement. Aucune modification possible.
      </div>

      <div className="kb-header">
        <div className="kb-header-left">
          <span className="kb-project-title">Refonte site web</span>
          <span className="kb-sprint-badge">Sprint Q2</span>
        </div>
        <span className="kb-chef-label">Chef de projet : Sophie Martin</span>
      </div>

      <div className="kb-board">
        {COLS.map(col => {
          const colTasks = TASKS.filter(t => t.col === col.id);
          return (
            <div key={col.id} className="kb-col">
              <div className="kb-col-header">
                <span className="kb-col-title">{col.label}</span>
                <span className="kb-col-count">{colTasks.length}</span>
              </div>
              {colTasks.map(task => (
                <div key={task.id} className="kb-card">
                  <div className="kb-card-title">{task.title}</div>
                  <div className="kb-card-footer">
                    <span
                      className="kb-tag"
                      style={{ background: task.tagBg, color: task.tagColor }}
                    >
                      {task.tag}
                    </span>
                    <div className="kb-card-right">
                      <div
                        className="kb-prio-dot"
                        style={{ background: PRIO_COLOR[task.prio] }}
                      />
                      <div
                        className="kb-avatar"
                        style={{ background: task.avBg, color: task.avColor }}
                      >
                        {task.initials}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="kb-panel">
        <div className="kb-section-label">Membres du projet</div>
        <div className="kb-members">
          {MEMBERS.map(m => (
            <div key={m.initials} className="kb-member-chip">
              <div
                className="kb-member-chip-avatar"
                style={{ background: m.bg, color: m.color }}
              >
                {m.initials}
              </div>
              <span className="kb-member-chip-name">{m.name}</span>
              <span className="kb-member-chip-role">{m.role}</span>
            </div>
          ))}
        </div>

        <div className="kb-section-label">Inviter un membre</div>
        <div className="kb-invite-row">
          <input
            type="email"
            className="kb-invite-input"
            placeholder="adresse@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleInvite()}
          />
          <button type="button" className="kb-invite-btn" onClick={handleInvite}>
            Inviter
          </button>
        </div>
        {inviteMsg && (
          <div className={`kb-invite-msg ${inviteMsg.ok ? "success" : "error"}`}>
            {inviteMsg.text}
          </div>
        )}
      </div>

    </div>
  );
}

export default KanbanDemo;