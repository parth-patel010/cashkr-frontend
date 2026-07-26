import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { ClipboardList, Plus, Trash2, Save } from 'lucide-react';
import './admin.css';

const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const emptyWindow = () => ({
  id: newId('win'),
  title: '',
  question: '',
  choiceType: 'single',
  options: [
    {
      id: newId('opt'),
      label: '',
      emoji: '',
      icon: '',
      deductionValue: 0,
    },
  ],
});

const emptyQuiz = () => ({
  category: '',
  windows: [emptyWindow()],
  deductionMode: 'universal',
  modelDeductions: [],
  isActive: true,
});

export default function AdminCategoryQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyQuiz());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([
    { key: 'tablet', label: 'Tablet' },
    { key: 'earbuds', label: 'Earbuds' },
    { key: 'smartwatch', label: 'Smartwatch' },
    { key: 'tv', label: 'TV' },
    { key: 'speakers', label: 'Speakers' },
    { key: 'gaming', label: 'Gaming' },
    { key: 'refrigerator', label: 'Refrigerator' },
  ]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data }, settingsRes] = await Promise.all([
        adminService.getCategoryQuizzes(),
        adminService.getAppSettings().catch(() => null),
      ]);
      setQuizzes(Array.isArray(data) ? data : []);
      const cats = settingsRes?.data?.categories;
      if (Array.isArray(cats) && cats.length) {
        const options = cats
          .filter((c) => c?.key && !['mobile', 'phone', 'laptop', 'mac'].includes(String(c.key).toLowerCase()))
          .map((c) => ({ key: c.key, label: c.label || c.key }));
        if (options.length) setCategoryOptions(options);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setSelectedId(null);
    setForm(emptyQuiz());
    setMessage('');
  };

  const selectQuiz = (quiz) => {
    setSelectedId(quiz._id);
    setForm({
      category: quiz.category || '',
      windows: Array.isArray(quiz.windows) && quiz.windows.length ? quiz.windows : [emptyWindow()],
      deductionMode: quiz.deductionMode === 'model-wise' ? 'model-wise' : 'universal',
      modelDeductions: Array.isArray(quiz.modelDeductions) ? quiz.modelDeductions : [],
      isActive: quiz.isActive !== false,
    });
    setMessage('');
  };

  const updateWindow = (winId, patch) => {
    setForm((f) => ({
      ...f,
      windows: f.windows.map((w) => (w.id === winId ? { ...w, ...patch } : w)),
    }));
  };

  const updateOption = (winId, optId, patch) => {
    setForm((f) => ({
      ...f,
      windows: f.windows.map((w) =>
        w.id === winId
          ? {
              ...w,
              options: w.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)),
            }
          : w,
      ),
    }));
  };

  const addWindow = () => {
    setForm((f) => ({ ...f, windows: [...f.windows, emptyWindow()] }));
  };

  const removeWindow = (winId) => {
    setForm((f) => ({
      ...f,
      windows: f.windows.filter((w) => w.id !== winId),
    }));
  };

  const addOption = (winId) => {
    setForm((f) => ({
      ...f,
      windows: f.windows.map((w) =>
        w.id === winId
          ? {
              ...w,
              options: [
                ...w.options,
                { id: newId('opt'), label: '', emoji: '', icon: '', deductionValue: 0 },
              ],
            }
          : w,
      ),
    }));
  };

  const removeOption = (winId, optId) => {
    setForm((f) => ({
      ...f,
      windows: f.windows.map((w) =>
        w.id === winId
          ? { ...w, options: w.options.filter((o) => o.id !== optId) }
          : w,
      ),
    }));
  };

  const allOptions = form.windows.flatMap((w) =>
    (w.options || []).map((o) => ({
      optionId: o.id,
      label: o.label || o.id,
      windowTitle: w.title || w.question || w.id,
    })),
  );

  const addModelDeduction = () => {
    setForm((f) => ({
      ...f,
      modelDeductions: [
        ...f.modelDeductions,
        {
          deviceSlug: '',
          optionId: allOptions[0]?.optionId || '',
          value: 0,
        },
      ],
    }));
  };

  const updateModelDeduction = (index, patch) => {
    setForm((f) => ({
      ...f,
      modelDeductions: f.modelDeductions.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    }));
  };

  const removeModelDeduction = (index) => {
    setForm((f) => ({
      ...f,
      modelDeductions: f.modelDeductions.filter((_, i) => i !== index),
    }));
  };

  const onSave = async () => {
    if (!form.category.trim()) {
      alert('Category is required');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        category: form.category.trim().toLowerCase(),
        windows: form.windows.map((w) => ({
          ...w,
          options: w.options.map((o) => ({
            ...o,
            icon: o.emoji || o.icon || '',
            deductionValue: Number(o.deductionValue) || 0,
          })),
        })),
        modelDeductions: form.modelDeductions.map((d) => ({
          ...d,
          value: Number(d.value) || 0,
        })),
      };
      if (selectedId) {
        const { data } = await adminService.updateCategoryQuiz(selectedId, payload);
        setMessage('Quiz updated');
        selectQuiz(data);
      } else {
        const { data } = await adminService.createCategoryQuiz(payload);
        setMessage('Quiz created');
        selectQuiz(data);
      }
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Delete this category quiz?')) return;
    try {
      await adminService.deleteCategoryQuiz(selectedId);
      startNew();
      load();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="admin-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardList size={22} className="text-blue-600" />
            Category Quiz Builder
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-1 max-w-2xl">
            Build custom quiz windows per category. Use universal deductions on options, or
            model-wise overrides at the end.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={startNew}>
            <Plus size={16} /> New quiz
          </button>
          <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={onSave}>
            <Save size={16} />
            {saving ? 'Saving…' : 'Save quiz'}
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="admin-card space-y-2 h-fit">
          <h3 className="text-xs font-800 uppercase tracking-wider text-slate-400 mb-2">
            Quizzes
          </h3>
          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : quizzes.length === 0 ? (
            <p className="text-sm text-slate-400">No quizzes yet</p>
          ) : (
            quizzes.map((q) => (
              <button
                key={q._id}
                type="button"
                onClick={() => selectQuiz(q)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold border ${
                  selectedId === q._id
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="capitalize">{q.category}</div>
                <div className="text-[10px] font-semibold text-slate-400">
                  {q.windows?.length || 0} windows · {q.deductionMode}
                </div>
              </button>
            ))
          )}
        </aside>

        <div className="space-y-6">
          <div className="admin-card grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="admin-field mb-0">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select category</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
                {form.category &&
                !categoryOptions.some((o) => o.key === form.category) ? (
                  <option value={form.category}>{form.category}</option>
                ) : null}
              </select>
            </div>
            <div className="admin-field mb-0">
              <label>Deduction mode</label>
              <select
                value={form.deductionMode}
                onChange={(e) => setForm((f) => ({ ...f, deductionMode: e.target.value }))}
              >
                <option value="universal">Universal</option>
                <option value="model-wise">Model-wise</option>
              </select>
            </div>
            <div className="admin-field mb-0 flex items-end">
              <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <span className="text-sm font-bold">Active</span>
              </label>
            </div>
          </div>

          {form.windows.map((win, wi) => (
            <div key={win.id} className="admin-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900">Window {wi + 1}</h3>
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeWindow(win.id)}
                  disabled={form.windows.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="admin-field mb-0">
                  <label>Title</label>
                  <input
                    value={win.title}
                    onChange={(e) => updateWindow(win.id, { title: e.target.value })}
                  />
                </div>
                <div className="admin-field mb-0">
                  <label>Choice type</label>
                  <select
                    value={win.choiceType}
                    onChange={(e) => updateWindow(win.id, { choiceType: e.target.value })}
                  >
                    <option value="single">Single</option>
                    <option value="multi">Multi</option>
                  </select>
                </div>
              </div>
              <div className="admin-field mb-0">
                <label>Question</label>
                <input
                  value={win.question}
                  onChange={(e) => updateWindow(win.id, { question: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-800 uppercase tracking-wider text-slate-400">
                    Options
                  </h4>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost text-xs"
                    onClick={() => addOption(win.id)}
                  >
                    <Plus size={14} /> Add option
                  </button>
                </div>
                {win.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_auto] gap-2 items-end border border-slate-100 rounded-lg p-3"
                  >
                    <div className="admin-field mb-0">
                      <label>Label</label>
                      <input
                        value={opt.label}
                        onChange={(e) => updateOption(win.id, opt.id, { label: e.target.value })}
                      />
                    </div>
                    <div className="admin-field mb-0">
                      <label>Emoji</label>
                      <input
                        value={opt.emoji || ''}
                        onChange={(e) =>
                          updateOption(win.id, opt.id, {
                            emoji: e.target.value,
                            icon: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="admin-field mb-0">
                      <label>Deduction</label>
                      <input
                        type="number"
                        value={opt.deductionValue}
                        onChange={(e) =>
                          updateOption(win.id, opt.id, {
                            deductionValue: e.target.value,
                          })
                        }
                        title="Can be negative"
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-500 pb-2"
                      onClick={() => removeOption(win.id, opt.id)}
                      disabled={win.options.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button type="button" className="admin-btn admin-btn-ghost" onClick={addWindow}>
            <Plus size={16} /> Add window
          </button>

          {form.deductionMode === 'model-wise' ? (
            <div className="admin-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900">Model-wise deductions</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Override option values per device slug.
                  </p>
                </div>
                <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={addModelDeduction}>
                  <Plus size={14} /> Add row
                </button>
              </div>
              {form.modelDeductions.length === 0 ? (
                <p className="text-sm text-slate-400">No model overrides yet.</p>
              ) : (
                form.modelDeductions.map((row, index) => (
                  <div
                    key={`${row.deviceSlug}-${row.optionId}-${index}`}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_auto] gap-2 items-end"
                  >
                    <div className="admin-field mb-0">
                      <label>Device slug</label>
                      <input
                        value={row.deviceSlug}
                        onChange={(e) =>
                          updateModelDeduction(index, { deviceSlug: e.target.value })
                        }
                      />
                    </div>
                    <div className="admin-field mb-0">
                      <label>Option</label>
                      <select
                        value={row.optionId}
                        onChange={(e) =>
                          updateModelDeduction(index, { optionId: e.target.value })
                        }
                      >
                        {allOptions.map((o) => (
                          <option key={o.optionId} value={o.optionId}>
                            {o.windowTitle}: {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-field mb-0">
                      <label>Value</label>
                      <input
                        type="number"
                        value={row.value}
                        onChange={(e) => updateModelDeduction(index, { value: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-500 pb-2"
                      onClick={() => removeModelDeduction(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {selectedId ? (
            <button type="button" className="admin-btn admin-btn-ghost text-red-500" onClick={onDelete}>
              <Trash2 size={16} /> Delete quiz
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
