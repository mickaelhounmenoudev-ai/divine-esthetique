/* Divine Esthétique – scripts du site */

/* ---------- Thème, menu actif, apparition ---------- */
(function () {
	var root = document.documentElement;
	var btn = document.getElementById('theme-toggle');

	function majBouton() {
		var sombre = root.dataset.theme === 'dark';
		if (btn) {
			btn.textContent = sombre ? 'Mode clair' : 'Mode sombre';
			btn.setAttribute('aria-pressed', sombre ? 'true' : 'false');
		}
	}

	if (btn) {
		btn.addEventListener('click', function () {
			var sombre = root.dataset.theme !== 'dark';
			root.dataset.theme = sombre ? 'dark' : 'light';
			try { localStorage.setItem('th', sombre ? 'dark' : 'light'); } catch (e) {}
			majBouton();
		});
	}
	majBouton();

	var chemin = location.pathname.replace(/\/+$/, '') || '/';
	document.querySelectorAll('.nav a').forEach(function (a) {
		var cible = a.getAttribute('href').replace(/\/+$/, '') || '/';
		if (cible === chemin) { a.classList.add('on'); }
	});

	var els = document.querySelectorAll('.vv');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (liste) {
			liste.forEach(function (x) {
				if (x.isIntersecting) { x.target.classList.add('v'); io.unobserve(x.target); }
			});
		}, { threshold: 0.12 });
		els.forEach(function (e) { io.observe(e); });
	} else {
		els.forEach(function (e) { e.classList.add('v'); });
	}
})();

/* ---------- Sélection des services, prix et compteurs ---------- */
(function () {
	var CLE = 'de_sel';
	var NUM = '2290159080987';
	var sel = [];
	var ouvert = false;
	try { sel = JSON.parse(sessionStorage.getItem(CLE) || '[]'); } catch (e) { sel = []; }

	/* Tarifs en FCFA. 'ex' = prix exact, 'min' = « à partir de ».
	   Le 3e élément indique le service auquel appartient une prestation.
	   À mettre à jour ici si les prix changent. */
	var P = {
		'Soins du visage': [6000, 'min'],
		'Massage': [8000, 'min'],
		'Épilation': [2500, 'min'],
		'Manucure': [2000, 'ex'],
		'Pédicure': [6000, 'ex'],
		'Gommage corporel': [8000, 'ex'],
		'Soin de visage classique': [6000, 'ex', 'Soins du visage'],
		'Soin de visage anti-tâches/acné': [8000, 'ex', 'Soins du visage'],
		'Massage relaxant': [8000, 'ex', 'Massage'],
		'Massage à la pierre chaude': [12000, 'ex', 'Massage'],
		'Épilation crème': [2500, 'ex', 'Épilation'],
		'Épilation cire': [5000, 'ex', 'Épilation'],
		'Pédicure prestige': [10000, 'ex'],
		'Gommage': [8000, 'ex', 'Gommage corporel'],
		'Vagacial': [10000, 'ex'],
		'Pédicure + manucure': [7000, 'ex'],
		'Soin de visage + pédicure + manucure + gommage': [20000, 'ex'],
		'Soin de visage + gommage + massage + pédicure + manucure': [26000, 'ex'],
		'Soin de visage + gommage + massage + pédicure prestige': [30000, 'ex'],
		'Soin de visage + gommage + massage + pédicure prestige + vagacial': [35000, 'ex']
	};

	function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0FCFA'; }

	function utiles() {
		return sel.filter(function (n) {
			return !sel.some(function (m) { return m !== n && P[m] && P[m][2] === n; });
		});
	}

	function calcul() {
		var l = utiles(), t = 0, min = false;
		l.forEach(function (n) {
			var p = P[n];
			if (p) { t += p[0]; if (p[1] === 'min') { min = true; } } else { min = true; }
		});
		return { liste: l, total: t, min: min };
	}

	function sauver() {
		try { sessionStorage.setItem(CLE, JSON.stringify(sel)); } catch (e) {}
	}

	function panneau(o) {
		ouvert = o;
		var p = document.getElementById('bar-panel');
		var b = document.getElementById('bar-toggle');
		if (p) { p.hidden = !o; }
		if (b) { b.setAttribute('aria-expanded', o ? 'true' : 'false'); }
		document.body.classList.toggle('po', o);
	}

	function maj() {
		var n = sel.length;
		var c = calcul();
		document.querySelectorAll('.tg').forEach(function (b) {
			var o = sel.indexOf(b.dataset.n) > -1;
			b.classList.toggle('on', o);
			b.textContent = o ? 'Ajouté à ma demande' : 'Ajouter à ma demande';
		});
		document.querySelectorAll('input[data-n]').forEach(function (i) {
			i.checked = sel.indexOf(i.dataset.n) > -1;
		});
		document.body.classList.toggle('hs', n > 0);
		if (!n && ouvert) { panneau(false); }

		var cnt = document.getElementById('cnt');
		var nb = c.liste.length;
		if (cnt) { cnt.textContent = nb + (nb > 1 ? ' services choisis' : ' service choisi'); }
		var tot = document.getElementById('tot');
		if (tot) { tot.textContent = (c.min ? 'À partir de ' : 'Total : ') + fmt(c.total); }

		var ul = document.getElementById('bar-list');
		if (ul) {
			while (ul.firstChild) { ul.removeChild(ul.firstChild); }
			sel.forEach(function (nom) {
				var li = document.createElement('li');
				var a = document.createElement('span');
				a.className = 'nm';
				a.textContent = nom;
				var p = document.createElement('span');
				p.className = 'pr';
				var info = P[nom];
				p.textContent = c.liste.indexOf(nom) === -1 ? 'inclus' : (info ? (info[1] === 'min' ? 'dès ' : '') + fmt(info[0]) : '');
				var r = document.createElement('button');
				r.type = 'button';
				r.className = 'rm';
				r.setAttribute('data-r', nom);
				r.setAttribute('aria-label', 'Retirer ' + nom);
				r.textContent = '\u00d7';
				li.appendChild(a);
				li.appendChild(p);
				li.appendChild(r);
				ul.appendChild(li);
			});
		}

		var prix = (c.min ? 'à partir de ' : '') + fmt(c.total);
		var url = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent('Bonjour, je souhaite prendre rendez-vous pour : ' + c.liste.join(', ') + '. Total estimé : ' + prix + '.');
		['go', 'ctG'].forEach(function (id) {
			var a = document.getElementById(id);
			if (a) { a.href = url; }
		});
		var l = document.getElementById('ctL');
		if (l) { l.textContent = c.liste.join(', '); }
		var ct = document.getElementById('ctT');
		if (ct) { ct.textContent = prix; }
		var f = document.getElementById('ctF');
		var w = document.getElementById('ctW');
		if (f && w) { f.style.display = n ? 'none' : 'block'; w.style.display = n ? 'block' : 'none'; }
	}

	function basculer(nom) {
		var i = sel.indexOf(nom);
		if (i > -1) {
			sel.splice(i, 1);
		} else {
			sel.push(nom);
			var parent = P[nom] && P[nom][2];
			var j = parent ? sel.indexOf(parent) : -1;
			if (j > -1) { sel.splice(j, 1); }
		}
		sauver();
		maj();
	}

	function retirer(nom) {
		var i = sel.indexOf(nom);
		if (i > -1) { sel.splice(i, 1); }
		sauver();
		maj();
	}

	document.addEventListener('click', function (e) {
		var t = e.target;
		var b = t.closest('.tg');
		if (b) { basculer(b.dataset.n); return; }
		var r = t.closest('[data-r]');
		if (r) { retirer(r.getAttribute('data-r')); return; }
		if (t.closest('#bar-clear')) { sel = []; sauver(); maj(); return; }
		if (t.closest('#bar-toggle')) { panneau(!ouvert); return; }
		if (ouvert && !t.closest('#bar')) { panneau(false); }
	});
	document.addEventListener('change', function (e) {
		if (e.target.matches('input[data-n]')) { basculer(e.target.dataset.n); }
	});
	if (/^\/contact/.test(location.pathname)) { document.body.classList.add('ct'); }
	maj();

	/* Compteurs animés */
	function compter(el) {
		var cible = parseInt(el.dataset.count, 10) || 0;
		var suf = el.dataset.suffix || '';
		if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			el.textContent = cible + suf;
			return;
		}
		var t0 = null;
		function pas(t) {
			if (!t0) { t0 = t; }
			var p = Math.min((t - t0) / 1400, 1);
			el.textContent = Math.round(cible * p) + suf;
			if (p < 1) { requestAnimationFrame(pas); }
		}
		requestAnimationFrame(pas);
	}
	var cpt = document.querySelectorAll('[data-count]');
	if ('IntersectionObserver' in window) {
		var io2 = new IntersectionObserver(function (liste) {
			liste.forEach(function (x) {
				if (x.isIntersecting) { compter(x.target); io2.unobserve(x.target); }
			});
		}, { threshold: 0.4 });
		cpt.forEach(function (e) { io2.observe(e); });
	} else {
		cpt.forEach(function (e) { compter(e); });
	}
})();

/* ---------- Avis : défilement ---------- */
(function () {
	var track = document.getElementById('avis-track');
	if (!track) { return; }
	var orig = Array.prototype.slice.call(track.children);
	if (!orig.length) { return; }
	var copies = Math.max(1, Math.ceil(6 / orig.length));

	function ajouter(nb) {
		for (var r = 0; r < nb; r++) {
			orig.forEach(function (c) {
				var k = c.cloneNode(true);
				k.setAttribute('aria-hidden', 'true');
				track.appendChild(k);
			});
		}
	}

	ajouter(copies - 1);
	ajouter(copies);
	track.style.setProperty('--dur', (orig.length * copies * 7) + 's');
})();

/* ---------- Formulaire vers WhatsApp ---------- */
(function () {
	var f = document.getElementById('ctForm');
	if (!f) { return; }
	f.addEventListener('submit', function (e) {
		e.preventDefault();
		var nom = f.elements['nom'].value.trim();
		var tel = f.elements['tel'].value.trim();
		var msg = f.elements['message'].value.trim();
		var t = 'Bonjour, je m’appelle ' + nom + '.';
		if (tel) { t += ' Mon numéro : ' + tel + '.'; }
		t += '\n\n' + msg;
		window.open('https://wa.me/2290159080987?text=' + encodeURIComponent(t), '_blank', 'noopener');
	});
})();

/* ---------- Page Services : navigation ---------- */
(function () {
	var nav = document.getElementById('sv-nav');
	if (!nav) { return; }
	var hdr = document.querySelector('.site-header');

	function mesure() {
		if (hdr) { document.documentElement.style.setProperty('--hh', hdr.offsetHeight + 'px'); }
	}
	mesure();
	window.addEventListener('resize', mesure);
	window.addEventListener('load', mesure);

	var chips = Array.prototype.slice.call(nav.querySelectorAll('a'));
	var blocs = chips.map(function (a) {
		return document.getElementById(a.getAttribute('href').slice(1));
	}).filter(Boolean);
	if (!('IntersectionObserver' in window)) { return; }

	var io = new IntersectionObserver(function (liste) {
		liste.forEach(function (x) {
			if (!x.isIntersecting) { return; }
			chips.forEach(function (a) {
				var actif = a.getAttribute('href') === '#' + x.target.id;
				a.classList.toggle('on', actif);
				if (actif) {
					nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
				}
			});
		});
	}, { rootMargin: '-30% 0px -60% 0px' });
	blocs.forEach(function (b) { io.observe(b); });
})();

/* ---------- Menu mobile ---------- */
(function () {
	var h = document.querySelector('.site-header');
	var b = document.getElementById('burger');
	if (!h || !b) { return; }

	function fermer() {
		h.classList.remove('open');
		b.setAttribute('aria-expanded', 'false');
		b.setAttribute('aria-label', 'Ouvrir le menu');
	}

	b.addEventListener('click', function () {
		var o = h.classList.toggle('open');
		b.setAttribute('aria-expanded', o ? 'true' : 'false');
		b.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
	});
	h.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', fermer); });
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermer(); } });
	window.addEventListener('resize', function () { if (window.innerWidth > 900) { fermer(); } });

	function mesure() { document.documentElement.style.setProperty('--hh', h.offsetHeight + 'px'); }
	mesure();
	if ('ResizeObserver' in window) { new ResizeObserver(mesure).observe(h); } else { window.addEventListener('resize', mesure); }
})();
