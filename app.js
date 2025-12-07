
class EventItem {
  constructor({id, name, date, location, category, capacity=100, registeredCount=0, description='', open=true}){
    this.id = id;
    this.name = name;
    this.date = new Date(date);
    this.location = location;
    this.category = category;
    this.capacity = capacity;
    this.registeredCount = registeredCount;
    this.description = description;
    this.open = open; 
  }

  isFull(){
    return this.registeredCount >= this.capacity;
  }

  canRegister(){
    const now = new Date();
    return this.open && this.date > now && !this.isFull();
  }

  toJSON(){
    return {
      id:this.id, name:this.name, date:this.date.toISOString(), location:this.location,
      category:this.category, capacity:this.capacity, registeredCount:this.registeredCount,
      description:this.description, open:this.open
    };
  }
}

class EventManager {
  constructor(storageKey='events_v1'){
    this.storageKey = storageKey;
    this.events = [];
    this.load();
  }

  load(){
    const raw = localStorage.getItem(this.storageKey);
    if(raw){
      try{
        const arr = JSON.parse(raw);
        this.events = arr.map(o => new EventItem({...o, date: o.date}));
      }catch(e){
        console.error('Error cargando eventos', e);
        this.events = [];
      }
    }else{
      this.seed();
    }
  }

  seed(){
    const now = new Date();
    const later = d => new Date(now.getTime() + d*24*3600*1000).toISOString();
    const sample = [
      {id: 'e1', name:'Feria de Comida', date: later(3), location:'Centro Convenciones', category:'Restaurantes', capacity:200, registeredCount:6, description:'Comida típica y gourmet del Peru', open:true},
      {id: 'e2', name:'Carrera 5K Ciudad PIURA', date: later(10), location:'Parque Central', category:'Deporte', capacity:500, registeredCount:120, description:'Carrera abierta para toda la familia.', open:true},
      {id: 'e3', name:'Concierto Dua Lipa', date: later(7), location:'Estadio Nacional Lima', category:'Música', capacity:550, registeredCount:349, description:'TOUR RADICAL OPTIMISM.', open:true},
      {id: 'e4', name:'Taller de Fotografía Profecional', date: later(5), location:'Estudio LUZ', category:'Arte', capacity:20, registeredCount:3, description:'Taller práctico con salida de campo.', open:true},
      {id: 'e5', name:'Seminario IA y Ética Para el desarrollo', date: later(15), location:'Universidad', category:'Educación', capacity:120, registeredCount:10, description:'Debate sobre IA y derechos.', open:true}
    ];
    this.events = sample.map(s => new EventItem(s));
    this.save();
  }

  save(){
    localStorage.setItem(this.storageKey, JSON.stringify(this.events.map(e => e.toJSON())));
  }

  getCategories(){
    const set = new Set(this.events.map(e => e.category));
    return Array.from(set).sort();
  }

  filter({q='', category='', date=''}){
    const ql = q.trim().toLowerCase();
    return this.events.filter(e => {
      const matchQ = ql === '' || (e.name.toLowerCase().includes(ql) || e.location.toLowerCase().includes(ql) || e.category.toLowerCase().includes(ql));
      const matchCategory = !category || e.category === category;
      const matchDate = !date || e.date.toISOString().slice(0,10) === date;
      return matchQ && matchCategory && matchDate;
    }).sort((a,b)=>a.date-b.date);
  }

  findById(id){ return this.events.find(e=>e.id===id); }

  register(id){
    const ev = this.findById(id);
    if(!ev) throw new Error('Evento no encontrado');
    if(!ev.canRegister()) throw new Error('No se puede registrar (cerrado o lleno)');
    ev.registeredCount += 1;
    this.save();
    return ev;
  }

  cancel(id){
    const ev = this.findById(id);
    if(!ev) throw new Error('Evento no encontrado');
    if(ev.registeredCount > 0){ ev.registeredCount -= 1; this.save(); return ev; }
    return ev;
  }
}

class UserRegistry {
  constructor(storageKey='user_regs_v1'){
    this.storageKey = storageKey;
    this.regs = {}; 
    this.userId = 'demo_user'; 
    this.load();
  }

  load(){
    const raw = localStorage.getItem(this.storageKey);
    if(raw){
      try{
        const obj = JSON.parse(raw);
        this.regs = {};
        for(const [k,v] of Object.entries(obj)) this.regs[k]= new Set(v);
      }catch(e){ this.regs = {}; }
    }
  }

  save(){
    const obj = {};
    for(const [k,v] of Object.entries(this.regs)) obj[k]=Array.from(v);
    localStorage.setItem(this.storageKey, JSON.stringify(obj));
  }

  isRegistered(eventId){
    const s = this.regs[this.userId] || new Set();
    return s.has(eventId);
  }

  register(eventId){
    if(!this.regs[this.userId]) this.regs[this.userId]= new Set();
    this.regs[this.userId].add(eventId);
    this.save();
  }

  cancel(eventId){
    if(this.regs[this.userId]){ this.regs[this.userId].delete(eventId); this.save(); }
  }

  getMyRegs(){ return Array.from(this.regs[this.userId] || []); }
}

const EM = new EventManager();
const UR = new UserRegistry();

const eventsList = document.getElementById('eventsList');
const myRegsList = document.getElementById('myRegsList');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const dateFilter = document.getElementById('dateFilter');
const clearFilters = document.getElementById('clearFilters');
const detailsModal = document.getElementById('detailsModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

function renderCategories(){
  const cats = EM.getCategories();
  categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderEvents(){
  const q = searchInput.value;
  const cat = categoryFilter.value;
  const date = dateFilter.value;
  const arr = EM.filter({q, category:cat, date});
  eventsList.innerHTML = '';
  if(arr.length === 0){
    eventsList.innerHTML = '<li class="empty">No se encontraron eventos con esos criterios</li>';
    return;
  }
  for(const e of arr){
    const li = document.createElement('li');
    li.className = 'event-card';
    li.innerHTML = `
      <div class="event-head">
        <div>
          <div class="event-title">${escapeHtml(e.name)}</div>
          <div class="event-meta small">${formatDate(e.date)} · ${e.location} · ${e.category}</div>
        </div>
        <div class="event-actions" role="group" aria-label="Acciones del evento ${escapeHtml(e.name)}">
          <button class="action-btn" data-id="${e.id}" data-action="details">Detalles</button>
          ${ UR.isRegistered(e.id) ? `<button class="action-btn cancel" data-id="${e.id}" data-action="cancel">Cancelar</button>` :
            `<button class="action-btn register" data-id="${e.id}" data-action="register" ${!e.canRegister() ? 'disabled aria-disabled="true"' : ''}>${e.isFull() ? 'Lleno' : 'Inscribirme'}</button>`
          }
        </div>
      </div>
      <div class="small">Inscritos: ${e.registeredCount}/${e.capacity}</div>
    `;
    eventsList.appendChild(li);
  }
}

function renderMyRegs(){
  const ids = UR.getMyRegs();
  myRegsList.innerHTML = '';
  if(ids.length === 0){
    myRegsList.innerHTML = '<li class="empty">No te has inscrito a ningún evento</li>';
    return;
  }
  for(const id of ids){
    const e = EM.findById(id);
    if(!e) continue;
    const li = document.createElement('li');
    li.className = 'reg-item';
    li.innerHTML = `
      <div>
        <div class="event-title">${escapeHtml(e.name)}</div>
        <div class="small">${formatDate(e.date)} · ${e.location}</div>
      </div>
      <div>
        <button class="action-btn cancel" data-id="${e.id}" data-action="cancel">Cancelar</button>
        <button class="action-btn" data-id="${e.id}" data-action="details">Detalles</button>
      </div>
    `;
    myRegsList.appendChild(li);
  }
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('button[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if(action === 'details'){
    showDetails(id);
  }else if(action === 'register'){
    try{
      EM.register(id);
      UR.register(id);
      renderEvents(); renderMyRegs();
      btn.focus();
    }catch(err){
      alert(err.message);
    }
  }else if(action === 'cancel'){
    EM.cancel(id); UR.cancel(id);
    renderEvents(); renderMyRegs();
  }
});

document.addEventListener('keydown', (ev) => {
  if(ev.key === 'Escape') closeDetails();
});

closeModal.addEventListener('click', closeDetails);
detailsModal.addEventListener('click', (ev)=>{ if(ev.target===detailsModal) closeDetails(); });

function showDetails(id){
  const e = EM.findById(id);
  if(!e) return;
  modalBody.innerHTML = `
    <h3>${escapeHtml(e.name)}</h3>
    <p class="kv">${formatDate(e.date)} · ${escapeHtml(e.location)} · ${escapeHtml(e.category)}</p>
    <p>${escapeHtml(e.description)}</p>
    <p class="kv">Inscritos: ${e.registeredCount}/${e.capacity}</p>
    <div style="margin-top:12px;">
      ${ UR.isRegistered(e.id) ? `<button class="btn cancel" data-id="${e.id}" data-action="cancel">Cancelar inscripción</button>` :
        `<button class="btn" data-id="${e.id}" data-action="register" ${!e.canRegister() ? 'disabled aria-disabled="true"' : ''}>${e.isFull() ? 'Evento lleno' : 'Inscribirme'}</button>`
      }
      <button class="btn" style="background:#f3f4f6;color:#111;border:1px solid #e6e9ee;margin-left:8px;" id="modalClose">Cerrar</button>
    </div>
  `;
  detailsModal.setAttribute('aria-hidden', 'false');
  detailsModal.style.display = 'flex';
  const first = detailsModal.querySelector('button[data-action]') || document.getElementById('modalClose');
  first && first.focus();
}

function closeDetails(){
  detailsModal.setAttribute('aria-hidden', 'true');
  detailsModal.style.display = 'none';
}

function formatDate(d){ const dd = new Date(d); return dd.toLocaleString(); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[c])); }

searchInput.addEventListener('input', () => renderEvents());
categoryFilter.addEventListener('change', () => renderEvents());
dateFilter.addEventListener('change', () => renderEvents());
clearFilters.addEventListener('click', ()=>{ searchInput.value=''; categoryFilter.value=''; dateFilter.value=''; renderEvents(); });

renderCategories();
renderEvents();
renderMyRegs();

// src/App.jsx
import CustomerForm from "./components/CustomerForm";

function App() {
  return (
    <div>
      <h1>CRM Atlantic City - Registro de Clientes</h1>
      <CustomerForm />
    </div>
  );
}

export default App;

