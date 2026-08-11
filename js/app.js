     /* app.js - upgraded features: filtering, cart, theme, reservation validation, animations, backend integration */
document.addEventListener('DOMContentLoaded', function () {

  // ---------- Backend config ----------
  const API_BASE = 'https://caleb-royale-cafe-backend.onrender.com/api';

  function getToken(){ return localStorage.getItem('authToken'); }
  function setToken(t){ localStorage.setItem('authToken', t); }
  function clearToken(){ localStorage.removeItem('authToken'); }
  function getAccount(){ try{ return JSON.parse(localStorage.getItem('authUser')); }catch(e){ return null; } }
  function setAccount(u){ localStorage.setItem('authUser', JSON.stringify(u)); }
  function clearAccount(){ localStorage.removeItem('authUser'); }

  async function apiFetch(path, options = {}){
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if(token) headers['Authorization'] = 'Bearer ' + token;
    let res, data;
    try{
      res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
      data = await res.json().catch(()=> ({}));
    } catch(err){
      throw new Error('Cannot reach the server. Is the backend running on http://localhost:4000?');
    }
    if(!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }

  // ---------- Data ----------

  const menuItems = [

    {
      id: 'j1',
      title: 'Jollof Rice',
      desc: 'Classic smoky Nigerian Jollof served with fried plantain.',
      category: 'Jollof Rice',
      price: 3500,
      img: 'assets/Jollof%20Rice%20image.jpg'
    },

    {
      id: 'f1',
      title: 'Fried Rice',
      desc: 'Colorful fried rice seasoned with vegetables and spices.',
      category: 'Fried Rice',
      price: 3800,
      img: 'assets/Fried%20Rice%20image.jpg'
    },

    {
      id: 'm1',
      title: 'Moi Moi',
      desc: 'Steamed bean pudding with egg and fish filling.',
      category: 'Moi-Moi',
      price: 1200,
      img: 'assets/Moi%20Moi%20image.jpg'
    },

    {
      id: 'p1',
      title: 'Pounded Yam & Egusi',
      desc: 'Soft pounded yam paired with rich egusi soup.',
      category: 'Pounded Yam & Egusi',
      price: 4500,
      img: 'assets/Pounded%20Yam%20And%20Egusi%20Soup.jpg'
    },

    {
      id: 's1',
      title: 'Suya',
      desc: 'Perfectly spiced grilled beef kebab with onions and pepper.',
      category: 'Suya',
      price: 2000,
      img: 'assets/Suya%20image.jpg'
    },

    {
      id: 'ps1',
      title: 'Pepper Soup',
      desc: 'Hot and spicy broth cooked with assorted meats.',
      category: 'Pepper Soup',
      price: 2800,
      img: 'assets/Pepper%20Soup%20image.jpg'
    },

    {
      id: 'a1',
      title: 'Amala & Ewedu',
      desc: 'Traditional Yoruba delicacy served with gbegiri.',
      category: 'Amala & Ewedu',
      price: 3200,
      img: 'assets/Amala%20And%20Ewedu%20image.jpg'
    },

    {
      id: 'ak1',
      title: 'Akara',
      desc: 'Crispy bean cakes perfect for breakfast.',
      category: 'Akara',
      price: 800,
      img: 'assets/Akara%20image.jpeg'
    },

    {
      id: 'og1',
      title: 'Ogbono Soup And Eba',
      desc: 'Traditional Igbo delicacy served.',
      category: 'Ogbono Soup and Eba',
      price: 3000,
      img: 'assets/Ogbono%20Soup%20and%20Eba%20Image.jpeg'
    }

  ];

  // ---------- Elements ----------

  const menuGrid = document.getElementById('menuGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryList = document.getElementById('categoryList');

  const filterBtns = Array.from(
    document.querySelectorAll('.cat-btn')
  );

  const cartModal = document.getElementById('cartModal');
  const viewCartBtn = document.getElementById('viewCartBtn');
  const closeCartBtn = document.getElementById('closeCart');

  const cartListEl = document.getElementById('cartList');
  const subtotalEl = document.getElementById('subtotal');
  const cartCountEl = document.getElementById('cartCount');

  const clearCartBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const toast = document.getElementById('toast');

  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  const themeToggle = document.getElementById('themeToggle');

  const orderNowBtn = document.getElementById('orderNowBtn');

  // ---------- Utilities ----------

  function formatNGN(n){ return '₦' + new Intl.NumberFormat().format(n); }
  function showToast(msg){ toast.textContent = msg; toast.style.display='block'; toast.setAttribute('aria-hidden','false'); setTimeout(()=>{ toast.style.display='none'; toast.setAttribute('aria-hidden','true'); },2000); }

  // ---------- Render Menu ----------
  function renderMenu(items){
    menuGrid.innerHTML = '';
    if(items.length === 0){
      menuGrid.innerHTML = `<p style="grid-column:1/-1;color:var(--muted)">No items found.</p>`;
      return;
    }
    items.forEach(it => {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('data-aos','zoom-in');
      card.innerHTML = `
        <div class="card-figure" style="background-image:url('${it.img}')"></div>
        <div class="card-body">
          <div>
            <h3 class="card-title">${it.title}</h3>
            <p class="card-desc">${it.desc}</p>
          </div>
          <div class="card-meta">
            <div class="price">${formatNGN(it.price)}</div>
            <div class="add-row">
              <input class="qty" type="number" min="1" value="1" aria-label="Quantity for ${it.title}">
              <button class="btn btn-primary add-btn" data-id="${it.id}"><i class="fas fa-plus"></i> Add</button>
            </div>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  }

  // ---------- Filtering ----------
  function filterAndSearch(){
    const q = searchInput.value.trim().toLowerCase();
    const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
    let results = menuItems.filter(i => (activeCat === 'all' || i.category === activeCat));
    if(q) results = results.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    renderMenu(results);
    AOS.refresh(); // refresh AOS for newly added elements
  }

  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      filterAndSearch();
    });
  });
  searchInput.addEventListener('input', ()=>filterAndSearch());

  // ---------- Cart ----------
  let cart = {}; // id: {item, qty}
  function addToCart(id, qty){
    const item = menuItems.find(m=>m.id===id);
    if(!item) return;
    const q = Math.max(1, Number(qty || 1));
    if(cart[id]) cart[id].qty += q; else cart[id] = {item, qty: q};
    updateCartUI();
    showToast(`${item.title} added (x${q})`);
  }
  function updateCartUI(){
    const totalQty = Object.values(cart).reduce((s,c)=>s + c.qty, 0);
    cartCountEl.textContent = totalQty;
    cartListEl.innerHTML = '';
    for(const key in cart){
      const {item, qty} = cart[key];
      const li = document.createElement('li');
      li.className = 'cart-row';
      li.innerHTML = `
        <div class="row-left">
          <div style="font-weight:600">${item.title}</div>
          <div style="color:var(--muted); font-size:13px">${formatNGN(item.price)} each</div>
        </div>
        <div class="row-right">
          <input type="number" class="qty cart-qty" min="1" value="${qty}" data-id="${key}">
          <div style="min-width:80px; text-align:right">${formatNGN(item.price * qty)}</div>
          <button class="btn btn-outline remove-btn" data-id="${key}">Remove</button>
        </div>
      `;
      cartListEl.appendChild(li);
    }
    const subtotal = Object.values(cart).reduce((s,c)=>s + c.item.price * c.qty, 0);
    subtotalEl.textContent = formatNGN(subtotal);
  }
  document.addEventListener('click', (e)=>{
    if(e.target.closest('.add-btn')){
      const btn = e.target.closest('.add-btn');
      const id = btn.dataset.id;
      const qtyInput = btn.closest('.card-body').querySelector('.qty');
      addToCart(id, Number(qtyInput.value || 1));
    }
    if(e.target.matches('.remove-btn')){ removeItem(e.target.dataset.id); }
  });
  document.addEventListener('input', (e)=>{
    if(e.target.matches('.cart-qty')){
      const id = e.target.dataset.id;
      const val = Math.max(1, Number(e.target.value || 1));
      cart[id].qty = val;
      updateCartUI();
    }
  });
  function removeItem(id){ delete cart[id]; updateCartUI(); }
  function clearCart(){ cart = {}; updateCartUI(); }
  clearCartBtn.addEventListener('click', ()=>{ clearCart(); showToast('Cart cleared'); });
  checkoutBtn.addEventListener('click', async () => {
    if(Object.keys(cart).length === 0){ showToast('Your cart is empty'); return; }

    const account = getAccount();
    let customerName = account ? account.name : '';
    let customerEmail = account ? account.email : '';

    if(!customerName){
      customerName = window.prompt('Name for this order:') || '';
      if(!customerName.trim()){ showToast('Order cancelled — a name is required'); return; }
    }

    const items = Object.values(cart).map(c => ({ id: c.item.id, title: c.item.title, price: c.item.price, qty: c.qty }));

    try{
      const data = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items, customerName, customerEmail })
      });
      showToast(data.message || 'Checkout successful — thank you!');
      clearCart();
      cartModal.setAttribute('aria-hidden','true');
    } catch(err){
      showToast(err.message);
    }
  });
  viewCartBtn.addEventListener('click', ()=>{ cartModal.setAttribute('aria-hidden','false'); updateCartUI(); });
  closeCartBtn.addEventListener('click', ()=> cartModal.setAttribute('aria-hidden','true'));
  cartModal.addEventListener('click', (ev)=> { if(ev.target === cartModal) cartModal.setAttribute('aria-hidden','true'); });

  // ---------- Nav toggle ----------
  navToggle.addEventListener('click', ()=> navList.classList.toggle('show'));

  // ---------- Theme toggle ----------
  if (themeToggle) {
    function setTheme(theme){
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      const icon = document.getElementById('themeIcon');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    themeToggle.addEventListener('click', ()=> setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  } else {
    console.warn('themeToggle button not found in the page — check that #themeToggle exists in index.html');
  }

  // ---------- Reservation form validation + submission ----------
  const reservationForm = document.getElementById('reservationForm');
  reservationForm.addEventListener('submit', async function(e){
    e.preventDefault();
    let ok = true;
    // simple validators
    const name = document.getElementById('rname'); const phone = document.getElementById('rphone');
    const email = document.getElementById('remail'); const date = document.getElementById('rdate');
    const time = document.getElementById('rtime'); const guests = document.getElementById('rguests');
    // reset errors
    document.querySelectorAll('.error').forEach(n=>n.textContent='');
    if(name.value.trim().length < 2){ document.getElementById('err-name').textContent='Please enter your name'; ok=false; }
    if(!/^\d{7,15}$/.test(phone.value.trim())){ document.getElementById('err-phone').textContent='Enter a valid phone number'; ok=false; }
    if(email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())){ document.getElementById('err-email').textContent='Enter a valid email'; ok=false; }
    if(!date.value){ document.getElementById('err-date').textContent='Select a date'; ok=false; }
    if(!time.value){ document.getElementById('err-time').textContent='Select a time'; ok=false; }
    if(!guests.value || Number(guests.value) < 1){ document.getElementById('err-guests').textContent='Enter number of guests'; ok=false; }
    if(!ok){ showToast('Please fix the form errors'); return; }

    try{
      const data = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim() || undefined,
          phone: phone.value.trim(),
          date: date.value,
          time: time.value,
          guests: Number(guests.value)
        })
      });
      showToast(data.message || 'Reservation confirmed!');
      reservationForm.reset();
    } catch(err){
      showToast(err.message);
    }
  });

  // ---------- Login / Signup (real accounts via backend) ----------
  const authTitle = document.getElementById('authTitle');
  const signupNameInput = document.getElementById('signupName');
  const authEmailInput = document.getElementById('authEmail');
  const authPasswordInput = document.getElementById('authPassword');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authToggleText = document.getElementById('authToggleText');
  const authToggleLink = document.getElementById('authToggleLink');
  const authForm = document.getElementById('authForm');
  const accountPanel = document.getElementById('accountPanel');
  const accountNameEl = document.getElementById('accountName');
  const logoutBtn = document.getElementById('logoutBtn');
  const viewOrdersBtn = document.getElementById('viewOrdersBtn');
  const orderHistoryList = document.getElementById('orderHistoryList');

  let authMode = 'login'; // or 'signup'

  function renderAuthUI(){
    const account = getAccount();
    if(account){
      authForm.style.display = 'none';
      accountPanel.style.display = 'block';
      accountNameEl.textContent = account.name;
    } else {
      authForm.style.display = 'block';
      accountPanel.style.display = 'none';
    }
  }

  authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    authMode = authMode === 'login' ? 'signup' : 'login';
    if(authMode === 'signup'){
      authTitle.textContent = 'Create an Account';
      signupNameInput.style.display = 'block';
      authSubmitBtn.textContent = 'Sign Up';
      authToggleText.textContent = 'Already have an account?';
      authToggleLink.textContent = 'Log in here';
    } else {
      authTitle.textContent = 'Login Here';
      signupNameInput.style.display = 'none';
      authSubmitBtn.textContent = 'Login';
      authToggleText.textContent = "Don't have an account?";
      authToggleLink.textContent = 'Sign up here';
    }
  });

  authSubmitBtn.addEventListener('click', async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    if(!email || !password){ showToast('Please enter your email and password'); return; }

    try{
      let data;
      if(authMode === 'signup'){
        const name = signupNameInput.value.trim();
        if(!name){ showToast('Please enter your name'); return; }
        data = await apiFetch('/auth/signup', { method:'POST', body: JSON.stringify({ name, email, password }) });
      } else {
        data = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
      }
      setToken(data.token);
      setAccount(data.user);
      renderAuthUI();
      showToast(`Welcome, ${data.user.name}!`);
      authEmailInput.value = ''; authPasswordInput.value = ''; signupNameInput.value = '';
    } catch(err){
      showToast(err.message);
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    clearAccount();
    renderAuthUI();
    orderHistoryList.innerHTML = '';
    showToast('Logged out');
  });

  viewOrdersBtn.addEventListener('click', async () => {
    try{
      const data = await apiFetch('/orders/mine');
      orderHistoryList.innerHTML = '';
      if(data.orders.length === 0){
        orderHistoryList.innerHTML = '<li>No orders yet.</li>';
        return;
      }
      data.orders.forEach(o => {
        const li = document.createElement('li');
        li.className = 'cart-row';
        const itemsText = o.items.map(i => `${i.title} x${i.qty}`).join(', ');
        li.innerHTML = `<div class="row-left"><div style="font-weight:600">${itemsText}</div><div style="color:var(--muted); font-size:13px">${o.created_at}</div></div><div class="row-right">${formatNGN(o.subtotal)}</div>`;
        orderHistoryList.appendChild(li);
      });
    } catch(err){
      showToast(err.message);
    }
  });

  renderAuthUI();

  // ---------- Contact form ----------
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  contactSubmitBtn.addEventListener('click', async () => {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    if(!name || !email || !message){ showToast('Please fill in all fields'); return; }
    try{
      const data = await apiFetch('/contact', { method:'POST', body: JSON.stringify({ name, email, message }) });
      showToast(data.message);
      document.getElementById('contactName').value = '';
      document.getElementById('contactEmail').value = '';
      document.getElementById('contactMessage').value = '';
    } catch(err){
      showToast(err.message);
    }
  });

  // ---------- Init ----------
  renderMenu(menuItems);
  updateCartUI();

  // scroll to order
  orderNowBtn.addEventListener('click', ()=> { window.scrollTo({top: document.getElementById('menuSection').offsetTop - 60, behavior:'smooth'}); });

  // set copyright year
  document.getElementById('year').textContent = new Date().getFullYear();
});
