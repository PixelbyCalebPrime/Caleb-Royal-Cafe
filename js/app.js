     /* app.js - upgraded features: filtering, cart, theme, reservation validation, animations */
document.addEventListener('DOMContentLoaded', function () {

  // ---------- Data ----------

  const menuItems = [

    {
      id: 'j1',
      title: 'Jollof Rice',
      desc: 'Classic smoky Nigerian Jollof served with fried plantain.',
      category: 'jollof',
      price: 3500,
      img: 'https://t4.ftcdn.net/jpg/12/92/81/49/240_F_1292814964_cINtJDBFzTcfhlSAKtprK3erb0ltmRSM.jpg'
    },

    {
      id: 'f1',
      title: 'Fried Rice',
      desc: 'Colorful fried rice seasoned with vegetables and spices.',
      category: 'fried',
      price: 3800,
      img: 'https://allnigerianfoods.com/wp-content/uploads/fried_rice_recipe.jpg'
    },

    {
      id: 'm1',
      title: 'Moi Moi',
      desc: 'Steamed bean pudding with egg and fish filling.',
      category: 'moi',
      price: 1200,
      img: 'https://pulses.org/images/com_yoorecipe/422/cropped-moi-moi-rollup.jpg'
    },

    {
      id: 'p1',
      title: 'Pounded Yam & Egusi',
      desc: 'Soft pounded yam paired with rich egusi soup.',
      category: 'pounded',
      price: 4500,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL3Y-wbiDaGu9Aj3-x13vRQEsh-kS62yXOKQ&s'
    },

    {
      id: 's1',
      title: 'Suya',
      desc: 'Perfectly spiced grilled beef kebab with onions and pepper.',
      category: 'suya',
      price: 2000,
      img: 'https://theafrikanstore.com/cdn/shop/articles/Suya_61132cc9-4e06-48b9-b4cf-0d975e79b67b_460x@2x.jpg?v=1688103586'
    },

    {
      id: 'ps1',
      title: 'Pepper Soup',
      desc: 'Hot and spicy broth cooked with assorted meats.',
      category: 'pepper',
      price: 2800,
      img: 'https://images.squarespace-cdn.com/content/v1/614f831e90f08045038b4dae/aee89930-fe76-47c8-84b0-8b9e392d8989/pepper-soup-goat-meat.jpeg'
    },

    {
      id: 'a1',
      title: 'Amala & Ewedu',
      desc: 'Traditional Yoruba delicacy served with gbegiri.',
      category: 'amala',
      price: 3200,
      img: 'https://yummieliciouz.com/wp-content/uploads/2023/11/ewedu-soup-1024x683.webp'
    },

    {
      id: 'ak1',
      title: 'Akara',
      desc: 'Crispy bean cakes perfect for breakfast.',
      category: 'akara',
      price: 800,
      img: 'Akara image.jpeg'
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

  function formatNGN(n) {
    return '₦' + new Intl.NumberFormat().format(n);
  }

  function showToast(msg) {

    toast.textContent = msg;

    toast.style.display = 'block';

    toast.setAttribute(
      'aria-hidden',
      'false'
    );

    setTimeout(() => {

      toast.style.display = 'none';

      toast.setAttribute(
        'aria-hidden',
        'true'
      );

    }, 2000);

  }

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
  checkoutBtn.addEventListener('click', ()=> {
    if(Object.keys(cart).length === 0){ showToast('Your cart is empty'); return; }
    showToast('Checkout successful — thank you!');
    clearCart();
    cartModal.setAttribute('aria-hidden','true');
  });
  viewCartBtn.addEventListener('click', ()=>{ cartModal.setAttribute('aria-hidden','false'); updateCartUI(); });
  closeCartBtn.addEventListener('click', ()=> cartModal.setAttribute('aria-hidden','true'));
  cartModal.addEventListener('click', (ev)=> { if(ev.target === cartModal) cartModal.setAttribute('aria-hidden','true'); });

  // ---------- Nav toggle ----------
  navToggle.addEventListener('click', ()=> navList.classList.toggle('show'));

  // ---------- Theme toggle ----------
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);
  themeToggle.addEventListener('click', ()=> setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  // ---------- Reservation form validation ----------
  const reservationForm = document.getElementById('reservationForm');
  reservationForm.addEventListener('submit', function(e){
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
    // simulate success
    showToast('Reservation confirmed — we look forward to seeing you!');
    reservationForm.reset();
  });

  // ---------- Init ----------
  renderMenu(menuItems);
  updateCartUI();

  // scroll to order
  orderNowBtn.addEventListener('click', ()=> { window.scrollTo({top: document.getElementById('menuSection').offsetTop - 60, behavior:'smooth'}); });

  // set copyright year
  document.getElementById('year').textContent = new Date().getFullYear();
});
