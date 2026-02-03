
(function(){
  const fmt = (n)=> new Intl.NumberFormat('tr-TR').format(n);

  // --- Slider (ok + drag + tek tek hero) ---
  function enableSlider(wrapper){
    const track = wrapper.querySelector('.track');
    const left = wrapper.querySelector('.arrow.left');
    const right = wrapper.querySelector('.arrow.right');
    if(!track || !left || !right) return;

    const kind = wrapper.getAttribute('data-kind') || '';
    const step = ()=> (kind === 'hero') ? track.clientWidth : Math.min(560, track.clientWidth * 0.9);

    left.addEventListener('click', ()=> track.scrollBy({left:-step(), behavior:'smooth'}));
    right.addEventListener('click', ()=> track.scrollBy({left: step(), behavior:'smooth'}));

    let down=false, startX=0, startL=0;
    track.addEventListener('mousedown',(e)=>{ down=true; startX=e.pageX; startL=track.scrollLeft; });
    window.addEventListener('mouseup',()=>{ down=false; });
    track.addEventListener('mousemove',(e)=>{
      if(!down) return;
      e.preventDefault();
      track.scrollLeft = startL - (e.pageX - startX);
    });
  }

  // --- Products ---
  const catalog = document.getElementById('catalog');

  function cardHTML(cat, p){
    const waText = encodeURIComponent(
      `Merhaba, ${cat.title} için fiyat almak istiyorum.\n`+
      `Ürün: ${p.name}\nEbat: ${p.size}\n`+
      `Piyasa: ₺${fmt(p.market)}\nBizim fiyat: ₺${fmt(p.our)}\n`
    );
    const waUrl = `https://wa.me/${DATA.wa}?text=${waText}`;
    const callUrl = `tel:${DATA.phone_tel}`;

    return `
      <div class="card" data-season="${p.season}" data-size="${p.size}">
        <div class="cardImg"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
        <div class="cardBody">
          <div class="cardName">${p.name}</div>
          <div class="cardMeta">${p.size}</div>
          <p class="cardDesc">${p.desc}</p>
          <div class="priceRow">
            <div class="prices">
              <span class="old">₺${fmt(p.market)}</span>
              <span class="new">₺${fmt(p.our)}</span>
            </div>
            <span class="badge">Uygun Fiyat</span>
          </div>
          <div class="actions">
            <a class="btn btnWA" target="_blank" rel="noopener" href="${waUrl}">WhatsApp</a>
            <a class="btn btnCall" href="${callUrl}">Ara</a>
          </div>
        </div>
      </div>
    `;
  }

  (DATA.categories || []).forEach(cat=>{
    const sec=document.createElement('section');
    sec.className='section';
    sec.id=cat.id;

    sec.innerHTML = `
      <div class="container">
        <div class="sectionHead">
          <div>
            <h2 class="sectionTitle">${cat.title}</h2>
            <div class="sectionSub">${cat.subtitle || ''}</div>
          </div>
        </div>

        <div class="slider" data-slider>
          <button class="arrow left" type="button" aria-label="Sola">‹</button>
          <div class="track"></div>
          <button class="arrow right" type="button" aria-label="Sağa">›</button>
        </div>
      </div>
    `;
    const track = sec.querySelector('.track');
    track.innerHTML = (cat.products || []).map(p=>cardHTML(cat,p)).join('');
    catalog.appendChild(sec);
  });

  // Enable sliders after DOM built
  document.querySelectorAll('[data-slider]').forEach(enableSlider);

  // --- Filter dynamic options ---
  const fArac = document.getElementById('fArac');
  const fEbat = document.getElementById('fEbat');
  const fMevsim = document.getElementById('fMevsim');
  const fKat = document.getElementById('fKat');
  const btnFiltre = document.getElementById('btnFiltre');
  const btnWA = document.getElementById('btnWA');

  const EBATLAR = {
    "Otomobil": ["185/65 R15","195/65 R15","205/55 R16","215/55 R17","225/45 R17"],
    "SUV / 4x4": ["215/60 R17","225/60 R18","235/55 R18","255/55 R19","265/60 R18"],
    "Hafif Ticari": ["195/75 R16C","205/65 R16C","215/65 R16C","225/70 R15C"],
    "Kamyonet": ["225/75 R16","235/75 R16","245/70 R16","265/70 R16"],
    "Endüstriyel": ["7.50 R16","8.25 R16","10.00-20","12.00-20"]
  };

  function fillEbat(){
    const arac = fArac?.value || "";
    const arr = EBATLAR[arac] || ["195/65 R15","205/55 R16","215/55 R17"];
    fEbat.innerHTML = [`<option value="">Seçiniz</option>`].concat(
      arr.map(x=>`<option value="${x}">${x}</option>`)
    ).join('');
  }

  function applyFilter(){
    const season = fMevsim?.value || '';
    const size = fEbat?.value || '';
    const cat = fKat?.value || '';

    document.querySelectorAll('main#catalog > section.section').forEach(sec=>{
      if(!cat){ sec.classList.remove('hidden'); return; }
      sec.classList.toggle('hidden', sec.id !== cat);
    });

    document.querySelectorAll('main#catalog .card').forEach(card=>{
      let ok = true;
      if(season && card.dataset.season !== season) ok=false;
      if(size && card.dataset.size !== size) ok=false;
      card.classList.toggle('hidden', !ok);
    });
  }

  // initial fill + listeners
  fillEbat();
  fArac?.addEventListener('change', ()=>{ fillEbat(); applyFilter(); });
  [fMevsim, fEbat, fKat].forEach(el=> el?.addEventListener('change', applyFilter));
  btnFiltre?.addEventListener('click', applyFilter);

  btnWA?.addEventListener('click', ()=>{
    const arac = fArac?.value || 'Seçilmedi';
    const ebat = fEbat?.value || 'Seçilmedi';
    const mevsimText = fMevsim?.selectedOptions?.[0]?.textContent || 'Seçilmedi';
    const katText = fKat?.selectedOptions?.[0]?.textContent || 'Hepsi';
    const text = encodeURIComponent(
      `Merhaba, filtrelemeye göre fiyat almak istiyorum.\nAraç: ${arac}\nEbat: ${ebat}\nMevsim: ${mevsimText}\nKategori: ${katText}`
    );
    window.open(`https://wa.me/${DATA.wa}?text=${text}`, '_blank', 'noopener');
  });

  // Apply once
  applyFilter();
})();
