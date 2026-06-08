document.addEventListener('DOMContentLoaded', () => {
    /* Scroll reveal */
    const els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        els.forEach(el => io.observe(el));
    } else {
        els.forEach(el => el.classList.add('in'));
    }

    /* Nav sticky */
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Logo: retour en haut sans changer l'URL */
    const homeLogo = document.getElementById('home-logo');
    homeLogo.addEventListener('click', (e) => {
        if (location.pathname === '/' || location.pathname.endsWith('/index.html')) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.replaceState(null, '', location.pathname + location.search);
        }
    });

    /* Menu mobile (hamburger) */
    const toggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const setMenu = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        mobileMenu.classList.toggle('open', open);
        nav.classList.toggle('open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });

    /* Formulaire contact → n8n */
    const WEBHOOK_URL = 'https://n8n.srv904495.hstgr.cloud/webhook/flowxify-contact';
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');
    const submitBtn = document.getElementById('form-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        if (!form.reportValidity()) return;

        /* Anti-spam : si le champ piège est rempli, on ignore silencieusement */
        if (form.site_web.value) { form.style.display = 'none'; success.style.display = 'block'; return; }

        const data = {
            nom: form.nom.value.trim(),
            email: form.email.value.trim(),
            taille_equipe: form.taille_equipe.value,
            telephone: form.telephone.value.trim(),
            message: form.message.value.trim(),
            source: 'flowxify.com',
            page: location.href
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours…';
        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.style.display = 'none';
            success.style.display = 'block';
        } catch (err) {
            errorMsg.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Prendre un premier échange (30 min)';
        }
    });
});
