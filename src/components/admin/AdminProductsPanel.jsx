import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Save, X, Loader2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BRANDS = ['Sun Pharma', 'Glenmark', 'Hyphen', 'COSRX'];
const CATEGORIES = ['Cleanser', 'Face Wash', 'Sunscreen', 'Moisturizer', 'Serum', 'Spot Treatment', 'Toner'];
const ROUTINE_STEPS = ['AM', 'PM', 'Both'];
const CONCERNS = [
  'Acne', 'Acne Scars', 'Hyperpigmentation/Dark Spots', 'Uneven Skin Tone',
  'Dryness/Dehydration', 'Sun Damage/UV Protection', 'Aging/Fine Lines',
  'Oily Skin/Excess Sebum', 'Blackheads/Pores', 'Sensitive Skin/Irritation/Redness', 'Barrier Repair'
];

const EMPTY_FORM = {
  product_name: '', brand: '', category: '', key_ingredients: '',
  skin_concerns_treated: [], routine_step: 'Both', prescription_strength: false, notes: ''
};

function ProductForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const toggle = (concern) => {
    setForm(f => ({
      ...f,
      skin_concerns_treated: f.skin_concerns_treated.includes(concern)
        ? f.skin_concerns_treated.filter(c => c !== concern)
        : [...f.skin_concerns_treated, concern]
    }));
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Product Name *</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            value={form.product_name}
            onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
            placeholder="e.g. Advanced Snail 96 Mucin Power Essence"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Brand *</label>
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
            <option value="">Select brand</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Category</label>
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Routine Step</label>
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            value={form.routine_step} onChange={e => setForm(f => ({ ...f, routine_step: e.target.value }))}>
            {ROUTINE_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <input type="checkbox" id="rx" checked={form.prescription_strength}
            onChange={e => setForm(f => ({ ...f, prescription_strength: e.target.checked }))}
            className="w-4 h-4 accent-pink-500" />
          <label htmlFor="rx" className="text-sm text-gray-300">Prescription Strength (Rx)</label>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Key Ingredients</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            value={form.key_ingredients}
            onChange={e => setForm(f => ({ ...f, key_ingredients: e.target.value }))}
            placeholder="e.g. Niacinamide, Ceramides, Hyaluronic Acid"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 mb-2 block">Skin Concerns Treated</label>
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map(c => (
              <button key={c} type="button" onClick={() => toggle(c)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  form.skin_concerns_treated.includes(c)
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Usage caution, frequency, etc."
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => onSave(form)} disabled={saving || !form.product_name || !form.brand}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg">
          <X className="w-4 h-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}

const BRAND_COLORS = {
  'Sun Pharma': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Glenmark': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Hyphen': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'COSRX': 'text-green-400 bg-green-400/10 border-green-400/20',
};

export default function AdminProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterConcern, setFilterConcern] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await base44.entities.Product.list('-created_date', 100);
    setProducts(data);
    setLoading(false);
  };

  const handleSave = async (form, id) => {
    setSaving(true);
    if (id) {
      const updated = await base44.entities.Product.update(id, form);
      setProducts(ps => ps.map(p => p.id === id ? updated : p));
      setEditingId(null);
    } else {
      const created = await base44.entities.Product.create(form);
      setProducts(ps => [created, ...ps]);
      setAdding(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await base44.entities.Product.delete(id);
    setProducts(ps => ps.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const filtered = products.filter(p =>
    (!filterBrand || p.brand === filterBrand) &&
    (!filterConcern || (p.skin_concerns_treated || []).includes(filterConcern))
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          <select className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300"
            value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
            <option value="">All Brands</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300"
            value={filterConcern} onChange={e => setFilterConcern(e.target.value)}>
            <option value="">All Concerns</option>
            {CONCERNS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => { setAdding(true); setEditingId(null); }}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </Button>
      </div>

      {adding && (
        <div className="mb-4">
          <ProductForm onSave={(f) => handleSave(f, null)} onCancel={() => setAdding(false)} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-pink-500 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(product => (
            <div key={product.id}>
              {editingId === product.id ? (
                <ProductForm initial={product} onSave={(f) => handleSave(f, product.id)}
                  onCancel={() => setEditingId(null)} saving={saving} />
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BRAND_COLORS[product.brand] || 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                        {product.brand}
                      </span>
                      {product.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400">{product.category}</span>
                      )}
                      {product.routine_step && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-500">{product.routine_step}</span>
                      )}
                      {product.prescription_strength && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" /> Rx
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white leading-snug">{product.product_name}</p>
                    {product.key_ingredients && (
                      <p className="text-xs text-gray-500 mt-1">{product.key_ingredients}</p>
                    )}
                    {product.skin_concerns_treated?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.skin_concerns_treated.map(c => (
                          <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400">{c}</span>
                        ))}
                      </div>
                    )}
                    {product.notes && <p className="text-xs text-amber-400/80 mt-1.5 italic">{product.notes}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditingId(product.id); setAdding(false); }}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      {deletingId === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}