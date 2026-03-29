import { useEffect, useMemo, useState } from 'react';
import { fetchWorkoutPlanRequests, updateWorkoutPlanRequest } from '../services/workoutPlansApi.js';

function humanizeLabel(key) {
  return String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value ?? '').trim();
}

function buildReplyLink(item) {
  if (!item?.email) {
    return '#';
  }

  const subject = `Your BodyMart workout plan`;
  const body = [
    `Hi ${item.fullName || 'there'},`,
    '',
    'Here is your personalized workout plan from BodyMart.',
    '',
    'Best,',
    'BodyMart Admin'
  ].join('\n');

  return `mailto:${item.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function WorkoutPlansPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [draftStatus, setDraftStatus] = useState('new');
  const [draftNotes, setDraftNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadRequests() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchWorkoutPlanRequests();
      setItems(data);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load workout plan requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesQuery =
        !q ||
        String(item.fullName || '').toLowerCase().includes(q) ||
        String(item.email || '').toLowerCase().includes(q) ||
        String(item.mainGoal || '').toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const selectedItem = useMemo(() => {
    return filteredItems.find((item) => item._id === selectedId) || filteredItems[0] || null;
  }, [filteredItems, selectedId]);

  const metrics = useMemo(() => {
    return {
      total: items.length,
      newCount: items.filter((item) => item.status === 'new').length,
      replied: items.filter((item) => item.status === 'replied').length
    };
  }, [items]);

  useEffect(() => {
    if (selectedItem) {
      setSelectedId(selectedItem._id);
      setDraftStatus(selectedItem.status || 'new');
      setDraftNotes(selectedItem.adminNotes || '');
    }
  }, [selectedItem?._id]);

  async function handleSave() {
    if (!selectedItem) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await updateWorkoutPlanRequest(selectedItem._id, {
        status: draftStatus,
        adminNotes: draftNotes
      });

      setItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (saveError) {
      setError(saveError?.response?.data?.message || 'Failed to update workout plan request');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel-grid">
      <div className="dashboard-header">
        <h1>Workout Plan Requests</h1>
        <p>Review personalized gym-plan intakes from the website and reply directly to the user by email.</p>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Requests</p>
          <h2>{metrics.total}</h2>
        </article>
        <article className="stat-card">
          <p>New</p>
          <h2>{metrics.newCount}</h2>
        </article>
        <article className="stat-card">
          <p>Replied</p>
          <h2>{metrics.replied}</h2>
        </article>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="request-review-layout">
        <div className="panel request-list-card">
          <div className="row-between">
            <h2>Inbox</h2>
            <button type="button" className="ghost-btn" onClick={loadRequests}>
              Refresh
            </button>
          </div>

          <div className="request-filter-row">
            <input
              type="text"
              placeholder="Search by name, email, or goal"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {loading ? (
            <p className="muted">Loading...</p>
          ) : filteredItems.length === 0 ? (
            <p className="muted">No workout plan requests yet.</p>
          ) : (
            <div className="request-list">
              {filteredItems.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className={`request-item-card${item._id === selectedItem?._id ? ' active' : ''}`}
                  onClick={() => setSelectedId(item._id)}
                >
                  <div className="request-item-top">
                    <strong>{item.fullName}</strong>
                    <span className={`status-chip ${item.status}`}>{item.status}</span>
                  </div>
                  <p>{item.mainGoal || 'No goal selected'}</p>
                  <div className="request-item-meta">
                    <span>{item.email}</span>
                    <span className={`email-chip ${item.emailStatus}`}>Email: {item.emailStatus}</span>
                  </div>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel request-detail-card">
          {!selectedItem ? (
            <div className="request-detail-empty">
              <h2>No request selected</h2>
              <p>Choose a request from the inbox to view the full intake.</p>
            </div>
          ) : (
            <>
              <div className="request-detail-head">
                <div>
                  <h2>{selectedItem.fullName}</h2>
                  <p>{selectedItem.email}</p>
                </div>
                <a href={buildReplyLink(selectedItem)} className="ghost-btn request-reply-link">
                  Reply via email
                </a>
              </div>

              <div className="request-meta-grid">
                <div>
                  <span>Main goal</span>
                  <strong>{selectedItem.mainGoal || '-'}</strong>
                </div>
                <div>
                  <span>Workout location</span>
                  <strong>{selectedItem.workoutLocation || '-'}</strong>
                </div>
                <div>
                  <span>Age range</span>
                  <strong>{selectedItem.ageRange || '-'}</strong>
                </div>
                <div>
                  <span>Event</span>
                  <strong>{selectedItem.importantEvent || '-'}</strong>
                </div>
                <div>
                  <span>Current / goal weight</span>
                  <strong>
                    {selectedItem.currentWeightKg || '-'} kg / {selectedItem.goalWeightKg || '-'} kg
                  </strong>
                </div>
                <div>
                  <span>Email status</span>
                  <strong>{selectedItem.emailStatus}</strong>
                </div>
              </div>

              <div className="request-admin-actions">
                <select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="replied">Replied</option>
                </select>
                <button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </div>

              <div className="request-notes">
                <label htmlFor="admin-notes">Admin notes</label>
                <textarea
                  id="admin-notes"
                  rows="4"
                  value={draftNotes}
                  onChange={(event) => setDraftNotes(event.target.value)}
                  placeholder="Add notes about the workout plan you plan to send."
                />
              </div>

              <div className="request-answers-grid">
                {Object.entries(selectedItem.answers || {}).map(([key, value]) => (
                  <article key={key} className="answer-card">
                    <span>{humanizeLabel(key)}</span>
                    <strong>{formatValue(value) || '-'}</strong>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </section>
  );
}
