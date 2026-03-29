import { useEffect, useMemo, useState } from 'react';
import {
  createMembership,
  createMembershipPlan,
  deleteMembership,
  deleteMembershipPlan,
  fetchMembershipPlans,
  fetchMemberships,
  updateMembership,
  updateMembershipPlan
} from '../services/membershipsApi.js';
import { fetchUsers } from '../services/usersApi.js';
import { formatCurrency } from '../utils/currency.js';

function todayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

function nowDateTimeInput() {
  return new Date().toISOString().slice(0, 16);
}

function addMonthsToDate(dateValue, months) {
  const base = new Date(dateValue || todayDateInput());
  const next = new Date(base);
  next.setMonth(next.getMonth() + Number(months || 0));
  return next.toISOString().slice(0, 10);
}

function buildPlanForm() {
  return {
    category: '',
    name: '',
    description: '',
    durationMonths: '1',
    price: '0',
    isActive: true
  };
}

function buildMembershipForm(plans = [], members = []) {
  const firstPlan = plans.find((plan) => plan.isActive !== false) || plans[0];
  const firstMember = members[0];
  const startDate = todayDateInput();

  return {
    assignmentMode: firstMember ? 'existing' : 'manual',
    userId: firstMember?._id || '',
    memberName: firstMember?.name || '',
    memberEmail: firstMember?.email || '',
    membershipPlanId: firstPlan?._id || '',
    membershipCategory: firstPlan?.category || '',
    planName: firstPlan?.name || '',
    price: String(firstPlan?.price ?? 0),
    paymentMethod: 'card',
    paymentStatus: 'paid',
    paymentReference: '',
    paidAt: nowDateTimeInput(),
    status: 'active',
    startDate,
    endDate: firstPlan ? addMonthsToDate(startDate, firstPlan.durationMonths) : '',
    renewalStatus: 'on_time'
  };
}

function formatRoleLabel(value) {
  return String(value || '').replaceAll('_', ' ');
}

function findMatchingPlan(plans, item) {
  return (
    plans.find(
      (plan) =>
        String(plan._id) === String(item.membershipPlanId || '') ||
        String(plan.category || '').toLowerCase() === String(item.membershipCategory || '').toLowerCase() ||
        String(plan.name || '').toLowerCase() === String(item.planName || '').toLowerCase()
    ) || null
  );
}

export default function MembershipsPage() {
  const [items, setItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingMembershipId, setEditingMembershipId] = useState('');
  const [editingPlanId, setEditingPlanId] = useState('');
  const [membershipForm, setMembershipForm] = useState(buildMembershipForm());
  const [planForm, setPlanForm] = useState(buildPlanForm());

  const filteredMemberships = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  async function loadMemberships() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchMemberships();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  }

  async function loadMembershipPlans() {
    try {
      const data = await fetchMembershipPlans();
      setPlans(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load membership options');
      return [];
    }
  }

  async function loadMembers() {
    try {
      const data = await fetchUsers({ role: 'customer', isActive: true });
      setMembers(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load website members');
      return [];
    }
  }

  useEffect(() => {
    loadMemberships();
    loadMembershipPlans();
    loadMembers();
  }, []);

  useEffect(() => {
    if (editingMembershipId) {
      return;
    }

    if (!membershipForm.membershipCategory && !membershipForm.memberName && (plans.length > 0 || members.length > 0)) {
      setMembershipForm(buildMembershipForm(plans, members));
    }
  }, [plans, members, editingMembershipId, membershipForm.membershipCategory, membershipForm.memberName]);

  function resetMembershipForm(nextPlans = plans, nextMembers = members) {
    setEditingMembershipId('');
    setMembershipForm(buildMembershipForm(nextPlans, nextMembers));
  }

  function resetPlanForm() {
    setEditingPlanId('');
    setPlanForm(buildPlanForm());
  }

  function syncMembershipFieldsFromPlan(plan, startDate) {
    if (!plan) {
      return {};
    }

    return {
      membershipPlanId: plan._id,
      membershipCategory: plan.category,
      planName: plan.name,
      price: String(plan.price),
      endDate: addMonthsToDate(startDate, plan.durationMonths)
    };
  }

  function handleAssignmentModeChange(mode) {
    setMembershipForm((prev) => {
      if (mode === 'existing') {
        const member = members.find((item) => String(item._id) === String(prev.userId)) || members[0];
        return {
          ...prev,
          assignmentMode: mode,
          userId: member?._id || '',
          memberName: member?.name || '',
          memberEmail: member?.email || ''
        };
      }

      return {
        ...prev,
        assignmentMode: mode,
        userId: '',
        memberName: '',
        memberEmail: ''
      };
    });
  }

  function handleMemberSelect(userId) {
    const member = members.find((item) => String(item._id) === String(userId));

    setMembershipForm((prev) => ({
      ...prev,
      userId,
      memberName: member?.name || '',
      memberEmail: member?.email || ''
    }));
  }

  function handlePlanSelect(planId) {
    const selectedPlan = plans.find((plan) => String(plan._id) === String(planId));

    setMembershipForm((prev) => {
      const startDate = prev.startDate || todayDateInput();
      return {
        ...prev,
        ...syncMembershipFieldsFromPlan(selectedPlan, startDate)
      };
    });
  }

  function handleMembershipStartDateChange(startDate) {
    const selectedPlan = plans.find((plan) => String(plan._id) === String(membershipForm.membershipPlanId));

    setMembershipForm((prev) => ({
      ...prev,
      startDate,
      endDate: selectedPlan ? addMonthsToDate(startDate, selectedPlan.durationMonths) : prev.endDate
    }));
  }

  function selectMembershipForEdit(item) {
    const selectedPlan = findMatchingPlan(plans, item);
    const member = members.find((entry) => String(entry._id) === String(item.userId || ''));
    const assignmentMode = member ? 'existing' : 'manual';
    const startDate = item.startDate ? item.startDate.slice(0, 10) : todayDateInput();

    setEditingMembershipId(item._id);
    setMembershipForm({
      assignmentMode,
      userId: member?._id || '',
      memberName: member?.name || item.memberName || '',
      memberEmail: member?.email || item.memberEmail || '',
      membershipPlanId: selectedPlan?._id || '',
      membershipCategory: selectedPlan?.category || item.membershipCategory || '',
      planName: selectedPlan?.name || item.planName || '',
      price: String(item.price ?? selectedPlan?.price ?? 0),
      paymentMethod: item.paymentMethod || 'card',
      paymentStatus: item.paymentStatus || 'pending',
      paymentReference: item.paymentReference || '',
      paidAt: item.paidAt ? item.paidAt.slice(0, 16) : '',
      status: item.status || 'active',
      startDate,
      endDate: item.endDate ? item.endDate.slice(0, 10) : addMonthsToDate(startDate, selectedPlan?.durationMonths || 1),
      renewalStatus: item.renewalStatus || 'on_time'
    });
  }

  function selectPlanForEdit(item) {
    setEditingPlanId(item._id);
    setPlanForm({
      category: item.category || '',
      name: item.name || '',
      description: item.description || '',
      durationMonths: String(item.durationMonths ?? 1),
      price: String(item.price ?? 0),
      isActive: item.isActive !== false
    });
  }

  async function handleMembershipSubmit(event) {
    event.preventDefault();
    setError('');

    if (membershipForm.assignmentMode === 'existing' && !membershipForm.userId) {
      setError('Select a website member before assigning a membership.');
      return;
    }

    if (membershipForm.assignmentMode === 'manual' && (!membershipForm.memberName || !membershipForm.memberEmail)) {
      setError('Enter the new member name and email to assign a membership manually.');
      return;
    }

    const payload = {
      userId: membershipForm.assignmentMode === 'existing' ? membershipForm.userId : null,
      memberName: membershipForm.memberName,
      memberEmail: membershipForm.memberEmail,
      membershipCategory: membershipForm.membershipCategory,
      planName: membershipForm.planName,
      price: Number(membershipForm.price),
      paymentMethod: membershipForm.paymentMethod,
      paymentStatus: membershipForm.paymentStatus,
      paymentReference: membershipForm.paymentReference,
      paidAt: membershipForm.paidAt || undefined,
      status: membershipForm.status,
      startDate: membershipForm.startDate || undefined,
      endDate: membershipForm.endDate || undefined,
      renewalStatus: membershipForm.renewalStatus
    };

    try {
      if (editingMembershipId) {
        await updateMembership(editingMembershipId, payload);
      } else {
        await createMembership(payload);
      }
      resetMembershipForm();
      await loadMemberships();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save membership assignment');
    }
  }

  async function handlePlanSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      category: planForm.category,
      name: planForm.name,
      description: planForm.description,
      durationMonths: Number(planForm.durationMonths),
      price: Number(planForm.price),
      isActive: planForm.isActive
    };

    try {
      if (editingPlanId) {
        await updateMembershipPlan(editingPlanId, payload);
      } else {
        await createMembershipPlan(payload);
      }
      resetPlanForm();
      const nextPlans = await loadMembershipPlans();
      if (!editingMembershipId) {
        resetMembershipForm(nextPlans, members);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save membership option');
    }
  }

  async function handleDeleteMembership(id) {
    setError('');

    try {
      await deleteMembership(id);
      if (editingMembershipId === id) {
        resetMembershipForm();
      }
      await loadMemberships();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete membership');
    }
  }

  async function handleDeletePlan(id) {
    setError('');

    try {
      await deleteMembershipPlan(id);
      if (editingPlanId === id) {
        resetPlanForm();
      }
      const nextPlans = await loadMembershipPlans();
      if (!editingMembershipId) {
        resetMembershipForm(nextPlans, members);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete membership option');
    }
  }

  return (
    <>
      <section className="panel-grid">
        <div className="panel">
          <div className="row-between">
            <h1>Assign Membership</h1>
            <span className="muted">Assign an existing option to a website member or a new member.</span>
          </div>
          <form className="form-grid" onSubmit={handleMembershipSubmit}>
            <select
              value={membershipForm.assignmentMode}
              onChange={(e) => handleAssignmentModeChange(e.target.value)}
            >
              <option value="existing">Assign to existing website member</option>
              <option value="manual">Assign to new/manual member</option>
            </select>

            {membershipForm.assignmentMode === 'existing' ? (
              <select value={membershipForm.userId} onChange={(e) => handleMemberSelect(e.target.value)} required>
                <option value="">Select website member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} • {member.email}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Member name"
                value={membershipForm.memberName}
                onChange={(e) => setMembershipForm((prev) => ({ ...prev, memberName: e.target.value }))}
                required
              />
            )}

            {membershipForm.assignmentMode === 'existing' ? (
              <input type="text" value={membershipForm.memberName} placeholder="Member name" readOnly />
            ) : (
              <input
                type="email"
                placeholder="Member email"
                value={membershipForm.memberEmail}
                onChange={(e) => setMembershipForm((prev) => ({ ...prev, memberEmail: e.target.value }))}
                required
              />
            )}

            {membershipForm.assignmentMode === 'existing' && (
              <input type="email" value={membershipForm.memberEmail} placeholder="Member email" readOnly />
            )}

            <select
              value={membershipForm.membershipPlanId}
              onChange={(e) => handlePlanSelect(e.target.value)}
              required
            >
              <option value="">Select membership option</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.category} • {plan.name}{plan.isActive === false ? ' (Inactive)' : ''}
                </option>
              ))}
            </select>
            <input type="text" value={membershipForm.membershipCategory} placeholder="Membership category" readOnly />
            <input type="text" value={membershipForm.planName} placeholder="Plan name" readOnly />
            <input type="text" value={formatCurrency(membershipForm.price)} placeholder="Price" readOnly />
            <select
              value={membershipForm.paymentMethod}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="other">Other</option>
            </select>
            <select
              value={membershipForm.paymentStatus}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <input
              type="text"
              placeholder="Payment reference"
              value={membershipForm.paymentReference}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, paymentReference: e.target.value }))}
            />
            <input
              type="datetime-local"
              value={membershipForm.paidAt}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, paidAt: e.target.value }))}
            />
            <select
              value={membershipForm.status}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={membershipForm.renewalStatus}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, renewalStatus: e.target.value }))}
            >
              <option value="on_time">On time</option>
              <option value="late">Late</option>
              <option value="not_renewed">Not renewed</option>
            </select>
            <input
              type="date"
              value={membershipForm.startDate}
              onChange={(e) => handleMembershipStartDateChange(e.target.value)}
            />
            <input
              type="date"
              value={membershipForm.endDate}
              onChange={(e) => setMembershipForm((prev) => ({ ...prev, endDate: e.target.value }))}
              required
            />
            <div className="row-actions">
              <button type="submit">{editingMembershipId ? 'Update assignment' : 'Assign membership'}</button>
              {editingMembershipId && (
                <button type="button" className="ghost-btn" onClick={() => resetMembershipForm()}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="row-between">
            <h2>{editingPlanId ? 'Edit Membership Option' : 'Add Membership Option'}</h2>
            <span className="muted">Monthly, three-month, annual, and any custom options are managed here.</span>
          </div>
          <form className="form-grid" onSubmit={handlePlanSubmit}>
            <input
              type="text"
              placeholder="Category"
              value={planForm.category}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, category: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Membership name"
              value={planForm.name}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Duration in months"
              value={planForm.durationMonths}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, durationMonths: e.target.value }))}
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={planForm.price}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
            <textarea
              rows={5}
              placeholder="Description"
              value={planForm.description}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <label className="check-row">
              <input
                type="checkbox"
                checked={planForm.isActive}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Membership option is active
            </label>
            <div className="row-actions">
              <button type="submit">{editingPlanId ? 'Update membership option' : 'Add Membership'}</button>
              {editingPlanId && (
                <button type="button" className="ghost-btn" onClick={resetPlanForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="row-between">
            <h2>Membership Options</h2>
            <span className="muted">{plans.length} total options</span>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan._id}>
                    <td>{plan.category}</td>
                    <td>{plan.name}</td>
                    <td>{plan.durationMonths} month{plan.durationMonths === 1 ? '' : 's'}</td>
                    <td>{formatCurrency(plan.price)}</td>
                    <td>{plan.isActive !== false ? 'Active' : 'Inactive'}</td>
                    <td>{plan.isSystem ? 'Default' : 'Custom'}</td>
                    <td className="action-cell">
                      <button type="button" className="ghost-btn" onClick={() => selectPlanForEdit(plan)}>
                        Edit
                      </button>
                      {!plan.isSystem && (
                        <button type="button" className="danger-btn" onClick={() => handleDeletePlan(plan._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan="7" className="muted">No membership options found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="row-between">
            <h2>Assigned Memberships</h2>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Category</th>
                    <th>Plan</th>
                    <th>Payment</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberships.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.memberName}</strong>
                        <div className="muted">
                          {item.memberEmail}
                          {item.userId ? ` • website member` : ' • manual member'}
                        </div>
                      </td>
                      <td>{item.membershipCategory || '-'}</td>
                      <td>{item.planName}</td>
                      <td>
                        <strong>{item.paymentStatus || '-'}</strong>
                        <div className="muted">
                          {formatRoleLabel(item.paymentMethod || '-')}
                          {item.paymentReference ? ` • ${item.paymentReference}` : item.cardLast4 ? ` • •••• ${item.cardLast4}` : ''}
                        </div>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.status}</td>
                      <td>{item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}</td>
                      <td className="action-cell">
                        <button type="button" className="ghost-btn" onClick={() => selectMembershipForEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="danger-btn" onClick={() => handleDeleteMembership(item._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMemberships.length === 0 && (
                    <tr>
                      <td colSpan="8" className="muted">No memberships found for the current filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
